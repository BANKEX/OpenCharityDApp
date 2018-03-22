import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {ContractCharityEvent, MetaStorageData} from '../../../open-charity-types';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';

type CharityEventData = {
	contract: ContractCharityEvent,
	metadataStorage: MetaStorageData
};
import {Location} from '@angular/common';

@Component({
	templateUrl: 'charity-event-editor.component.html',
	styleUrls: ['charity-event-editor.component.scss']
})
export class CharityEventEditorComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string = null;
	public charityEventAddress: string = null;
	public name: string = '';
	public transactions: any[] = [];
	public contractCharityEvent: ContractCharityEvent;
	public charityEventData: CharityEventData = null;
	public charityEventSaved: boolean = false;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private charityEventContractService: CharityEventContractService,
		private location: Location,
		private metaDataStorageService: MetaDataStorageService
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
			this.charityEventAddress = params['event'];
		});

		this.charityEventData = await this.getCharityEventData();
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

	public goBackToPreviousPage(event: Event): void {
		this.location.back();
		event.preventDefault();
	}

	private async getCharityEventData(): Promise<CharityEventData> {
		return new Promise<CharityEventData>(async(resolve, reject) => {
			this.contractCharityEvent = await this.charityEventContractService.getCharityEventDetails(this.charityEventAddress);

			this.metaDataStorageService.getData(this.contractCharityEvent.metaStorageHash)
				.subscribe((metadataStorage: MetaStorageData) => {
						resolve({
							contract: this.contractCharityEvent,
							metadataStorage: metadataStorage
						});
					},
					(err: any) => {
						reject(err);
					});
		});
	}

	public charityEventChanged(saved: boolean) {
		this.charityEventSaved = saved;
	}
}
