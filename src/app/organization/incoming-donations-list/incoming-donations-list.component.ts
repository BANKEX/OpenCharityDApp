import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';
import {Subject} from 'rxjs/Subject';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {OrganizationContractEventsService} from '../../core/contracts-services/organization-contract-events.service';
import {constant, find, findIndex, merge, reverse, times} from 'lodash';
import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState} from '../../open-charity-types';
import {OrganizationSharedService} from '../services/organization-shared.service';


@Component({
	selector: 'opc-incoming-donations-list',
	templateUrl: 'incoming-donations-list.component.html',
	styleUrls: ['incoming-donations-list.component.scss']
})
export class IncomingDonationsListComponent implements OnInit, OnDestroy {
	@Input('organizationContractAddress') organizationContractAddress: string;
	public incomingDonations: AppIncomingDonation[] = [];
	private componentDestroyed: Subject<void> = new Subject<void>();


	constructor(private organizationContractService: OrganizationContractService,
				private incomingDonationContractService: IncomingDonationContractService,
				private tokenContractService: TokenContractService,
				private charityEventContractService: CharityEventContractService,
				private organizationContractEventsService: OrganizationContractEventsService,
				private modalService: NgbModal,
				private organizationSharedService: OrganizationSharedService,
				private zone: NgZone
	) {
	}

	public ngOnInit(): void {
		this.updateIncomingDonationsList();
		this.initEventsListeners();
	}

	private initEventsListeners(): void {
		this.organizationSharedService.onIncomingDonationAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppIncomingDonation) => {
				this.incomingDonations.push(res);
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});


		this.organizationSharedService.onIncomingDonationConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.incomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.incomingDonations[i].address = res.address;
					this.incomingDonations[i].confirmation = ConfirmationStatusState.CONFIRMED;
				}
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});

		this.organizationSharedService.onIncomingDonationFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.incomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.incomingDonations[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});


		this.organizationSharedService.onIncomingDonationCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.incomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.incomingDonations.splice(i, 1);
				}
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});

	}


	// show ID cards with loading animation and replace it
	// by data when it is loaded
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

	public isPending(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.PENDING);
	}

	public isConfirmed(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.CONFIRMED);
	}

	public isFailed(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.FAILED);
	}

	public isErrored(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.ERROR);
	}


	public async updateIncomingDonationAmount(incomingDonation: AppIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}

	public async updateIncomingDonationsAmount(incomingDonations: AppIncomingDonation[]) {
		incomingDonations.forEach((incomingDonation) => {
			this.updateIncomingDonationAmount(incomingDonation);
		});
	}

	public async openSendDonationFundsModal(incomingDonation: AppIncomingDonation): Promise<void> {
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationContractAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
		modalRef.componentInstance.fundsMoved.subscribe((incomingDonationAddress: string) => {
			debugger;
			const incDonation = find(this.incomingDonations, {address: incomingDonationAddress});
			if (this.incomingDonations) {
				this.updateIncomingDonationAmount(incDonation);
			}
		});
	}


	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

}
