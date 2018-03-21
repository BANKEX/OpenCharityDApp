import {Component, Input, OnInit} from '@angular/core';

import {AppCharityEvent, ConfirmationStatusState} from '../../../open-charity-types';
import {Router} from '@angular/router';

@Component({
	selector: 'opc-charity-events-card',
	templateUrl: 'charity-event-card.component.html',
	styleUrls: ['charity-event-card.component.scss']
})
export class CharityEventCardComponent implements OnInit {
	@Input('organizationAddress') organizationAddress: string;
	@Input('charityEvent') public charityEvent: AppCharityEvent;

	constructor(
		private router: Router
	) {
	}

	ngOnInit() {
	}

	public isEvent(): boolean {
		return this.charityEvent != null;
	}

	public isPending(): boolean {
		if (this.charityEvent == null) return true;
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

	public goToTransactions(): void {
		if (!this.isConfirmed()) {
			return;
		}
		this.router.navigate([`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/transactions`]);
	}

	public editClick($event: Event): void {
		this.router.navigate([`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/editor`]);
		$event.stopPropagation();
	}

	public removeClick($event: Event): void {
		$event.stopPropagation();
	}

	public otherClick($event: Event): void {
		$event.stopPropagation();
	}
}
