import {Component, Input, OnInit} from '@angular/core';
import {AppCharityEvent, ConfirmationStatusState} from '../../../open-charity-types';
import {Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddIncomingDonationModalComponent } from '../../incoming-donations/add-incoming-donation-modal/add-incoming-donation-modal.component';

@Component({
	selector: 'opc-charity-events-card',
	templateUrl: 'charity-event-card.component.html',
	styleUrls: ['charity-event-card.component.scss']
})
export class CharityEventCardComponent implements OnInit {
	@Input('organizationAddress') organizationAddress: string;
	@Input('charityEvent') public charityEvent: AppCharityEvent;

	constructor(
		private $router: Router,
		private $modal: NgbModal,
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

	public goToTransactions($event): void {
		if (!this.isConfirmed() || $event.defaultPrevented) {
			return;
		}
		this.$router.navigate([`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/transactions`]);
	}

	public editClick($event: Event): void {
		this.$router.navigate([`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/editor`]);
	}

	public removeClick($event: Event): void {
	}

	public addDonationClick($event) {
		const modalInstanse =
			this.$modal.open(AddIncomingDonationModalComponent, {size: 'lg'}).componentInstance;
	  	modalInstanse.out.subscribe((boom) => {
	  	});
	}

	// public stopClickBubbling($event: Event): void {
	// 	$event.preventDefault();
	// }
}
