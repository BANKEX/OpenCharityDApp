import {Component, Input, OnInit, Output, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {Tag, TagsBitmaskService} from '../../services/tags-bitmask.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {TransactionReceipt} from 'web3/types';
import {
	ConfirmationStatusState, ContractCharityEvent, MetaStorageData, MetaStorageDataType,
	MetaStorageFile
} from '../../../open-charity-types';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {UploadFile} from 'ngx-file-drop';
import {merge} from 'lodash';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {LoadingTransparentOverlayService} from '../../../core/loading-transparent-overlay.service';
import {PendingTransactionService} from '../../../core/pending-transactions.service';
import {PendingTransactionSourceType} from '../../../pending-transaction.types';

type CharityEventData = {
	contract: ContractCharityEvent,
	metadataStorage: MetaStorageData
};

@Component({
	selector: 'opc-charity-event-form',
	templateUrl: 'charity-event-form.component.html',
	styleUrls: ['charity-event-form.component.scss']
})
export class CharityEventFormComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;
	@Input('charityEventData') charityEventData: CharityEventData = null;
	@Output() charityEventChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

	@ViewChild('fileDropAttachments', {read: ElementRef}) fileDropElement: ElementRef;

	public charityEventForm: FormGroup;
	public selectedTagsBitmask: number = 0;

	public charityEventImage: any;
	public charityEventImagePreview: SafeUrl;
	public charityEventTags: Array<Tag>;

	public attachedFiles: Array<File>;

	public loadingImage: boolean;

	private organizationAddress: string = null;
	private charityEventAddress: string = null;

	constructor(
		private organizationContractService: OrganizationContractService,
		private fb: FormBuilder,
		private tagsBitmaskService: TagsBitmaskService,
		private organizationSharedService: OrganizationSharedService,
		private metaDataStorageService: MetaDataStorageService,
		private route: ActivatedRoute,
		private sanitize: DomSanitizer,
		private loadingTransparentOverlayService: LoadingTransparentOverlayService,
		private pendingTransactionService: PendingTransactionService
	) {}

	public ngOnInit(): void {
		this.initForm();
		this.changeStylesDropFiles();

		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
			this.charityEventAddress = params['event'];
		});
	}

	public async submitForm(): Promise<void> {
		if (this.charityEventForm.invalid) {
			return;
		}

		if (this.charityEventData) {
			await this.editCharityEvent();
		} else {
			await this.addCharityEvent();
		}
	}

	public async addCharityEvent(): Promise<void> {
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

			this.pendingTransactionService.addPending(
				newCharityEvent.name,
				'Adding ' + newCharityEvent.name + ' transaction pending',
				PendingTransactionSourceType.CE
			);

			// submit transaction to blockchain
			const receipt: TransactionReceipt = await this.organizationContractService.addCharityEvent(this.organizationContractAddress, newCharityEvent);

			// check if transaction succseed
			if (receipt.events && receipt.events.CharityEventAdded) {
				newCharityEventAddress = receipt.events.CharityEventAdded.returnValues['charityEvent'];
				this.organizationSharedService.charityEventConfirmed(charityEventInternalId, newCharityEventAddress);
				this.pendingTransactionService.addConfirmed(
					newCharityEvent.name,
					'Adding ' + newCharityEvent.name + ' transaction confirmed',
					PendingTransactionSourceType.CE
				);
			} else {
				this.organizationSharedService.charityEventFailed(charityEventInternalId, newCharityEventAddress);
				this.pendingTransactionService.addFailed(
					newCharityEvent.name,
					'Adding ' + newCharityEvent.name + ' transaction failed',
					PendingTransactionSourceType.CE
				);
			}

			// reset form values
			this.initForm();
		} catch (e) {
			// TODO: listen for failed transaction
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.charityEventCanceled(charityEventInternalId, newCharityEventAddress);
			} else {
				// TODO:  global errors notifier
				console.error(e.message);
			}
		}
	}

	public async editCharityEvent(): Promise<void> {
		const f = this.charityEventForm.value;

		const tags = '0x' + this.tagsBitmaskService.convertToHexWithLeadingZeros(this.selectedTagsBitmask);
		const newCharityEvent: ContractCharityEvent = {
			name: f.name,
			target: f.target,
			payed: (f.payed) ? f.payed : 0,
			tags: tags,
			metaStorageHash: this.charityEventData.contract.metaStorageHash,
			address: this.charityEventData.contract.address
		};

		let charityEventInternalId: string = this.organizationSharedService.makePseudoRandomHash(newCharityEvent);
		let receipt: TransactionReceipt;
		let charityEventAddress: string = null;

		const isCharityEventChanged = this.isCharityEventChanged(newCharityEvent);
		const isMetaStorageChanged = this.isMetaStorageChanged(f.details);
		const isSubmitEnable = isCharityEventChanged || isMetaStorageChanged;

		if (!isSubmitEnable) return;

		try {
			this.loadingTransparentOverlayService.showOverlay();

			if (isMetaStorageChanged) {
				const newMetaStorageHash: string = await this.storeToMetaStorage(newCharityEvent, f.details);
				merge(newCharityEvent, {metaStorageHash: newMetaStorageHash});

				if (!isCharityEventChanged) {
					receipt = await this.organizationContractService.updateCharityEventMetaStorageHash(
						this.organizationAddress,
						this.charityEventAddress,
						newMetaStorageHash
					);
				}
			}

			if (isCharityEventChanged) {
				receipt = await this.organizationContractService.updateCharityEventDetails(
					this.organizationAddress,
					newCharityEvent
				);
			}

			if (receipt && receipt.events && receipt.events.CharityEventEdited) {
				charityEventAddress = receipt.events.CharityEventEdited.returnValues['charityEvent'];
				this.organizationSharedService.charityEventConfirmed(charityEventInternalId, charityEventAddress);
			} else {
				this.organizationSharedService.charityEventFailed(charityEventInternalId, charityEventAddress);
			}

			this.charityEventData = await this.getCharityEventData(newCharityEvent);

			await this.initForm();

			this.loadingTransparentOverlayService.hideOverlay();
		} catch (e) {
			// TODO: listen for failed transaction
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.charityEventCanceled(charityEventInternalId, charityEventAddress);
			} else {
				// TODO:  global errors notifier
				console.error(e.message);
				this.loadingTransparentOverlayService.hideOverlay();
			}
		}
	}

	private isCharityEventChanged(newCharityEvent: ContractCharityEvent): boolean {
		const charityEvent: ContractCharityEvent = this.charityEventData.contract;

		return newCharityEvent.name !== charityEvent.name ||
			newCharityEvent.target !== charityEvent.target ||
			newCharityEvent.tags !== charityEvent.tags;
	}

	private isMetaStorageChanged(details: string): boolean {
		const metadataStorage: MetaStorageData = this.charityEventData.metadataStorage;

		if (metadataStorage.data.description !== details)
			return true;

		// If image removed
		if (metadataStorage.data.image && !this.charityEventImage)
			return true;

		// If added new image
		if (!metadataStorage.data.image && this.charityEventImage)
			return true;

		// If added new image not same
		if (this.charityEventImage instanceof UploadFile &&
			this.charityEventImage.relativePath !== metadataStorage.data.image.name)
			return true;

		// If added new files
		if (!metadataStorage.data.attachments && this.attachedFiles.length)
			return true;

		// If added new files now same and if same length
		if (metadataStorage.data.attachments &&
			(metadataStorage.data.attachments.length === this.attachedFiles.length)) {
			let isSameFile: boolean;

			for (let file of this.attachedFiles) {
				isSameFile = metadataStorage.data.attachments.findIndex((item) => {
					return item.name === file.name;
				}) !== -1;

				if (!isSameFile) return true;
			}
		}

		// If files removed or added new file
		if (metadataStorage.data.attachments &&
			(this.attachedFiles.length !== metadataStorage.data.attachments.length))
			return true;

		return false;
	}

	public onImageAdded($event) {
		this.charityEventImage = $event.files[0];

		const fileEntry = this.charityEventImage.fileEntry;

		this.loadingImage = true;

		fileEntry.file((file: File) => {
			const reader: FileReader = new FileReader();

			reader.onload = () => {
				this.charityEventImagePreview = this.sanitize.bypassSecurityTrustUrl(reader.result);
				this.loadingImage = false;
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

	public bitmaskChanged(bitmask: number) {
		this.selectedTagsBitmask = bitmask;
	}

	private async initForm() {
		this.charityEventForm = this.fb.group({
			name: [ '', Validators.required ],
			target: [ '', [ Validators.required, Validators.min(1), Validators.pattern(/^\d+$/) ] ],
			payed: '',
			details: ''
		});

		this.loadingImage = false;
		this.charityEventImage = null;
		this.charityEventImagePreview = null;
		this.attachedFiles = [];

		await this.setForm();
	}

	private async setForm() {
		let data: CharityEventData,
			metadataStorage: MetaStorageData,
			contract: ContractCharityEvent,
			attachments: Array<any>,
			tags: Array<any>,
			image: MetaStorageFile;

		data = this.charityEventData;

		if (!data) return;

		contract = data.contract;
		metadataStorage = data.metadataStorage;

		image = metadataStorage.data ? metadataStorage.data.image : null;
		attachments = metadataStorage.data.attachments ? metadataStorage.data.attachments : [];
		tags = contract.tags ? this.parseBitmaskIntoTags(contract.tags) : [];

		this.charityEventForm = this.fb.group({
			name: [ contract.name, Validators.required ],
			target: [ contract.target, [ Validators.required, Validators.min(1), Validators.pattern(/^\d+$/) ] ],
			payed: contract.payed ? contract.payed : '',
			details: metadataStorage.data.description ? metadataStorage.data.description : ''
		});

		this.attachedFiles = Object.assign([], attachments);
		this.charityEventTags = tags;

		if (image) {
			this.loadingImage = true;

			const charityEventImage = await this.getImage(image.storageHash);

			this.charityEventImagePreview = await this.getPreviewImage(charityEventImage, image.type);

			this.loadingImage = false;

			this.charityEventImage = this.metaDataStorageService.convertArrayBufferToFile(charityEventImage, image.type, image.name);
		}
	}

	private async getCharityEventData(contractCharityEvent: ContractCharityEvent): Promise<CharityEventData> {
		return new Promise<CharityEventData>(async(resolve, reject) => {

			this.metaDataStorageService.getData(contractCharityEvent.metaStorageHash)
				.subscribe((metadataStorage: MetaStorageData) => {
						resolve({
							contract: contractCharityEvent,
							metadataStorage: metadataStorage
						});
					},
					(err: any) => {
						reject(err);
					});
		});
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
			let attachments = this.charityEventData.metadataStorage.data.attachments;

			await Promise.all(this.attachedFiles.map(async (file) => {
				let metaStorageFile;

				metaStorageFile = attachments ? attachments.find((item) => {
					return item.name === file.name;
				}) : -1;

				dataToStore.data.attachments.push(
					metaStorageFile !== -1 ? metaStorageFile : await this.storeFileToMetaStorage(file)
				);
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

	private getData(hash: string): Promise<MetaStorageFile> {
		return new Promise<MetaStorageFile>((resolve, reject) => {
			this.metaDataStorageService.getData(hash)
				.subscribe((res: any) => {
						resolve(res);
					},
					(err: any) => {
						reject(err);
					});
		});
	}

	private getImage(hash: string): Promise<ArrayBuffer> {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			this.metaDataStorageService.getImage(hash)
				.subscribe((res: any) => {
						resolve(res);
					},
					(err: any) => {
						reject(err);
					});
		});
	}

	private getPreviewImage(arrayBuffer: ArrayBuffer, type: string): Promise<SafeUrl> {
		return new Promise<SafeUrl>((resolve, reject) => {
			const reader: FileReader = new FileReader();

			const blob = new Blob( [ arrayBuffer ], { type: type } );

			reader.onload = () => {
				resolve(this.sanitize.bypassSecurityTrustUrl(reader.result));
			};

			reader.onerror = (err) => {
				reject(err);
			};

			reader.readAsDataURL(blob);
		});
	}

	private parseBitmaskIntoTags(tags: string): Tag[] {
		const bitmask = parseInt(tags, 16);

		this.selectedTagsBitmask = bitmask;

		return this.tagsBitmaskService.parseBitmaskIntoTags(bitmask);
	}
}
