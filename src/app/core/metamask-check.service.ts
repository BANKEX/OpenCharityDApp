import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {Web3ProviderService} from './web3-provider.service';


@Injectable()
export class MetamaskCheckService {

	private web3: Web3;

	constructor(
		private window: Window,
		private web3ProviderService: Web3ProviderService
	) {
		this.web3 = this.web3ProviderService.web3;
	}

	public isMetamaskInstalled(): boolean {
		return (this.getWindowWeb3() !== undefined);
	}

	public async isMetamaskLocked(): Promise<boolean> {
		const accounts: string[] = await this.web3.eth.getAccounts();

		return !(accounts && accounts.length !== 0);
	}

	public async isCorrectNetwork(): Promise<boolean> {
		const netId: number = await this.web3.eth.net.getId();
		console.log(netId);
		return (netId === environment.networkId);
	}

	private getWindowWeb3(): Web3 {
		return (<any>this.window).web3;
	}


}
