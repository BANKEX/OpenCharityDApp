import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {
	AppCharityEvent, CharityEventMetaStorageData, ConfirmationResponse, ConfirmationStatusState,
	MetaStorageData
} from '../../open-charity-types';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {constant, findIndex, merge, reverse, times} from 'lodash';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {MetaDataStorageService} from '../../core/meta-data-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddCharityEventModalComponent} from './add-charity-event-modal/add-charity-event-modal.component';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {ErrorMessageService} from '../../core/error-message.service';
import { OrganizationContractEventsService } from '../../core/contracts-services/organization-contract-events.service';
import { Web3ProviderService } from '../../core/web3-provider.service';
			// tslint:disable:no-any
@Component({
	selector: 'opc-charity-events-list-base',
	template: '',
})

export class CharityEventsListBaseComponent implements OnInit, OnDestroy {
	@Input('organizationAddress') public organizationAddress: string;
	public charityEvents: AppCharityEvent[] = [];

	protected componentDestroyed: Subject<void> = new Subject<void>();

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected organizationContractEventsService: OrganizationContractEventsService,
		protected tokenContractService: TokenContractService,
		protected charityEventContractService: CharityEventContractService,
		protected zone: NgZone,
		protected metaDataStorageService: MetaDataStorageService,
		protected modal: NgbModal,
		protected organizationSharedService: OrganizationSharedService,
		protected errorMessageService: ErrorMessageService,
		protected web3ProviderService: Web3ProviderService,
	) {}

	public ngOnInit(): void {

	}

	public initEventsListeners(): void {
		this.organizationSharedService.onCharityEventAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				this.charityEvents.push(merge({}, res, {raised: 0}));
				this.updateCharityEventMetaStorageData(this.charityEvents[this.charityEvents.length - 1]);
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventAdded');
			});

		this.organizationSharedService.onCharityEventEdited()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				const i: number = findIndex(this.charityEvents, {address: res.address});
				if (i !== -1) {
					this.charityEvents[i] = res;
					this.charityEvents[i].address = res.address;
					this.charityEvents[i].confirmation = ConfirmationStatusState.PENDING;
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventEdited');
			});

		this.organizationSharedService.onCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				let i: number = findIndex(this.charityEvents, {address: res.address});

				i = i !== -1 ? i : findIndex(this.charityEvents, {internalId: res.internalId});

				if (i !== -1) {
					this.charityEvents[i].address = res.address;
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
					this.updateCharityEventMetaStorageData(this.charityEvents[i]);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventConfirmed');
			});

		this.organizationSharedService.onCharityEventFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});

				if (findIndex(this.charityEvents, {address: res.address}) !== -1) { // For CE editing
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
					return;
				}

				if (i !== -1) {
					this.charityEvents[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventFailed');
			});

		this.organizationSharedService.onCharityEventCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});

				if (findIndex(this.charityEvents, {address: res.address}) !== -1) { // For CE editing
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
					return;
				}

				if (i !== -1) {
					this.charityEvents.splice(i, 1);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventCanceled');
			});

		this.organizationSharedService.onMoveFundsToCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				const i: number = findIndex(this.charityEvents, {address: res.address});

				if (i !== -1) {
					await this.updateCharityEventRaised(this.charityEvents[i]);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onMoveFundsToCharityEventConfirmed');
			});
	}

	public async updateCharityEventsList(): Promise<void> {
		// get amount of organization incoming donations
		const charityEventsCount: number = parseInt(await this.organizationContractService.getCharityEventsCount(this.organizationAddress), 10);


		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.charityEvents = times(charityEventsCount, constant(null));

		const addedEvents = await this.organizationContractEventsService.getOrganizationEvents('CharityEventAdded', this.organizationAddress);
		const blockNumbers = {};
		for (let i = 0; i < addedEvents.length; i += 1) {
			blockNumbers[(<any>addedEvents[i].returnValues).charityEvent] = addedEvents[i].blockNumber;
		}
		await this.organizationContractService.getCharityEvents(this.organizationAddress)
			.take(charityEventsCount)
			.subscribe(async (event: { address: string, index: number }) => {

				// it is a hack. without zone.run it doesn't work properly:
				// it doesn't update charityEvents in template
				// if you change it to .detectChanges, it breaks further change detection of other comopnents
				// if you know how to fix it, please do it
				this.zone.run(async() => {
					this.charityEvents[event.index] = merge({}, await this.charityEventContractService.getCharityEventDetails(event.address, undefined, blockNumbers[event.address]), {
						confirmation: ConfirmationStatusState.CONFIRMED
					});
					this.updateCharityEventRaised(this.charityEvents[event.index]);
					this.updateCharityEventMetaStorageData(this.charityEvents[event.index]);
				});
			});
	}

	protected async updateCharityEventMetaStorageData(charityEvent: AppCharityEvent): Promise<void> {
		// TODO: add typescript interface for CE meta storage data
		let data: CharityEventMetaStorageData = (await this.getCharityEventMetaStorageData(charityEvent)).data;
		if (!data) {
			return;
		}

		if (data.image) {
			charityEvent.image = this.metaDataStorageService.convertArrayBufferToBase64( await this.metaDataStorageService.getImage(data.image.storageHash).toPromise() );
		}

		charityEvent.description = data.description;
	}

	protected getCharityEventMetaStorageData(charityEvent: AppCharityEvent): Promise<MetaStorageData> {
		return this.metaDataStorageService.getData(charityEvent.metaStorageHash).toPromise();
	}

	protected async updateCharityEventRaised(charityEvent: AppCharityEvent) {
		charityEvent.raised = await this.tokenContractService.balanceOf(charityEvent.address);
	}

	public showAddCharityEventModal() {
		let modalInstance;
		modalInstance =	this.modal.open(
			AddCharityEventModalComponent,
			{
				size: 'lg',
				windowClass: 'modal-more-lg'
			}).componentInstance;
		modalInstance.organizationContractAddress = this.organizationAddress;
	}

	public ngOnDestroy(): void {
		this.componentDestroyed.next();

	}

}
