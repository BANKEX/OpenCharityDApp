import {Injectable} from '@angular/core';
import {Contract, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import {merge} from 'lodash';
import Web3 from 'web3';
import {TokenContractService} from './token-contract.service';
import {ContractIncomingDonation} from '../../open-charity-types';
import {CommonSettingsService} from '../common-settings.service';
import * as moment from 'moment';
import {AuthService} from '../auth.service';


@Injectable()
export class IncomingDonationContractService {
	private incomingDonationContract: Contract;
	private web3: Web3;
	private defaultTx: Tx;

	constructor(private web3ProviderService: Web3ProviderService,
				private tokenContractService: TokenContractService,
				private commonSettingsService: CommonSettingsService,
				private authService: AuthService) {
		this.incomingDonationContract = this.buildIncomingDonationContract();
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

	/**
	 * @dev Returns Incoming Donation creation date by retrieving it's block timestamp
	 *
	 * @param  {string} address Incoming donation address
	 * @param  {number} blockNumber	Block number
	 */
	public async getDate(address: string, blockNumber: number): Promise<Date> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		const blockTimestamp = (await this.web3ProviderService.web3.eth.getBlock(blockNumber)).timestamp;
		return moment(blockTimestamp * 1000).toDate();
	}

	public getNote(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.note().call(txOptions);
	}

	public getRealWorldIdentifier(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.realWorldIdentifier().call(txOptions);
	}

	public getTags(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.tags().call(txOptions);
	}

	public getSourceId(address: string, txOptions?: Tx): Promise<string> {
		const contract: Contract = this.cloneContract(this.incomingDonationContract, address);
		return contract.methods.sourceId().call(txOptions);
	}


	public async getIncomingDonationDetails(address: string, txOptions?: Tx): Promise<ContractIncomingDonation> {
		return {
			realWorldsIdentifier: await this.getRealWorldIdentifier(address, txOptions),
			address: this.web3.utils.toChecksumAddress(address),
			amount: await this.tokenContractService.balanceOf(address),
			note: await this.getNote(address, txOptions),
			tags: await this.getTags(address, txOptions),
			sourceId: await this.getSourceId(address, txOptions)
		};
	}

	private cloneContract(original: Contract, address: string): Contract {
		/* tslint:disable */
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		/* tslint:enable */
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildIncomingDonationContract(): Contract {
		return new this.web3ProviderService.web3.eth.Contract(this.commonSettingsService.abis.IncomingDonation);
	}

}
