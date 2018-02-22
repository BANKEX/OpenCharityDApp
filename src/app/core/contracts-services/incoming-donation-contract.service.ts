import {Injectable} from '@angular/core';
import {Contract, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import {merge} from 'lodash';
import Web3 from 'web3';
import {TokenContractService} from './token-contract.service';
import {IncomingDonationContractAbi} from '../../contracts-abi';

export interface IncomingDonation {
	realWorldsIdentifier: string;
	address: string;
	amount: string;
	note: string;
	tags: string;
}


@Injectable()
export class IncomingDonationContractService {
	private incomingDonationContract: Contract;
	private web3: Web3;
	private defaultTx: Tx;

	constructor(private web3ProviderService: Web3ProviderService,
				private tokenContractService: TokenContractService) {
		this.incomingDonationContract = this.buildIncomingDonationContract();
		this.web3 = this.web3ProviderService.web3;
		this.init();
	}

	async init(): Promise<void> {
		const accounts: string[] = await this.web3.eth.getAccounts();
		this.defaultTx = {
			from: accounts[0]
		};
	}

	public getRealWorldIdentifier(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.realWorldIdentifier().call(txOptions);
	}


	public getNote(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.note().call(txOptions);
	}

	public getTags(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.tags().call(txOptions);
	}


	public async getIncomingDonationDetails(address: string, txOptions?: Tx): Promise<IncomingDonation> {
		return {
			realWorldsIdentifier: await this.getRealWorldIdentifier(address, txOptions),
			address: address,
			amount: await this.tokenContractService.balanceOf(address),
			note: await this.getNote(address, txOptions),
			tags: await this.getTags(address, txOptions)
		};
	}

	public moveToCharityEvent(address: string, targetEventAddress: string, amount: string, txOptions?: Tx): Promise<any> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		const tx: Tx = merge({}, this.defaultTx, txOptions);
		return contract.methods.moveToCharityEvent(targetEventAddress, amount).send(tx);
	}


	private cloneContract(original: Contract, address: string): Contract {
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildIncomingDonationContract(): Contract {
		return new this.web3ProviderService.web3.eth.Contract(IncomingDonationContractAbi);
	}

}
