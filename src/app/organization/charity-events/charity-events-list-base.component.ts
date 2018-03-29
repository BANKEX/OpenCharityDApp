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

@Component({
	selector: 'opc-charity-events-list-base',
	template: '',
})

export class CharityEventsListBaseComponent implements OnInit, OnDestroy {
	@Input('organizationAddress') organizationAddress: string;
	public charityEvents: AppCharityEvent[] = [];

	protected componentDestroyed: Subject<void> = new Subject<void>();

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected tokenContractService: TokenContractService,
		protected charityEventContractService: CharityEventContractService,
		protected zone: NgZone,
		protected metaDataStorageService: MetaDataStorageService,
		protected modal: NgbModal,
		protected organizationSharedService: OrganizationSharedService
	) {

	}

	ngOnInit(): void {

	}

	public initEventsListeners(): void {
		this.organizationSharedService.onCharityEventAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				this.charityEvents.push(merge({}, res, {raised: 0}));

				// console.log(this.charityEvents.slice(0, 6).reverse());

				this.updateCharityEventMetaStorageData(this.charityEvents[this.charityEvents.length - 1]);
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
			});


		this.organizationSharedService.onCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {
				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
				if (i !== -1) {
					this.charityEvents[i].address = res.address;
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
				}
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
			});

		this.organizationSharedService.onCharityEventFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
				if (i !== -1) {
					this.charityEvents[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
			});


		this.organizationSharedService.onCharityEventCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
				if (i !== -1) {
					this.charityEvents.splice(i, 1);
				}
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
			});

		this.organizationSharedService.onMoveFundsToCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				const i: number = findIndex(this.charityEvents, {address: res.address});

				if (i !== -1) {
					await this.updateCharityEventRaised(this.charityEvents[i]);
				}
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
			});
	}

	public async updateCharityEventsList(): Promise<void> {
		// get amount of organization incoming donations
		const charityEventsCount: number = parseInt(await this.organizationContractService.getCharityEventsCount(this.organizationAddress), 10);


		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.charityEvents = times(charityEventsCount, constant(null));


		await this.organizationContractService.getCharityEvents(this.organizationAddress)
			.take(charityEventsCount)
			.subscribe(async (res: { address: string, index: number }) => {

				// it is a hack. without zone.run it doesn't work properly:
				// it doesn't update charityEvents in template
				// if you change it to .detectChanges, it breaks further change detection of other comopnents
				// if you know how to fix it, please do it
				this.zone.run(async() => {
					this.charityEvents[res.index] = merge({}, await this.charityEventContractService.getCharityEventDetails(res.address), {
						confirmation: ConfirmationStatusState.CONFIRMED
					});

					this.updateCharityEventRaised(this.charityEvents[res.index]);
					this.updateCharityEventMetaStorageData(this.charityEvents[res.index]);
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

	ngOnDestroy(): void {
		this.componentDestroyed.next();

	}

}
