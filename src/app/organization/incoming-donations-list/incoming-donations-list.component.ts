import {OrganizationContractService} from '../services/organization-contract.service';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {IncomingDonation, IncomingDonationContractService} from '../services/incoming-donation-contract.service';
import {Subject} from 'rxjs/Subject';
import {TokenContractService} from '../../core/token-contract.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {CharityEventContractService} from '../services/charity-event-contract.service';
import {OrganizationContractEventsService} from '../services/organization-contract-events.service';
import {reverse, times, constant} from 'lodash';


@Component({
	selector: 'opc-incoming-donations-list',
	templateUrl: 'incoming-donations-list.component.html',
	styleUrls: ['incoming-donations-list.component.scss']
})
export class IncomingDonationsListComponent implements OnInit, OnDestroy {
	@Input('organizationContractAddress') organizationContractAddress: string;
	incomingDonations: IncomingDonation[] = [];
	private componentDestroyed: Subject<void> = new Subject<void>();


	constructor(private organizationContractService: OrganizationContractService,
				private incomingDonationContractService: IncomingDonationContractService,
				private tokenContractService: TokenContractService,
				private charityEventContractService: CharityEventContractService,
				private organizationContractEventsService: OrganizationContractEventsService,
				private modalService: NgbModal,
	) {
	}

	public ngOnInit(): void {
		this.updateIncomingDonationsList();

		this.organizationContractEventsService.onIncomingDonationAdded(this.organizationContractAddress)
			.takeUntil(this.componentDestroyed)
			.subscribe((event: any) => {
					this.addNewIncomingDonation(event.returnValues.incomingDonation);
				},
				(err) => {
					alert(`Error: ${err.message}`);
				});

	}

	public async addNewIncomingDonation(address: string) {
		const newItemIndex = this.incomingDonations.length;
		this.incomingDonations.push(null);
		this.incomingDonationContractService.getIncomingDonationDetails(address)
			.then((incomingDonation: IncomingDonation) => {
				this.incomingDonations[newItemIndex] = incomingDonation;
			});
	}

	// show ID cards with loading animation and replace it
	// by data when it is loaded
	public async updateIncomingDonationsList(): Promise<void> {
		// get amount of organization incoming donations
		const incomingDonationsCount: number = parseInt(await this.organizationContractService.getIncomingDonationsCount(this.organizationContractAddress), 10);

		// initialize empty array
		// null values means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.incomingDonations = times(incomingDonationsCount, constant(null));

		this.organizationContractService.getIncomingDonations(this.organizationContractAddress)
			.takeWhile((val: { address: string, index: number }, index: number) => index < incomingDonationsCount)
			.subscribe(async (res: { address: string, index: number }) => {
				this.incomingDonations[res.index] = await this.incomingDonationContractService.getIncomingDonationDetails(res.address);
			});
	}

	// show list of incoming donations only when all data is loaded
	public async updateIncomingDonationsListSync(): Promise<void> {
		const incomingDonationsList: string[] = reverse(await this.organizationContractService.getIncomingDonations(this.organizationContractAddress));

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
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationContractAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

}
