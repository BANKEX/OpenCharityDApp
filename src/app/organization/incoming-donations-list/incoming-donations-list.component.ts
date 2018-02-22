import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {IncomingDonation, IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';
import {Subject} from 'rxjs/Subject';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {OrganizationContractEventsService} from '../../core/contracts-services/organization-contract-events.service';
import {reverse, times, constant, findOne} from 'lodash';
import {IncomingDonationContractEventsService} from '../../core/contracts-services/incoming-donation-contract-events.service';


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
				private incomingDonationContractEventsService: IncomingDonationContractEventsService,
				private modalService: NgbModal,
				private cd: ChangeDetectorRef
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
				this.cd.detectChanges();
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
				await this.updateIncomingDonationAmount(this.incomingDonations[res.index]);
				this.cd.detectChanges();
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

	public async updateIncomingDonationAmount(incomingDonation: IncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}

	public async updateIncomingDonationsAmount(incomingDonations: IncomingDonation[]) {
		incomingDonations.forEach((incomingDonation) => {
			this.updateIncomingDonationAmount(incomingDonation);
		});
	}

	public async openSendDonationFundsModal(incomingDonation: IncomingDonation): Promise<void> {
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationContractAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
		modalRef.componentInstance.fundsMoved.subscribe(this.listenForFundsMovedEvent.bind(this));
	}

	private listenForFundsMovedEvent(incomingDonationAddress: string) {
		this.incomingDonationContractEventsService.onFundsMovedToCharityEvent(incomingDonationAddress)
			.subscribe((res) => {
				debugger;
				const incomingDonation = findOne(this.incomingDonations, {address: incomingDonationAddress});
				if (incomingDonation) {
					console.log('update');
					this.updateIncomingDonationAmount(incomingDonation);
				}
			}, (err) => {
				debugger;
				console.log(err);
			});
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

}
