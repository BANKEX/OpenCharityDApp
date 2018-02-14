import {Injectable} from '@angular/core';
import Web3 from 'web3';


@Injectable()
export class MetamaskCheckService {

	constructor(
		private window: Window
	) {

	}

	public isMetamaskInstalled(): boolean {
		return (this.getWindowWeb3() !== undefined);
	}

	public async isMetamaskLocked(): Promise<boolean> {
		const accounts: string[] = await this.getWindowWeb3().eth.getAccounts((err, accounts) => {
			return accounts;
		});

		return !(accounts && accounts.length !== 0);
	}

	private getWindowWeb3(): Web3 {
		return (<any>this.window).web3;
	}


}
