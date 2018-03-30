import {Component, OnDestroy, OnInit} from '@angular/core';
import {BlockingNotificationOverlayService} from '../blocking-notification-overlay.service';

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
	public tabs: Array<Tab>;

	constructor(private blockingNotificationOverlayService: BlockingNotificationOverlayService) {}

	ngOnInit(): void {
		this.tabs = [
			{
				name: 'Raw Key',
				active: true
			},
			{
				name: 'File',
				active: false
			}
		];
		this.blockingNotificationOverlayService.hideOverlay();
	}

	ngOnDestroy(): void {}

	public chooseTab(index: number): void {
		this.tabs.forEach((item: Tab) => item.active = false);
		this.tabs[index].active = true;
	}

}
