import {Inject, Injectable} from '@angular/core';
import Web3 from 'web3';
import {Web3ProviderService} from './web3-provider.service';


@Injectable()
export class MetamaskCheckService {

	private web3: Web3;

	constructor(
		@Inject('Window') private window: Window,
		private web3ProviderService: Web3ProviderService
	) {
	}

	public isMetamaskInstalled(): boolean {
		return (this.getWindowWeb3() !== undefined);
	}

	public async isMetamaskLocked(): Promise<boolean> {
		const accounts: string[] = await this.web3ProviderService.web3.eth.getAccounts();
		return !(accounts && accounts.length !== 0);
	}

	public async isCorrectNetwork(): Promise<boolean> {
		const netId: number = await this.web3ProviderService.web3.eth.net.getId();
		return (netId === environment.networkId);
	}

	private getWindowWeb3(): Web3 {
		/* tslint:disable-next-line */
		return (<any>this.window).web3;
	}


}
