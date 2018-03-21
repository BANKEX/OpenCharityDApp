import {Component, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {TransactionReceipt} from 'web3/types';
import {
	ConfirmationStatusState, ContractCharityEvent, MetaStorageDataType,
	MetaStorageFile
} from '../../../open-charity-types';
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
	@ViewChild('fileDropAttachments', {read: ElementRef}) fileDropElement: ElementRef;

	public charityEventForm: FormGroup;
	public selectedTagsBitmask: number = 0;

	public charityEventImage: UploadFile;
	public charityEventImagePreview: string;

	public attachedFiles: Array<File>;

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
		this.changeStylesDropFiles();
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
		const dataToStore: any = {
			type: MetaStorageDataType.CHARITY_EVENT,
			searchDescription: '',
			data: {
				title: charityEvent.name,
				description: charityEventDetails
			}
		};

		debugger;

		if (this.charityEventImage) {
			dataToStore.data.image = await this.storeFileToMetaStorage(this.charityEventImage);
		}

		if (this.attachedFiles.length) {
			dataToStore.data.attachments = [];

			await Promise.all(this.attachedFiles.map(async (file) => {
				dataToStore.data.attachments.push(await this.storeFileToMetaStorage(file));
			}));
		}

		return this.metaDataStorageService.storeData(dataToStore, true)
			.first()
			.toPromise();
	}

	private async storeFileToMetaStorage(uploadFile: UploadFile | File): Promise<MetaStorageFile> {
		return new Promise<MetaStorageFile>((resolve, reject) => {

			const reader: FileReader = new FileReader();

			if (uploadFile instanceof UploadFile) {
				uploadFile.fileEntry.file((file) => {
					reader.addEventListener('load', async (e) => {
						resolve({
							name: file.name,
							type: file.type,
							size: file.size,
							storageHash: await this.metaDataStorageService.storeData((<any>e.target).result).first().toPromise()
						});
					});

					reader.readAsArrayBuffer(file);

				}, (err) => {
					reject(err);
				});
			} else {
				reader.addEventListener('load', async (e) => {
					resolve({
						name: uploadFile.name,
						type: uploadFile.type,
						size: uploadFile.size,
						storageHash: await this.metaDataStorageService.storeData((<any>e.target).result).first().toPromise()
					});
				});

				reader.readAsArrayBuffer(uploadFile);
			}
		});

	}

	private changeStylesDropFiles() {
		const dropContent: HTMLDivElement = this.fileDropElement.nativeElement.children[0].children[0];

		dropContent.style.display = 'block';
		dropContent.style.padding = '15px';
		dropContent.style.textAlign = 'center';
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
		this.charityEventImagePreview = null;
		this.attachedFiles = [];
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

		const fileEntry = this.charityEventImage.fileEntry;

		fileEntry.file((file: File) => {
			const reader: FileReader = new FileReader();

			reader.onload = () => {
				this.charityEventImagePreview = reader.result;
			};

			reader.readAsDataURL(file);
		});
	}

	public onFilesAdded($event) {
		if ($event.files instanceof FileList)
			Array.from($event.files).forEach((file: File) => {
				this.attachedFiles.push(file);
			});
		else
			$event.files.forEach((item: UploadFile) => {
				item.fileEntry.file((file: File) => {
					this.attachedFiles.push(file);
				});
			});
	}

	public removeFile(index: number) {
		this.attachedFiles.splice(index, 1);
	}

	public removeCharityEventImage() {
		this.charityEventImage = null;
		this.charityEventImagePreview = null;
	}
}
