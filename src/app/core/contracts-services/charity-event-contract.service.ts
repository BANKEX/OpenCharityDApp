import {Injectable} from '@angular/core';
import {Contract, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import {merge} from 'lodash';
import Web3 from 'web3';
import {CharityEventContractAbi} from '../../contracts-abi';
import {ContractCharityEvent} from '../../open-charity-types';




@Injectable()
export class CharityEventContractService {

	private charityEventContract: Contract;
	private web3: Web3;
	private defaultTx: Tx;

	constructor(private web3ProviderService: Web3ProviderService,) {
		this.charityEventContract = this.buildCharityEventContract();
		this.web3 = this.web3ProviderService.web3;
		this.init();
	}

	async init(): Promise<void> {
		const accounts: string[] = await this.web3.eth.getAccounts();
		this.defaultTx = {
			from: accounts[0]
		};
	}

	/************************/
	/** Get data methods ****/
	/************************/

	public getMetaStorageHash(address: string, txOptions?: Tx): Promise<string> {
		return this.cloneContract(this.charityEventContract, address).methods.metaStorageHash().call(txOptions);
	}

	public getName(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.name().call(txOptions);
	}

	public getTarget(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.target().call(txOptions);
	}

	public getPayed(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.payed().call(txOptions);
	}

	public getTags(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.charityEventContract, address);
		return contract.methods.tags().call(txOptions);
	}

	public async getCharityEventDetails(address: string, txOptions?: Tx): Promise<ContractCharityEvent> {
		return {
			metaStorageHash: await this.getMetaStorageHash(address, txOptions),
			name: await this.getName(address, txOptions),
			address: address,
			target: await this.getTarget(address, txOptions),
			payed: await this.getPayed(address, txOptions),
			tags: await this.getTags(address, txOptions)
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


	/************************/
	/** Utils ***************/
	/************************/
	private cloneContract(original: Contract, address: string): Contract {
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildCharityEventContract(): Contract {
		return new this.web3ProviderService.web3.eth.Contract(CharityEventContractAbi);
	}

}
