import {Component, OnInit} from '@angular/core';
import {PendingTransactionService} from '../core/pending-transactions.service';
import {PendingTransaction, PendingTransactionState, PendingTransactionSourceType} from '../pending-transaction.types';
import {findIndex} from 'lodash';

type App = {
	layout: {
		sidePanelOpen: boolean,
		isMenuOpened: boolean,
		isMenuCollapsed: boolean,
		themeConfigOpen: boolean,
		rtlActived: boolean
	}
};

@Component({
	selector: 'app-dashboard',
	templateUrl: './common-layout.component.html'
})

export class CommonLayoutComponent implements OnInit {

	public app: App;
	public headerThemes: Array<string>;
	public changeHeader: Function;
	public sidenavThemes: Array<string>;
	public changeSidenav: Function;
	public headerSelected: string;
	public sidenavSelected: string;

	public pendingTransactions: PendingTransaction[] = [];

	constructor(private pendingTransactionService: PendingTransactionService) {
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

	public ngOnInit() {
		this.pendingTransactionService.message.subscribe((pendingTransaction: PendingTransaction) => {
			this.removeExistPendingTransaction(pendingTransaction);
			this.pendingTransactions.push(pendingTransaction);
		});
	}

	public isConfirmed(message: PendingTransaction): boolean {
		return message.state === PendingTransactionState.CONFIRMED;
	}

	public isPending(message: PendingTransaction): boolean {
		return message.state === PendingTransactionState.PENDING;
	}

	public isFailed(message: PendingTransaction): boolean {
		return message.state === PendingTransactionState.FAILED;
	}

	private removeExistPendingTransaction(pendingTransaction: PendingTransaction) {
		const pendingTransactionIndex = findIndex(this.pendingTransactions, {
			internalId: pendingTransaction.internalId,
			state: PendingTransactionState.PENDING
		});

		if (pendingTransactionIndex !== -1)
			this.pendingTransactions.splice(pendingTransactionIndex, 1);
	}
}
