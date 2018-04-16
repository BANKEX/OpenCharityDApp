import {Component, OnDestroy, OnInit} from '@angular/core';
import {BlockingNotificationOverlayService} from '../blocking-notification-overlay.service';
import {OpenCharityWalletService} from '../open-charity-wallet.service';
import {MetamaskCheckService} from '../metamask-check.service';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {LoadingOverlayService} from '../loading-overlay.service';

type Tab = {
	name: string,
	active: boolean
};

@Component({
	selector: 'opc-login-form',
	templateUrl: 'login-form.component.html',
	styleUrls: ['login-form.component.scss']
})

export class LoginFormComponent implements OnInit, OnDestroy {
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

	constructor(
		private blockingNotificationOverlayService: BlockingNotificationOverlayService,
		private authService: AuthService,
		private router: Router
	) {}

	public async ngOnInit(): Promise<void> {
		if (this.authService.isMetamaskInstalled()) {
			await this.router.navigate(['/']);
		}
		// this.loadingOverlayService.hideOverlay();
		this.blockingNotificationOverlayService.hideOverlay();
	}

	public ngOnDestroy(): void {}

	public chooseTab(index: number): void {
		this.tabs.forEach((item: Tab) => item.active = false);
		this.tabs[index].active = true;
	}

	public rawKeyLogin(privateKey: string, password: string): void {

		this.authService.rawKeyLogin(privateKey, password);

	}

}
