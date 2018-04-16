import {Injectable} from '@angular/core';
import {Contract, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import {merge} from 'lodash';
import {ContractCharityEvent} from '../../open-charity-types';
import {CommonSettingsService} from '../common-settings.service';
import * as moment from 'moment';
import Web3 from 'web3';
import {AuthService} from '../auth.service';

@Injectable()
export class CharityEventContractService {

	private charityEventContract: Contract;
	private web3: Web3;
	private defaultTx: Tx;

	constructor(private web3ProviderService: Web3ProviderService,
				private commonSettingsService: CommonSettingsService,
				private authService: AuthService) {
		this.charityEventContract = this.buildCharityEventContract();
		this.web3 = this.web3ProviderService.web3;
		this.init();
	}

	public async init(): Promise<void> {
		this.defaultTx = {
			from: this.authService.currentAccount
		};

		if (!this.authService.isMetamaskUsed) {
			this.defaultTx.gas = this.web3ProviderService.estimateGas(); // temp solution for test purposes; must be replaced by real gasEstimate method
		}
	}

	//#region Get data methods
	/**
	 * 	 Returns Charity Event creation date by retrieving it's block timestamp
	 *
	 * @param  {string} address Charity event address
	 * @param  {number} blockNumber	Block number (take it from transaction receipt)
	 */
	public async getDate(address: string, blockNumber: number): Promise<Date> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		const blockTimestamp = (await this.web3ProviderService.web3.eth.getBlock(blockNumber)).timestamp;
		return moment(blockTimestamp * 1000).toDate();
	}

	public getMetaStorageHash(address: string, txOptions?: Tx): Promise<string> {
		return this.cloneContract(this.charityEventContract, address).methods.metaStorageHash().call(txOptions);
	}

	public getName(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.name().call(txOptions);
	}

	public getPayed(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.payed().call(txOptions);
	}

	public getTags(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.tags().call(txOptions);
	}

	public getTarget(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.target().call(txOptions);
	}

	public async getCharityEventDetails(address: string, txOptions?: Tx): Promise<ContractCharityEvent> {
		return {
			address: this.web3.utils.toChecksumAddress(address),
			metaStorageHash: await this.getMetaStorageHash(address, txOptions),
			name: await this.getName(address, txOptions),
			payed: await this.getPayed(address, txOptions),
			target: await this.getTarget(address, txOptions),
			tags: await this.getTags(address, txOptions),
		};
	}

	public async getCharityEventsList(charityEventsAddresses: string[], txOptions?: Tx): Promise<ContractCharityEvent[]> {
		const charityEvents = [];

		// for-of is required to provide
		// sequential performing for async/await operations
		for (const address of charityEventsAddresses) {
			const charityEvent: ContractCharityEvent = await this.getCharityEventDetails(address);
			charityEvents.push(charityEvent);
		}

		return charityEvents;
	}
	//#endregion

	//#region Utils

	private cloneContract(original: Contract, address: string): Contract {
		/* tslint:disable */
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		/* tslint:enable */
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildCharityEventContract(): Contract {
		return new this.web3ProviderService.web3.eth.Contract(this.commonSettingsService.abis.CharityEvent);
	}
	//#endregion

}
