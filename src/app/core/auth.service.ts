import {Injectable, Injector} from '@angular/core';
import {OpenCharityWalletService} from './open-charity-wallet.service';
import {Web3ProviderService} from './web3-provider.service';
import {Router} from '@angular/router';
import Web3 from 'web3';
import {PrivateKey, Account} from 'web3/types';

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
		privateKey = this.normalizeToHex(privateKey);

		if (!this.validatePrivateKey()) {
			return;
		}

		this.openCharityWalletService.init(this.web3ProviderService.web3, privateKey, password);
		this._isWeb3WalletUsed = true;
		this._currentAccount = this.web3.eth.accounts.wallet[0].address;
		this.router.navigate(['/']);
	}

	public async keyStorageLogin(parsedKeyStorageFile: PrivateKey, password: string): Promise<void> {
		this.web3 = await this.web3ProviderService.initWalletProvider();

		// TODO: check if decrypt failed and show appropriate error
		const addedAccount: Account = this.web3.eth.accounts.decrypt(parsedKeyStorageFile, password);
		this.openCharityWalletService.init(this.web3ProviderService.web3, addedAccount.privateKey, password);
		this._isWeb3WalletUsed = true;
		this._currentAccount = this.web3.eth.accounts.wallet[0].address;
		this.router.navigate(['/']);
	}

	private initWallet() {
	}

	private initMetamask() {

	}


	// TODO: add private key validation
	private validatePrivateKey(): boolean {
		return true;
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
