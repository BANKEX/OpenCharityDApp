import {Injectable} from '@angular/core';

@Injectable()
export class MetamaskCheckService {

	constructor(
		private window: Window
	) {

	}

	public isMetamaskInstalled(): boolean {
		return ((<any>this.window).web3 !== undefined);
	}


}
