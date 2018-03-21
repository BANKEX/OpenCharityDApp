import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {
	AppCharityEvent, CharityEventMetaStorageData, ConfirmationStatusState,
	MetaStorageData
} from '../../open-charity-types';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {constant, findIndex, merge, reverse, times} from 'lodash';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {MetaDataStorageService} from '../../core/meta-data-storage.service';

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
		protected metaDataStorageService: MetaDataStorageService
	) {

	}

	ngOnInit(): void {

	}

	public async updateCharityEventsList(): Promise<void> {
		// get amount of organization incoming donations
		const charityEventsCount: number = parseInt(await this.organizationContractService.getCharityEventsCount(this.organizationAddress), 10);


		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.charityEvents = times(charityEventsCount, constant(null));


		this.organizationContractService.getCharityEvents(this.organizationAddress)
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
			return
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

	ngOnDestroy(): void {
		this.componentDestroyed.next();

	}

}
