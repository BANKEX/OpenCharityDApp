import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import {AppCharityEvent, ConfirmationResponse, ConfirmationStatusState} from '../../open-charity-types';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
	selector: 'opc-charity-events-card',
	templateUrl: 'charity-events-card.component.html',
	styleUrls: ['charity-events-card.component.scss']
})
export class CharityEventsCardComponent implements OnInit, OnDestroy {
	@Input('charityEvent') public charityEvent: AppCharityEvent;
	private componentDestroyed: Subject<void> = new Subject<void>();
	private address: string = "";

	constructor(
		private router: Router,
		private route: ActivatedRoute
	) { }

	ngOnInit() {
		this.route.params.subscribe(params => { this.address = params["address"]; });
	}

	public isEvent(): boolean {
		return this.charityEvent != null;
	}

	public isPending(): boolean {
		if(this.charityEvent == null) return true;
		return (this.charityEvent.confirmation === ConfirmationStatusState.PENDING);
	}

	public isConfirmed(): boolean {
		return (this.charityEvent.confirmation === ConfirmationStatusState.CONFIRMED);
	}

	public isFailed(): boolean {
		return (this.charityEvent.confirmation === ConfirmationStatusState.FAILED);
	}

	public isErrored(): boolean {
		return (this.charityEvent.confirmation === ConfirmationStatusState.ERROR);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

	public goToTransactions(): void {
		this.router.navigate([`/organization/${this.address}/charityevent/${this.charityEvent.address}/transactions`]);
	}

	public editClick($event: Event): void {
		this.router.navigate([`/organization/${this.address}/charityevent/${this.charityEvent.address}/editor`]);
		$event.stopPropagation();
	}

	public removeClick($event: Event): void {
		$event.stopPropagation();
	}

	public otherClick($event: Event): void {
		$event.stopPropagation();
	}
}
