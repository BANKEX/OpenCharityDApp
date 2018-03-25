import {Component, Input, Output, OnInit, ViewChild, EventEmitter} from '@angular/core';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {TransactionReceipt} from 'web3/types';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {ConfirmationStatusState, ContractIncomingDonation, AppCharityEvent, AppIncomingDonation} from '../../../open-charity-types';
import {NgbTypeahead, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';


@Component({
	selector: 'opc-add-incoming-donation-modal',
	templateUrl: 'add-incoming-donation-modal.component.html',
	styleUrls: ['add-incoming-donation-modal.component.scss']
})
export class AddIncomingDonationModalComponent implements OnInit, OnDestroy {

	// @Input() charityEvent: AppCharityEvent;
	// @Input() organizationAddress: string;
	@Output() close = new EventEmitter();
 	@Output() donationCreated$: Subject<string> = new Subject();

	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(
		public activeModal: NgbActiveModal
	) {
	}

	onDonationCreated(donationAddress: string) {
		this.donationCreated$.next(donationAddress);
		this.close.emit(true);
		this.activeModal.close('Donation Created');
	  }

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
