import {Web3ProviderService} from '../web3-provider.service';
import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {Contract, Tx} from 'web3/types';
import {OPEN_CHARITY_TOKEN_CONTRACT_ABI} from '../../contracts-abi';

@Injectable()
export class TokenContractService {
	private web3: Web3;
	private TOKEN_CONTRACT_ADDRESS: string = environment.tokenAddress;

	private tokenContract: Contract;

	constructor(private web3ProviderService: Web3ProviderService) {
		this.web3 = web3ProviderService.web3;
		this.tokenContract = new this.web3.eth.Contract(OPEN_CHARITY_TOKEN_CONTRACT_ABI, this.TOKEN_CONTRACT_ADDRESS);
	}


	public balanceOf(address: string, txOptions?: Tx): Promise<string> {
		return this.tokenContract.methods.balanceOf(address).call(txOptions);
	}


}
