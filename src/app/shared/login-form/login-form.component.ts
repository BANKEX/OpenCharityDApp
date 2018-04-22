import {ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../core/auth.service';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ErrorMessageService} from '../../core/error-message.service';
import {PrivateKey} from 'web3/types';
import {Web3ProviderService} from '../../core/web3-provider.service';
import {OpenCharityWalletService} from '../../core/open-charity-wallet.service';
import {LoadingOverlayService} from '../../core/loading-overlay.service';

type Tab = {
	name: string,
	active: boolean
};

// TODO: move this component from CoreModule

@Component({
	selector: 'opc-login-form',
	templateUrl: 'login-form.component.html',
	styleUrls: ['login-form.component.scss']
})

export class LoginFormComponent implements OnInit, OnDestroy {
	public rawKeyLoginForm: FormGroup;
	public keyStorageLoginForm: FormGroup;
	public tabs: Array<Tab> = [
		{
			name: 'Raw Key',
			active: true
		},
		{
			name: 'File',
			active: false
		}
	];
	public fileName: string;

	constructor(private authService: AuthService,
				private router: Router,
				private fb: FormBuilder,
				private cd: ChangeDetectorRef,
				private errorMessageService: ErrorMessageService,
				private loadingOverlayService: LoadingOverlayService) {
	}

	public async ngOnInit(): Promise<void> {
		this.rawKeyLoginForm = this.fb.group({
			privateKey: ['', [Validators.required, this.authService.privateKeyValidator()]],
			password: ['', [
				Validators.required,
				Validators.pattern(/(?=^.{6,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
			]]
		});

		this.keyStorageLoginForm = this.fb.group({
			file: ['', [Validators.required]],
			password: ['', [
				Validators.required
			]]
		});

		if (this.authService.isMetamaskInstalled()) {
			await this.router.navigate(['/']);
		}
	}

	public ngOnDestroy(): void {
	}

	public chooseTab(index: number): void {
		this.tabs.forEach((item: Tab) => item.active = false);
		this.tabs[index].active = true;
	}

	public rawKeyLogin(): void {
		this.loadingOverlayService.showOverlay(true);

		if (this.rawKeyLoginForm.invalid || this.rawKeyLoginForm.pristine) {
			return;
		}
		this.authService.rawKeyLogin(this.rawKeyLoginForm.value.privateKey, this.rawKeyLoginForm.value.password);
	}

	public keyStorageLogin(): void {
		this.loadingOverlayService.showOverlay(true);

		if (this.keyStorageLoginForm.invalid || this.keyStorageLoginForm.pristine) {
			return;
		}
		this.authService.keyStorageLogin(this.keyStorageLoginForm.value.file, this.keyStorageLoginForm.value.password);
	}

	public keyStorageUpdated(event: Event) {
		const reader: FileReader = new FileReader();
		// tslint:disable-next-line:no-any
		const fileInput: any = event.target;
		reader.onload = () => {
			// tslint:disable-next-line:no-any
			const fileContent: any = reader.result;
			let parsedContent: PrivateKey;
			try {
				this.fileName = fileInput.files[0].name;
				parsedContent = JSON.parse(fileContent);
				this.keyStorageLoginForm.patchValue({
					file: parsedContent
				});

				// need to run CD since file load runs outside of zone
				this.cd.markForCheck();
			} catch (e) {
				this.errorMessageService.addError(e.message, 'Invalid keystore file');
			}

		};
		reader.readAsText(fileInput.files[0]);
	}

}
