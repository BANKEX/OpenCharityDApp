import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../core/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

type Tab = {
	name: string,
	active: boolean
};

//TODO: move this component from CoreModule

@Component({
	selector: 'opc-login-form',
	templateUrl: 'login-form.component.html',
	styleUrls: ['login-form.component.scss']
})

export class LoginFormComponent implements OnInit, OnDestroy {
	public rawKeyLoginForm: FormGroup;
	public tabs: Array<Tab> = [
		{
			name: 'Raw Key',
			active: true
		},
		// {
		// 	name: 'File',
		// 	active: false
		// }
	];

	constructor(private authService: AuthService,
				private router: Router,
				private fb: FormBuilder) {
	}

	public async ngOnInit(): Promise<void> {
		this.rawKeyLoginForm = this.fb.group({
			privateKey: ['', [Validators.required]], // TODO: add private key validation
			password: ['', [Validators.required]] // TODO: add basic validations for strict password. min length, special characters, etc
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
		if (this.rawKeyLoginForm.invalid) { return; }
		this.authService.rawKeyLogin(this.rawKeyLoginForm.value.privateKey, this.rawKeyLoginForm.value.password);
	}

}
