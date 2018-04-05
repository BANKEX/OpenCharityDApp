import {OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';

/**
 * A component that cleans all subscriptions with oneself
 * https://stackoverflow.com/questions/38008334/angular-rxjs-when-should-i-unsubscribe-from-subscription
 * @class NeatComponent
 */
export abstract class NeatComponent implements OnDestroy, OnInit {
// Add '.takeUntil(this.ngUnsubscribe)' before every '.subscrybe(...)'
// and this subscriptions will be cleaned up on component destroy.

	protected ngUnsubscribe: Subject<void> = new Subject();

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
	}
}
