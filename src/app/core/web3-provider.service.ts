import {Injectable} from '@angular/core';
import Web3 from 'web3';

declare var window;

@Injectable()
export class Web3ProviderService {
	private _web3: Web3;

	get web3(): Web3 {
		return this._web3;
	}

	constructor() {
	}

	public async initMetamaskProvider(): Promise<Web3> {
		this._web3 = new Web3(window.web3.currentProvider);
		await this.init();

		return this._web3;
	}

	public async initWalletProvider(): Promise<Web3> {
		this._web3 = new Web3(new Web3.providers.HttpProvider(environment.rpcProviderUrl));
		await this.init();

		return this._web3;
	}

	public isMetamaskInstalled(): boolean {
		return (typeof window.web3 !== 'undefined');
	}


	// only for test purposes. method to estimateGas is required;
	public estimateGas(): string {
		return this.web3.utils.numberToHex(4600000);
	}

	private async init() {
	}

}
