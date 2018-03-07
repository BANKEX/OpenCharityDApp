import {Component, OnInit} from '@angular/core';

import {PendingTransactionService} from '../core/pending-transactions.service';
import {PendingTransaction, PendingTransactionState, PendingTransactionSourceType} from '../pending-transaction.types';

@Component({
	selector: 'app-dashboard',
	templateUrl: './common-layout.component.html'
})

export class CommonLayoutComponent implements OnInit {

	public app: any;
	public headerThemes: any;
	public changeHeader: any;
	public sidenavThemes: any;
	public changeSidenav: any;
	public headerSelected: any;
	public sidenavSelected: any;

	public pendingTransactions: PendingTransaction[] = [];

	constructor(
		private pendingTransactionService: PendingTransactionService,
		// private notificationService:
	) {
		this.app = {
			layout: {
				sidePanelOpen: false,
				isMenuOpened: true,
				isMenuCollapsed: false,
				themeConfigOpen: false,
				rtlActived: false
			}
		};

		this.headerThemes = ['header-default', 'header-primary', 'header-info', 'header-success', 'header-danger', 'header-dark'];
		this.changeHeader = changeHeader;

		function changeHeader(headerTheme) {
			this.headerSelected = headerTheme;
		}

		this.sidenavThemes = ['sidenav-default', 'side-nav-dark'];
		this.changeSidenav = changeSidenav;

		function changeSidenav(sidenavTheme) {
			this.sidenavSelected = sidenavTheme;
		}
	}

	ngOnInit() {
		this.pendingTransactionService.message.subscribe(message => {
			if(message.state == PendingTransactionState.PENDING) {
				this.pendingTransactions.push(message);
				// this.notificationService.setOverlayMessage(`Transaction pending. CE: ${message.text}`);
			} else {
				this.pendingTransactions = this.pendingTransactions.filter(transaction => transaction.id != message.id);
				if(message.state == PendingTransactionState.CONFIRMED) {
					// this.notificationService.setOverlayMessage(`Transaction completed. CE: ${message.text}`);
				}
				else {
					// this.notificationService.setOverlayMessage(`Transaction failed. CE: ${message.text}`);
				}
			}
		});
	}

	public isConfirmed(message: PendingTransaction): boolean {
		return message.state == PendingTransactionState.CONFIRMED;
	}

	public isPending(message: PendingTransaction): boolean {
		return message.state == PendingTransactionState.PENDING;
	}

	public isFailed(message: PendingTransaction): boolean {
		return message.state == PendingTransactionState.FAILED;
	}
}
