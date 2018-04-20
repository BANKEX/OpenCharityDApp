import {Component, OnInit} from '@angular/core';
import {PromiEvent, TransactionReceipt} from 'web3/types';
import {PendingTransactionSourceType} from '../../pending-transaction.types';
import {ConfirmationStatusState, ContractCharityEvent, ContractIncomingDonation, MetaStorageData, MetaStorageDataType, MetaStorageFile} from '../../open-charity-types';
import {OrganizationSharedService} from '../../organization/services/organization-shared.service';
import {merge} from 'lodash';
import {LoadingOverlayService} from '../../core/loading-overlay.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {ErrorMessageService} from '../../core/error-message.service';
import {UploadFile} from 'ngx-file-drop';
import {MetaDataStorageService} from '../../core/meta-data-storage.service';
import {ToastyService} from 'ng2-toasty';

type CharityEventData = {
	contract: ContractCharityEvent,
	details: ''
};

@Component({
	selector: 'opc-test-data',
	templateUrl: 'test-data.component.html',
	styleUrls: ['test-data.component.scss']
})
export class TestDataComponent implements OnInit {

	public organization: string;
	public organizations: string[] = [];

	public addTestDataLoading: boolean = false;
	public organizationsLoadings: Object[] = [];

	constructor(private organizationSharedService: OrganizationSharedService,
				private loadingOverlayService: LoadingOverlayService,
				private organizationContractService: OrganizationContractService,
				private errorMessageService: ErrorMessageService,
				private metaDataStorageService: MetaDataStorageService,
				private toastyService: ToastyService) {
	}

	public async ngOnInit(): Promise<void> {
	}

