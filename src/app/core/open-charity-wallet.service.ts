import {Injectable} from '@angular/core';
import Web3 from 'web3';

@Injectable()
export class OpenCharityWalletService {

	private walletLocalStorageKey: string = 'web3js_wallet';

	constructor() {

	}

	public init(web3: Web3, privateKey: string, password: string) {
		web3.eth.accounts.wallet.add(privateKey);
		web3.eth.accounts.wallet.save(password);
	}


	// TODO: add possibility to use stored walled by passing a correct password
	public isWalletStored(): boolean {
		return false;
		// return (localStorage.getItem(this.walletLocalStorageKey) !== null);
	}

	public removeStoredWallet(): void {
		localStorage.removeItem(this.walletLocalStorageKey);
	}

}
