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

	public isWalletStored(): boolean {
		return (localStorage.getItem(this.walletLocalStorageKey) !== null);
	}

	public removeStoredWallet(): void {
		localStorage.removeItem(this.walletLocalStorageKey);
	}

	public unlockWallet(web3: Web3, password: string) {
		try {
			web3.eth.accounts.wallet.load(password, this.walletLocalStorageKey);
		} finally {}
	}

}
