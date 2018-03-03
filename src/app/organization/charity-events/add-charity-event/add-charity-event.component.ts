import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {TransactionReceipt} from 'web3/types';
import {ConfirmationStatusState, ContractCharityEvent} from '../../../open-charity-types';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {UploadFile} from 'ngx-file-drop';
import {merge} from 'lodash';

@Component({
	selector: 'opc-add-charity-event',
	templateUrl: 'add-charity-event.component.html',
	styleUrls: ['add-charity-event.component.scss']
})
export class AddCharityEventComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;

	public charityEventForm: FormGroup;
	public selectedTagsBitmask: number = 0;

	public charityEventImage: UploadFile;


	constructor(
		private organizationContractService: OrganizationContractService,
		private fb: FormBuilder,
		private tagsBitmaskService: TagsBitmaskService,
		private organizationSharedService: OrganizationSharedService,
		private metaDataStorageService: MetaDataStorageService
	) {
	}

	public ngOnInit(): void {
		this.initForm();

	}

	public async submitForm(): Promise<void> {
		if (this.charityEventForm.invalid) {
			return;
		}
		const f = this.charityEventForm.value;

		const tags = '0x' + this.tagsBitmaskService.convertToHexWithLeadingZeros(this.selectedTagsBitmask);
		const newCharityEvent: ContractCharityEvent = {
			name: f.name,
			target: f.target,
			payed: (f.payed) ? f.payed : 0,
			tags: tags
		};

		let charityEventInternalId: string = this.organizationSharedService.makePseudoRandomHash(newCharityEvent);
		let newCharityEventAddress: string = null;

		try {
			// save meta data into storage
			const metaStorageHash: string = await this.storeToMetaStorage(newCharityEvent, f.details);
			console.log(metaStorageHash);
			merge(newCharityEvent, {metaStorageHash: metaStorageHash});


			// show pending charity event in ui
			this.organizationSharedService.charityEventAdded(merge({}, newCharityEvent, {
				internalId: charityEventInternalId,
				confirmation: ConfirmationStatusState.PENDING
			}));

			// submit transaction to blockchain
			const receipt: TransactionReceipt = await this.organizationContractService.addCharityEvent(this.organizationContractAddress, newCharityEvent);

			// check if transaction succseed
			if (receipt.events && receipt.events.CharityEventAdded) {
				newCharityEventAddress = receipt.events.CharityEventAdded.returnValues['charityEvent'];
				this.organizationSharedService.charityEventConfirmed(charityEventInternalId, newCharityEventAddress);
			} else {
				this.organizationSharedService.charityEventFailed(charityEventInternalId, newCharityEventAddress);
			}

			// reset form values
			this.initForm();
		} catch (e) {
			// TODO: listen for failed transaction
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.charityEventCanceled(charityEventInternalId, newCharityEventAddress);
			} else {
				// TODO:  global errors notifier
				console.warn(e.message);
			}
		}
	}

	private async storeToMetaStorage(charityEvent: ContractCharityEvent, charityEventDetails: string): Promise<any> {

		let attachmentHash: string;
		if(this.charityEventImage) {
			attachmentHash = await this.storeImageToMetaStorage(this.charityEventImage);
		}

		return this.metaDataStorageService.storeData({
			title: charityEvent.name,
			description: charityEventDetails,
			attachment: attachmentHash
		}, true)
			.first()
			.toPromise();
	}

	private async storeImageToMetaStorage(image: UploadFile): Promise<any> {
		return new Promise((resolve, reject) => {

			image.fileEntry.file((file) => {
				const reader: FileReader = new FileReader();

				reader.addEventListener('load', async (e) => {
					resolve(await this.metaDataStorageService.storeData((<any>e.target).result).first().toPromise());
				});

				reader.readAsArrayBuffer(file);

			}, (err) => {
				reject(err);
			});
		})

	}


	public bitmaskChanged(bitmask: number) {
		this.selectedTagsBitmask = bitmask;
	}

	private initForm(): void {
		this.charityEventForm = this.fb.group({
			name: ['', Validators.required],
			target: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
			payed: '',
			details: ''
		});
		this.charityEventImage = null;
	}

	public submitToMetaStorage() {
		const name = this.charityEventForm.value.name;
		const description = this.charityEventForm.value.name;

		this.metaDataStorageService.storeData({
			name: name,
			description: description,
			attachment: this.charityEventForm
		})
			.subscribe((metaStorageHash: string) => {

			}, (err: any) => {
				console.error(err.message);
			})
	}

	public getData(hash: string) {
		this.metaDataStorageService.getData(hash)
			.subscribe((res: any) => {
				},
				(err: any) => {
					console.error(err);
				});
	}

	public onImageAdded($event) {
		this.charityEventImage = $event.files[0];
	}


}
