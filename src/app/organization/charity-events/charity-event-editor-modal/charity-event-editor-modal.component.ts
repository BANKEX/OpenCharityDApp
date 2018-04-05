import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {ContractCharityEvent, MetaStorageData} from '../../../open-charity-types';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {Location} from '@angular/common';
import {ErrorMessageService} from '../../../core/error-message.service';

type CharityEventData = {
	contract: ContractCharityEvent,
	metadataStorage: MetaStorageData
};

@Component({
	templateUrl: 'charity-event-editor-modal.component.html',
	styleUrls: ['charity-event-editor-modal.component.scss']
})

export class CharityEventEditorModalComponent implements OnInit, OnDestroy {
	@Input('charityEventAddress') public charityEventAddress: string;
	@Input('organizationAddress') public organizationAddress: string;

	public name: string = '';
	public contractCharityEvent: ContractCharityEvent;
	public charityEventData: CharityEventData = null;
	public charityEventSaved: boolean = false;

	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(private router: Router,
				private route: ActivatedRoute,
				private charityEventContractService: CharityEventContractService,
				private location: Location,
				private metaDataStorageService: MetaDataStorageService,
				private errorMessageService: ErrorMessageService) {
	}

	public goBackToPreviousPage(event: Event): void {
		this.location.back();
		event.preventDefault();
	}

	public charityEventChanged(saved: boolean) {
		this.charityEventSaved = saved;
	}

	public async ngOnInit(): Promise<void> {
		this.charityEventData = await this.getCharityEventData();
	}

	public ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

	private async getCharityEventData(): Promise<CharityEventData> {
		return new Promise<CharityEventData>(async (resolve, reject) => {
			this.contractCharityEvent = await this.charityEventContractService.getCharityEventDetails(this.charityEventAddress);

			this.metaDataStorageService.getData(this.contractCharityEvent.metaStorageHash)
				.subscribe((metadataStorage: MetaStorageData) => {
						resolve({
							contract: this.contractCharityEvent,
							metadataStorage: metadataStorage
						});
					},
					(err: Error) => {
						reject(err);
						this.errorMessageService.addError(err.message, 'getCharityEventData');
					});
		});
	}
}
