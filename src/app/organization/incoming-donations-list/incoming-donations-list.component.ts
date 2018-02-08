import {OrganizationContractService} from '../organization-contract.service';
import {Component, Input, OnInit} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {IncomingDonation, IncomingDonationContractService} from '../incoming-donation-contract.service';
import {Subject} from 'rxjs/Subject';
import {TokenContractService} from '../../core/token-contract.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {CharityEventContractService} from '../charity-event-contract.service';

@Component({
	selector: 'opc-incoming-donations-list',
	templateUrl: 'incoming-donations-list.component.html',
	styleUrls: ['incoming-donations-list.component.scss']
})
export class IncomingDonationsListComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;
	incomingDonations: IncomingDonation[] = [];
	private componentDestroyed: Subject<void> = new Subject<void>();


	constructor(private organizationContractService: OrganizationContractService,
				private incomingDonationContractService: IncomingDonationContractService,
				private tokenContractService: TokenContractService,
				private charityEventContractService: CharityEventContractService,
				private modalService: NgbModal,
	) {
	}

	ngOnInit(): void {
		this.updateIncomingDonationsList();

		this.organizationContractService.onIncomingDonationAdded(this.organizationContractAddress)
		    .takeUntil(this.componentDestroyed)
		    .subscribe((event: any) => {

		            this.updateIncomingDonationsList();
		        },
		        (err) => {
		            alert(`Error: ${err}`);
		        });
	}

	public async updateIncomingDonationsList(): Promise<void> {
		const incomingDonationsList: string[] = await this.organizationContractService.getIncomingDonations(this.organizationContractAddress);

		const incomingDonations = [];
		for (const address of incomingDonationsList) {
			const incomingDonation: IncomingDonation = await this.incomingDonationContractService.getIncomingDonationDetails(address);
			incomingDonations.push(incomingDonation);
		}
		this.incomingDonations = incomingDonations;

		this.updateIncomingDonationsAmount(this.incomingDonations);
	}

	public async moveToCharityEvent(donationAddress: string, targetEventAddress: string, amount: string): Promise<void> {
		try {
			const transactoin = await this.incomingDonationContractService.moveToCharityEvent(donationAddress, targetEventAddress, amount);
			console.log(transactoin);
		} catch (e) {
			console.log(e);
		}
	}

	public async updateIncomingDonationsAmount(incomingDonations: IncomingDonation[]) {
		incomingDonations.forEach(async (incomingDonation) => {
			incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
		});
	}

	public async openSendDonationFundsModal(incomingDonation: IncomingDonation): Promise<void> {
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEvents(this.organizationContractAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

}
