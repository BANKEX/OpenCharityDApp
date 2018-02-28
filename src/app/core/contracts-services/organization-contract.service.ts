import {Injectable} from '@angular/core';
import {Contract, TransactionReceipt, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import {merge, forEach} from 'lodash';
import Web3 from 'web3';
import {OrganizationContractAbi} from '../../contracts-abi';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ContractCharityEvent, ContractIncomingDonation} from '../../open-charity-types';

export interface Organization {
	name: string;
	address: string;
	charityEventsCount: number;
}

@Injectable()
export class OrganizationContractService {

	private organizationContract: Contract;
	private web3: Web3;
	private defaultTx: Tx;

	constructor(private web3ProviderService: Web3ProviderService,) {
		this.organizationContract = this.buildOrganizationContract();
		this.web3 = this.web3ProviderService.web3;
		this.init();
	}

	async init(): Promise<void> {
		const accounts: string[] = await this.web3.eth.getAccounts();
		this.defaultTx = {
			from: accounts[0]
		};
	}

	public getName(address: string, txOptions?: Tx): Promise<any> {
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
			address: address,
			charityEventsCount: parseInt(await this.getCharityEventsCount(address, txOptions), 10)
		}
	}

	public async isAdmin(address: string, walletAddress: string, txOptions?: Tx): Promise<boolean> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		return contract.methods.admins(walletAddress).call(txOptions);
	}


	/********************************/
	/***  IncomingDonations methods */
	/********************************/

	public addIncomingDonation(address: string, realWorldsIdentifier: string, amount: string, note: string, tags: string, txOptions?: Tx) {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.setIncomingDonation(realWorldsIdentifier, amount, note, tags).send(tx);
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
				for (let i = count - 1; i >=0; i--) {
					const address: string = await contract.methods.incomingDonationIndex(i).call(txOptions);
					source.next({address: address, index: i});
				}
			});

		return source.asObservable();
	}

	private async buildIncomingDonationsList(contract: Contract, incomingDonationCount: number): Promise<string[]> {
		const result: string[] = [];

		for (let i = 0; i < incomingDonationCount; i++) {
			const address: string = await contract.methods.incomingDonationIndex(i).call();
			result.push(address);
		}

		return result;
	}

	public moveFundsToCharityEvent(organizationAddress: string, incomingDonationAddress: string, charityEventAddress: string, amount: string, txOptions?: Tx): Promise<any> {
		const contract: Contract = this.cloneContract(this.organizationContract, organizationAddress);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.moveDonationFundsToCharityEvent(incomingDonationAddress, charityEventAddress, amount).send(tx);
	}



	// Charity Events Methods
	public addCharityEvent(address: string, charityEvent: ContractCharityEvent, txOptions?: Tx): Promise<TransactionReceipt> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.addCharityEvent(charityEvent.name, charityEvent.target, charityEvent.payed, charityEvent.tags).send(tx);
	}

	public getCharityEvents(address: string, txOptions?: Tx): Observable<{ address: string, index: number }> {
		const source: Subject<{ address: string, index: number }> = new Subject<{ address: string, index: number }>();

		const contract: Contract = this.cloneContract(this.organizationContract, address);
		contract.methods.charityEventCount().call(txOptions)
			.then(async (count: number) => {
				for (let i = count - 1; i >= 0; i--) {
					const address: string = await contract.methods.charityEventIndex(i).call(txOptions);
					source.next({address: address, index: i});
				}
			});

		return source.asObservable();
	}

	public async getCharityEventsAsync(address: string, txOptions?: Tx): Promise<string[]> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		const charityEventCount: string = await contract.methods.charityEventCount().call(txOptions);
		return this.buildCharityEventsList(contract, parseInt(charityEventCount));
	}

	private async buildCharityEventsList(contract: Contract, charityEventCount: number): Promise<string[]> {
		const result: string[] = [];

		for (let i = 0; i < charityEventCount; i++) {
			const address: string = await contract.methods.charityEventIndex(i).call();
			result.push(address);
		}

		return result;
	}



	// Utils
	private cloneContract(original: Contract, address: string): Contract {
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildOrganizationContract(): Contract {
		return new this.web3ProviderService.web3.eth.Contract(OrganizationContractAbi);
	}

}