	public async pushOrganization() {
		const organizations = this.organization.replace(/(\s)|(\')/g, '');

		organizations.split(',').forEach((item) => {
			if (item.length === 42)
				this.organizations.push(item);
		});

		setTimeout(() => {
			this.organization = '';
		});
	}

	public async addTestData() {
		const dataCE: CharityEventData[] = this.getTestDataCharityEvents();
		const dataIDsource: string[] = this.getTestDataIncomingDonationsSource();
		const dataID: ContractIncomingDonation[] = this.getTestDataIncomingDonations();

		this.addTestDataLoading = true;

		let i = 0;
		for (let organizationAddress of this.organizations) {
			const loadingOrganization = {
				name: organizationAddress,

				loadingCE: 0,
				lengthCE: dataCE.length,
				successCE: false,
				indexCE: 1,

				loadingIDsource: 0,
				lengthIDsource: dataID.length,
				successIDsource: false,
				indexIDsource: 1,

				loadingID: 0,
				lengthID: dataID.length,
				successID: false,
				indexID: 1,

				success: false
			};

			this.organizationsLoadings[i] = loadingOrganization;

			let index = 0;
			for (let item of dataCE) {
				await this.addCharityEvent(item.contract, item.details, organizationAddress);
				loadingOrganization.indexCE = index + 1;
				loadingOrganization.loadingCE = (index + 1) * 100 / dataCE.length;
				loadingOrganization.successCE = loadingOrganization.loadingCE === 100;
				index++;
			}

			index = 0;
			for (let item of dataIDsource) {
				await this.addIncomingDonationSource(item, organizationAddress);
				loadingOrganization.indexIDsource = index + 1;
				loadingOrganization.loadingIDsource = (index + 1) * 100 / dataIDsource.length;
				loadingOrganization.successIDsource = loadingOrganization.loadingIDsource === 100;
				index++;
			}

			index = 0;
			for (let item of dataID) {
				await this.addIncomingDonation(item, organizationAddress);
				loadingOrganization.indexID = index + 1;
				loadingOrganization.loadingID = (index + 1) * 100 / dataID.length;
				loadingOrganization.successID = loadingOrganization.loadingID === 100;
				index++;
			}

			loadingOrganization.success = true;
			i++;
		}
	}

	/*********************************/
	/****** Charity Event ************/
	/*********************************/

	private async addCharityEvent(data: ContractCharityEvent, details: string, organizationContractAddress: string): Promise<void> {
		const newCharityEvent: ContractCharityEvent = data;

		let charityEventInternalId: string = this.organizationSharedService.makePseudoRandomHash(newCharityEvent);
		let newCharityEventAddress: string = null;

		try {
			this.loadingOverlayService.showOverlay(true);
			// save meta data into storage
			const metaStorageHash: string = await this.storeToMetaStorage(newCharityEvent, details);
			merge(newCharityEvent, {metaStorageHash: metaStorageHash});

			this.toastyService.warning('Adding ' + newCharityEvent.name + ' transaction pending');

			const transaction: PromiEvent<TransactionReceipt> = this.organizationContractService.addCharityEvent(organizationContractAddress, newCharityEvent);

			transaction.on('transactionHash', (hash) => {
				this.loadingOverlayService.hideOverlay();
			});
			// submit transaction to blockchain
			const receipt: TransactionReceipt = await transaction;

			// check if transaction succseed
			if (receipt.events && receipt.events.CharityEventAdded) {
				this.toastyService.success('Adding ' + newCharityEvent.name + ' transaction confirmed');
			} else {
				this.toastyService.error('Adding ' + newCharityEvent.name + ' transaction failed');
			}
		} catch (e) {
			// TODO: listen for failed transaction
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.toastyService.error('Adding ' + newCharityEvent.name + ' transaction canceled');
			} else {
				// TODO:  global errors notifier
				this.errorMessageService.addError(e.message, 'addCharityEvent');
			}
			this.loadingOverlayService.hideOverlay();
		}
	}

	private async storeToMetaStorage(charityEvent: ContractCharityEvent, charityEventDetails: string): Promise<string> {
		const dataToStore: MetaStorageData = {
			type: MetaStorageDataType.CHARITY_EVENT,
			searchDescription: '',
			data: {
				title: charityEvent.name,
				description: charityEventDetails
			}
		};

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
							storageHash: await this.metaDataStorageService.storeData((<FileReader>e.target).result).first().toPromise()
						});
					});

					reader.readAsArrayBuffer(file);

				}, (err) => {
					reject(err);
					this.errorMessageService.addError(err, 'storeFileToMetaStorage');
				});
			} else {
				reader.addEventListener('load', async (e) => {
					resolve({
						name: uploadFile.name,
						type: uploadFile.type,
						size: uploadFile.size,
						storageHash: await this.metaDataStorageService.storeData((<FileReader>e.target).result).first().toPromise()
					});
				});

				reader.readAsArrayBuffer(uploadFile);
			}
		});

	}

	/*********************************/
	/****** Incoming Donation ********/
	/*********************************/

	private async addIncomingDonation(data: ContractIncomingDonation, organizationAddress: string) {
		const newIncomingDonation: ContractIncomingDonation = data;

		let incomingDonationInternalId: string = this.organizationSharedService.makePseudoRandomHash(newIncomingDonation);
		let receipt: TransactionReceipt;
		let transaction: PromiEvent<TransactionReceipt>;
		let newIncomingDonationAddress: string = null;
		try {
			this.toastyService.warning('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction pending');
			this.loadingOverlayService.showOverlay(true);
			transaction = this.organizationContractService.addIncomingDonation(
				organizationAddress,
				newIncomingDonation.realWorldsIdentifier,
				newIncomingDonation.amount,
				newIncomingDonation.note,
				newIncomingDonation.tags,
				newIncomingDonation.sourceId
			);
			transaction.on('transactionHash', (hash) => {
				this.loadingOverlayService.hideOverlay();
			});
			receipt = await transaction;

			if (receipt.events && receipt.events.IncomingDonationAdded) {
				this.toastyService.success('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction confirmed');
			} else {
				this.toastyService.error('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction failed');
			}
		} catch (e) {
			this.loadingOverlayService.hideOverlay();
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.toastyService.error('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction canceled');
			} else {
				// TODO:  global errors notifier
				this.errorMessageService.addError(e.message, 'addIncomingDonation');
			}
		}

	}

	/*********************************/
	/**** Incoming Donation Source ***/
	/*********************************/

	private async addIncomingDonationSource(newSourceName: string, organizationAddress: string): Promise<void> {
		this.toastyService.warning('Adding ' + newSourceName + ' transaction pending');

		try {
			await this.organizationContractService.addNewIncomingDonationsSource(organizationAddress, newSourceName);
		} catch (e) {
			this.loadingOverlayService.hideOverlay();
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.toastyService.error('Adding ' + newSourceName + ' transaction canceled');
			} else {
				// TODO:  global errors notifier
				this.errorMessageService.addError(e.message, 'addIncomingDonationSource');
			}
		}

		this.toastyService.success('Adding ' + newSourceName + ' transaction confirmed');
	}

	/*********************************/
	/****** Test Data ****************/
	/*********************************/

	private getTestDataCharityEvents(): Array<CharityEventData> {
		const data: CharityEventData[] = [
			{
				contract: {
					name: 'Лекарства на выписку',
					target: '70000',
					payed: '0',
					tags: '0x12'
				},
				details: ''
			},
			{
				contract: {
					name: 'Пропал Сергеев Сергей Сергеевич',
					target: '100000',
					payed: '0',
					tags: '0x04'
				},
				details: ''
			},
			{
				contract: {
					name: 'Образование для детей мигрантов',
					target: '880000',
					payed: '0',
					tags: '0x0e'
				},
				details: ''
			}
		];

		return data;
	}

	private getTestDataIncomingDonations(): Array<ContractIncomingDonation> {
		const data: ContractIncomingDonation[] = [
			{
				amount: '70',
				note: 'детям на лечение',
				realWorldsIdentifier: 'sber123456789',
				sourceId: '0',
				tags: '0x12'
			},
			{
				amount: '427',
				note: 'на лекарства',
				realWorldsIdentifier: '412323445645',
				sourceId: '1',
				tags: '0x1c'
			},
			{
				amount: '900',
				note: 'на разные нужды',
				realWorldsIdentifier: 'tinkoff234345346',
				sourceId: '2',
				tags: '0x00'
			}
		];

		return data;
	}

	private getTestDataIncomingDonationsSource(): Array<string> {
		return [
			'Яндекс.Деньги',
			'Tinkoff',
			'Сбербанк'
		];
	}
}
