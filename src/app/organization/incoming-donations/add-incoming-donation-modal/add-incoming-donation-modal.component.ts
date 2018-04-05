import {Component, Input, Output, EventEmitter} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { NeatComponent } from '../../../shared/neat.component';
import { AppCharityEvent } from '../../../open-charity-types';


@Component({
	selector: 'opc-add-incoming-donation-modal',
	templateUrl: 'add-incoming-donation-modal.component.html',
})
export class AddIncomingDonationModalComponent extends NeatComponent {

	@Input() public charityEvent: AppCharityEvent;
	@Input() public organizationAddress: string;
 	@Output() public donationTxHash$: EventEmitter<string> = new EventEmitter();

	constructor(
		public activeModal: NgbActiveModal,
	) {
		super();
	}

	public onTransactionHashReceived(txHash: string) {
		this.donationTxHash$.emit(txHash);
		this.activeModal.close('Donation Submited');
	}

	public onCloseClick() {
		this.activeModal.close();
	}
}
