import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState, FundsMovedToCharityEvent} from '../../open-charity-types';
import {Subject} from 'rxjs/Subject';
import {ActivatedRoute, Router} from '@angular/router';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {assign, constant, filter, find, findIndex, merge, reverse, times, sum} from 'lodash';
import {IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {AddIncomingDonationModalComponent} from './add-incoming-donation-modal/add-incoming-donation-modal.component';
import {IncomingDonationSendFundsModalComponent} from './incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorMessageService} from '../../core/error-message.service';
import * as moment from 'moment';
import {EventLog} from 'web3/types';
import {OrganizationContractEventsService} from '../../core/contracts-services/organization-contract-events.service';

@Component({
	selector: 'opc-incoming-donations-list-base',
	template: ''
})
export class IncomingDonationsListBaseComponent implements OnInit, OnDestroy {
	@Input('organizationAddress') public organizationAddress: string;

	public incomingDonations: AppIncomingDonation[] = [];
	public displayedIncomingDonations = [];
	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(protected router: Router,
				protected route: ActivatedRoute,
				protected tokenContractService: TokenContractService,
				protected organizationContractService: OrganizationContractService,
				protected incomingDonationContractService: IncomingDonationContractService,
				protected zone: NgZone,
				protected organizationSharedService: OrganizationSharedService,
				protected modal: NgbModal,
				protected errorMessageService: ErrorMessageService,
				protected organizationContractEventsService: OrganizationContractEventsService
	) {}

	public ngOnInit() {
		console.log('base ngInit');
		if ( !this.organizationAddress) {
			this.route.params.subscribe(params => {
				this.organizationAddress = params['address'];
			});
		}
	}

	public ngOnDestroy() {
		this.componentDestroyed.next();
	}

	public initEventsListeners(): void {
		this.organizationSharedService.onIncomingDonationAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppIncomingDonation) => {
				this.displayedIncomingDonations.push(res);
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationAdded');
			});

		this.organizationSharedService.onIncomingDonationConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.displayedIncomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.displayedIncomingDonations[i].address = res.address;
					this.displayedIncomingDonations[i].confirmation = ConfirmationStatusState.CONFIRMED;
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationConfirmed');
			});

		this.organizationSharedService.onIncomingDonationFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.displayedIncomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.displayedIncomingDonations[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationFailed');
			});

		this.organizationSharedService.onIncomingDonationCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.displayedIncomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.displayedIncomingDonations.splice(i, 1);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationCanceled');
			});
	}

	public async updateIncomingDonationsList(): Promise<void> {
		// get amount of organization incoming donations
		const incomingDonationsCount: number = parseInt(await this.organizationContractService.getIncomingDonationsCount(this.organizationAddress), 10);

		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.incomingDonations = times(incomingDonationsCount, constant(null));


		this.organizationContractService.getIncomingDonations(this.organizationAddress)
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
					await this.getIncomingDonationSourceName(this.incomingDonations[res.index]);
					await this.getSumOfMovedFunds(this.incomingDonations[res.index]);
					this.displayedIncomingDonations[res.index] = this.incomingDonations[res.index];
				});

			});
	}


	public async updateIncomingDonationAmount(incomingDonation: AppIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}

	public async getIncomingDonationSourceName(incomingDonation: AppIncomingDonation): Promise<void> {
		incomingDonation.sourceName = await this.organizationContractService.getIncomingDonationSourceName(
			this.organizationAddress,
			parseInt(incomingDonation.sourceId)
		);
	}

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}

	public addClick() {
		let modalInstance;
		modalInstance =	this.modal.open(AddIncomingDonationModalComponent, {size: 'lg'}).componentInstance;
		modalInstance.organizationAddress = this.organizationAddress;
	}

	public selectedSourceChanged(sourceId: number) {
		if (sourceId === -1) { this.displayedIncomingDonations = this.incomingDonations; return; }

		this.displayedIncomingDonations = filter(this.incomingDonations, (incd: AppIncomingDonation) => {
			return incd.sourceId === sourceId.toString();
		});
	}

	private async getSumOfMovedFunds(incomingDonation: AppIncomingDonation): Promise<void> {
		const transactions: number[] = [];

		await this.organizationContractEventsService.getCharityEventsByID(this.organizationAddress, incomingDonation.address)
			.subscribe(async (res: EventLog[]) => {
				res.forEach(async (log: EventLog) => {
					const eventValues: FundsMovedToCharityEvent = <FundsMovedToCharityEvent>log.returnValues;
					transactions.push(parseInt(eventValues.amount));
				});

				incomingDonation.movedFunds = sum(transactions);
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'getCharityEventTransactions');
			});
	}
}
