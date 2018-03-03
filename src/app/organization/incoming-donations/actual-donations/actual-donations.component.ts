import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {constant, find, findIndex, merge, reverse, times} from 'lodash';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState} from '../../../open-charity-types';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';

@Component({
	selector: 'opc-actual-incoming-donations',
	templateUrl: 'actual-donations.component.html',
	styleUrls: ['actual-donations.component.scss']
})
export class ActualIncomingDonationsComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public changer: string = "sms";
	public organizationContractAddress: string;
	public incomingDonations: AppIncomingDonation[] = [];

	constructor(
		private organizationContractService: OrganizationContractService,
		private incomingDonationContractService: IncomingDonationContractService,
		private charityEventContractService: CharityEventContractService,
		private tokenContractService: TokenContractService,
		private modalService: NgbModal,
		private router: Router,
		private route: ActivatedRoute,
		private zone: NgZone
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => { this.organizationContractAddress = params["address"]; });
		await this.updateIncomingDonationsList();
	}

	public async updateIncomingDonationsList(): Promise<void> {
		// get amount of organization incoming donations
		const incomingDonationsCount: number = parseInt(await this.organizationContractService.getIncomingDonationsCount(this.organizationContractAddress), 10);

		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.incomingDonations = times(incomingDonationsCount, constant(null));


		this.organizationContractService.getIncomingDonations(this.organizationContractAddress)
			.take(incomingDonationsCount)
			.subscribe(async (res: { address: string, index: number }) => {

				// it is a hack. without zone.run it doesn't work properly:
				// it doesn't update incoming donations in template
				// if you change it to .detectChanges, it breaks further change detection of other components
				// if you know how to fix it, please do it
				this.zone.run(async () => {
					this.incomingDonations[res.index] = merge({}, await this.incomingDonationContractService.getIncomingDonationDetails(res.address), {
						confirmation: ConfirmationStatusState.CONFIRMED
					});
					await this.updateIncomingDonationAmount(this.incomingDonations[res.index]);
				});

			});
	}

	public async updateIncomingDonationAmount(incomingDonation: AppIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}

	public getRWID(incomingDonation: AppIncomingDonation): string {
		if(incomingDonation == null) return "";
		return incomingDonation.realWorldsIdentifier;
	}

	public getTags(incomingDonation: AppIncomingDonation): string {
		if(incomingDonation == null) return "";
		return incomingDonation.tags;
	}

	public getAmount(incomingDonation: AppIncomingDonation): string {
		if(incomingDonation == null) return "";
		return incomingDonation.amount;
	}

	public isDonation(incomingDonation: AppIncomingDonation): boolean {
		return incomingDonation != null;
	}

	public async openSendDonationFundsModal(event: Event, incomingDonation: AppIncomingDonation): Promise<void> {
		event.stopPropagation();
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationContractAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.organizationContractAddress = this.organizationContractAddress;
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
		modalRef.componentInstance.fundsMoved.subscribe((incomingDonationAddress: string) => {
			const incDonation = find(this.incomingDonations, {address: incomingDonationAddress});
			if (this.incomingDonations) {
				this.updateIncomingDonationAmount(incDonation);
			}
		});
	}

	public toDetails(incomingDonation: AppIncomingDonation): void {
		this.router.navigate([`/organization/${this.organizationContractAddress}/donation/${incomingDonation.address}/details`]);
	}

	public toAllDonations() {
		this.router.navigate([`/organization/${this.organizationContractAddress}/alldonations`]);
	}

	public addClick() {
		this.router.navigate([`/organization/${this.organizationContractAddress}/donation/editor`]);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
