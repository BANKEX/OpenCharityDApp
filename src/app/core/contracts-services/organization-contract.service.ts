import {Injectable} from '@angular/core';
import {Contract, PromiEvent, TransactionReceipt, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import {forEach, merge} from 'lodash';
import Web3 from 'web3';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ContractCharityEvent} from '../../open-charity-types';
import {CommonSettingsService} from '../common-settings.service';
import {AuthService} from '../auth.service';

export type Organization = {
	name: string;
	address: string;
	charityEventsCount: number;
};

@Injectable()
export class OrganizationContractService {

	private organizationContract: Contract;
	private web3: Web3;
	private defaultTx: Tx;

	// Store last used contract to don't clone it all the time;
	private lastContractAddress: string;
	private lastContract: Contract;

	constructor(private web3ProviderService: Web3ProviderService,
				private authService: AuthService,
				private commonSettingsService: CommonSettingsService) {
		this.organizationContract = this.buildOrganizationContract();
		this.web3 = this.web3ProviderService.web3;
		this.defaultTx = {
			from: this.authService.currentAccount,
		};
		if (!this.authService.isMetamaskUsed) {
			this.defaultTx.gas = this.web3ProviderService.estimateGas(); // temp solution for test purposes; must be replaced by real gasEstimate method
		}
	}


	public async isAdmin(address: string, walletAddress: string, txOptions?: Tx): Promise<boolean> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.admins(walletAddress).call(txOptions);
	}

	//#region Get Organization Data

	public getName(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.name().call(txOptions);
	}

	public getCharityEventsCount(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.charityEventCount().call(txOptions);
	}

	public async getOrganization(address: string, txOptions?: Tx): Promise<Organization> {
		return {
			name: await this.getName(address, txOptions),
			address: this.web3.utils.toChecksumAddress(address),
			charityEventsCount: parseInt(await this.getCharityEventsCount(address, txOptions), 10)
		};
	}

	//#endregion

	//#region Incoming Donations methods

	public addNewIncomingDonationsSource(address: string, sourceName: string, txOptions?: Tx): Promise<void> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.addIncomingDonationSource(sourceName).send(tx);
	}

	public addIncomingDonation(address: string, realWorldsIdentifier: string, amount: string, note: string, tags: string, sourceId: string, txOptions?: Tx) {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.setIncomingDonation(realWorldsIdentifier, amount, note, tags, sourceId).send(tx);
	}

	public getIncomingDonationsSourcesIds(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.incomingDonationsSourceIds().call(txOptions);
	}

	public getIncomingDonationSourceName(address: string, sourceId: number, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.incomingDonationsSourceName(sourceId).call(txOptions);
	}

	public async getIncomingDonationsCount(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.incomingDonationCount().call(txOptions);
	}

	public async getIncomingDonationsAsync(address: string, txOptions?: Tx): Promise<string[]> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const incomingDonationCount: string = await contract.methods.incomingDonationCount().call(txOptions);
		return this.buildIncomingDonationsList(contract, parseInt(incomingDonationCount));
	}

	public getIncomingDonations(address: string, txOptions?: Tx): Observable<{ address: string, index: number }> {
		const source: Subject<{ address: string, index: number }> = new Subject<{ address: string, index: number }>();

		const contract: Contract = this.cloneContract(this.organizationContract, address);
		contract.methods.incomingDonationCount().call(txOptions)
			.then(async (count: number) => {
				for (let i = count - 1; i >= 0; i--) {
					source.next({address: await contract.methods.incomingDonationIndex(i).call(txOptions), index: i});
				}
			});

		return source.asObservable();
	}

	public moveFundsToCharityEvent(organizationAddress: string, incomingDonationAddress: string, charityEventAddress: string, amount: string, txOptions?: Tx): PromiEvent<TransactionReceipt> {
		const contract: Contract = this.cloneContract(this.organizationContract, organizationAddress);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.moveDonationFundsToCharityEvent(incomingDonationAddress, charityEventAddress, amount).send(tx);
	}

	//#endregion

	//#region Charity Events methods

	public addCharityEvent(address: string, charityEvent: ContractCharityEvent, txOptions?: Tx): PromiEvent<TransactionReceipt> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.addCharityEvent(charityEvent.name, charityEvent.target, charityEvent.payed, charityEvent.tags, charityEvent.metaStorageHash).send(tx);
	}

	public getCharityEvents(address: string, txOptions?: Tx): Observable<{ address: string, index: number }> {
		const source: Subject<{ address: string, index: number }> = new Subject<{ address: string, index: number }>();

		const contract: Contract = this.cloneContract(this.organizationContract, address);
		contract.methods.charityEventCount().call(txOptions)
			.then(async (count: number) => {
				for (let i = count - 1; i >= 0; i--) {
					source.next({address: await contract.methods.charityEventIndex(i).call(txOptions), index: i});
				}
			});

		return source.asObservable();
	}

	public async getCharityEventsAsync(address: string, txOptions?: Tx): Promise<string[]> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const charityEventCount: string = await contract.methods.charityEventCount().call(txOptions);
		return this.buildCharityEventsList(contract, parseInt(charityEventCount));
	}

	public updateCharityEventMetaStorageHash(organizationAddress: string, charityEventAddress: string, newMetaStorageHash: string, txOptions?: Tx): PromiEvent<TransactionReceipt> {
		const contract: Contract = this.cloneContract(this.organizationContract, organizationAddress);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.updateCharityEventMetaStorageHash(charityEventAddress, newMetaStorageHash).send(tx);
	}

	public updateCharityEventDetails(organizationAddress: string, charityEvent: ContractCharityEvent, txOptions?: Tx): PromiEvent<TransactionReceipt> {
		const contract: Contract = this.cloneContract(this.organizationContract, organizationAddress);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.updateCharityEventDetails(charityEvent.address, charityEvent.name, charityEvent.target, charityEvent.tags, charityEvent.metaStorageHash).send(tx);
	}

	private async buildCharityEventsList(contract: Contract, charityEventCount: number): Promise<string[]> {
		const result: string[] = [];

		for (let i = 0; i < charityEventCount; i++) {
			const address: string = await contract.methods.charityEventIndex(i).call();
			result.push(address);
		}

		return result;
	}

	//#endregion

	//#region  Utils

	private cloneContract(original: Contract, address: string): Contract {
		if (this.lastContractAddress === address) {
			return this.lastContract;
		}
		/* tslint:disable */
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		/* tslint:enable */
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		this.lastContract = contract;
		this.lastContractAddress = address;

		return <Contract> contract;
	}

	private buildOrganizationContract(address?: string): Contract {
		return new this.web3ProviderService.web3.eth.Contract(this.commonSettingsService.abis.Organization, address);
	}

	private async buildIncomingDonationsList(contract: Contract, incomingDonationCount: number): Promise<string[]> {
		const result: string[] = [];

		for (let i = 0; i < incomingDonationCount; i++) {
			const address: string = await contract.methods.incomingDonationIndex(i).call();
			result.push(address);
		}

		return result;
	}

	//#endregion
}
