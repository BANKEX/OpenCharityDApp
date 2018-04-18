import {Injectable, Injector} from '@angular/core';
import {OpenCharityWalletService} from './open-charity-wallet.service';
import {Web3ProviderService} from './web3-provider.service';
import {Router} from '@angular/router';
import Web3 from 'web3';
import {PrivateKey, Account} from 'web3/types';
import {BN} from 'bn.js/lib/bn';
import {AbstractControl, ValidatorFn} from '@angular/forms';
import {ErrorMessageService} from './error-message.service';
import {LoadingOverlayService} from './loading-overlay.service';

@Injectable()
export class AuthService {
	private _currentAccount: string;
	private _isMetamaskUsed: boolean = false;
	private _isWeb3WalletUsed: boolean = false;
	private web3: Web3;


	get currentAccount(): string {
		return this._currentAccount;
	}

	get isMetamaskUsed(): boolean {
		return this._isMetamaskUsed;
	}

	get isWeb3WalletUsed(): boolean {
		return this._isWeb3WalletUsed;
	}

	// this is required to allow usage
	// of AuthService as APP_INITIALIZER
	private get router(): Router {
		return this.injector.get(Router);
	}

	private get errorMessageService(): ErrorMessageService {
		return this.injector.get(ErrorMessageService);
	}

	private get loadingOverlayService(): LoadingOverlayService {
		return this.injector.get(LoadingOverlayService);
	}

	constructor(private web3ProviderService: Web3ProviderService,
				private openCharityWalletService: OpenCharityWalletService,
				private injector: Injector) {
	}

	public async initAuthMethod(): Promise<void> {
		if (this.isWalletStored()) {
			this.web3 = await this.web3ProviderService.initWalletProvider();
			this._isWeb3WalletUsed = true;
		} else if (this.isMetamaskInstalled()) {
			this.web3 = await this.web3ProviderService.initMetamaskProvider();
			this._currentAccount = (await this.web3.eth.getAccounts())[0];
			this._isMetamaskUsed = true;
		} else {
			await this.router.navigate(['/login']);
		}
	}


	public isWalletStored(): boolean {
		return this.openCharityWalletService.isWalletStored();
	}

	public isMetamaskInstalled(): boolean {
		return this.web3ProviderService.isMetamaskInstalled();
	}

	public async rawKeyLogin(privateKey: string, password: string): Promise<void> {
		this.web3 = await this.web3ProviderService.initWalletProvider();

		try {
			privateKey = this.normalizeToHex(privateKey);

			this.openCharityWalletService.init(this.web3ProviderService.web3, privateKey, password);
			this._isWeb3WalletUsed = true;
			this._currentAccount = this.web3.eth.accounts.wallet[0].address;
			this.router.navigate(['/']);
		} catch (e) {
			this.errorMessageService.addError(e.message, 'keyStorageLogin');
		}
	}

	public async keyStorageLogin(parsedKeyStorageFile: PrivateKey, password: string): Promise<void> {
		this.loadingOverlayService.showOverlay(true);
		this.web3 = await this.web3ProviderService.initWalletProvider();

		const addedAccount: Account = await this.accountDecrypt(parsedKeyStorageFile, password);
		this.loadingOverlayService.hideOverlay();
		this.openCharityWalletService.init(this.web3ProviderService.web3, addedAccount.privateKey, password);
		this._isWeb3WalletUsed = true;
		this._currentAccount = this.web3.eth.accounts.wallet[0].address;
		this.router.navigate(['/']);
	}

	public privateKeyValidator(): ValidatorFn {
		return (control: AbstractControl): {[key: string]: object} => {

			if (control.value && !this.validatePrivateKey(control.value)) {
				return {
					'privateKeyInvalid': { value: control.value }
				};
			}

			return null;
		};
	}

	private validatePrivateKey(privateKey): boolean {
		try {
			privateKey = Buffer.from(privateKey, 'hex');
		} catch {
			return false;
		}

		return privateKey.length === 32 && this.privateKeyVerify(privateKey);
	}

	private initWallet() {
	}

	private initMetamask() {

	}

	private async accountDecrypt(parsedKeyStorageFile: PrivateKey, password: string): Promise<Account> {
		return new Promise<Account>(async (resolve, reject) => {
			try {
				setTimeout(() => {
					resolve(this.web3.eth.accounts.decrypt(parsedKeyStorageFile, password));
				}, 200);
			} catch (e) {
				reject(e);
				this.errorMessageService.addError(e.message, 'keyStorageLogin');
			}
		});
	}

	private privateKeyVerify (privateKey) {
		let bn = this.fromBuffer(privateKey);

		BN.n = this.fromBuffer(Buffer.from('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 'hex'));

		function isOverflow() {
			let num = BN.n;

			if (bn.length > num.length) return 1;
			if (bn.length < num.length) return -1;

			let res = 0;
			for (let i = bn.length - 1; i >= 0; i--) {
				let a = bn.words[i] | 0;
				let b = num.words[i] | 0;

				if (a === b) continue;
				if (a < b) {
					res = -1;
				} else if (a > b) {
					res = 1;
				}
				break;
			}

			return res >= 0;
		}

		function isZero() {
			return bn.length === 1 && bn.words[0] === 0;
		}

		return !(isOverflow() || isZero());
	}

	private fromBuffer(b32) {
		let bn = new BN();

		bn.words = new Array(10);
		bn.words[0] = (b32[28] & 0x03) << 24 | b32[29] << 16 | b32[30] << 8 | b32[31];
		bn.words[1] = (b32[25] & 0x0F) << 22 | b32[26] << 14 | b32[27] << 6 | b32[28] >>> 2;
		bn.words[2] = (b32[22] & 0x3F) << 20 | b32[23] << 12 | b32[24] << 4 | b32[25] >>> 4;
		bn.words[3] = (b32[19] & 0xFF) << 18 | b32[20] << 10 | b32[21] << 2 | b32[22] >>> 6;

		bn.words[4] = (b32[15] & 0x03) << 24 | b32[16] << 16 | b32[17] << 8 | b32[18];
		bn.words[5] = (b32[12] & 0x0F) << 22 | b32[13] << 14 | b32[14] << 6 | b32[15] >>> 2;
		bn.words[6] = (b32[9] & 0x3F) << 20 | b32[10] << 12 | b32[11] << 4 | b32[12] >>> 4;
		bn.words[7] = (b32[6] & 0xFF) << 18 | b32[7] << 10 | b32[8] << 2 | b32[9] >>> 6;

		bn.words[8] = (b32[2] & 0x03) << 24 | b32[3] << 16 | b32[4] << 8 | b32[5];
		bn.words[9] = b32[0] << 14 | b32[1] << 6 | b32[2] >>> 2;

		bn.length = 10;

		while (bn.length > 1 && (bn.words[bn.length - 1] | 0) === 0) bn.length--;

		return bn;
	}

	// adds 0x in the beginning of the string
	// if it doesn't presented
	private normalizeToHex(value: string): string {
		// tslint:disable-next-line:no-any
		if ((<any>this.web3.utils).isHexStrict(value)) {
			return value;
		}

		return '0x' + value;

	}


}
