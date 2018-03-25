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
import { NeatComponent } from '../../../shared/neat.component';
import { LoadingTransparentOverlayService } from '../../../core/loading-transparent-overlay.service';


@Component({
	selector: 'opc-add-incoming-donation-modal',
	templateUrl: 'add-incoming-donation-modal.component.html',
	styleUrls: ['add-incoming-donation-modal.component.scss']
})
export class AddIncomingDonationModalComponent extends NeatComponent {

	@Input() charityEvent: AppCharityEvent;
	@Input() organizationAddress: string;
	@Output() close = new EventEmitter();
 	@Output() donationCreated$: Subject<string> = new Subject();

	constructor(
		public activeModal: NgbActiveModal,
		private $loadingTransparentOverlayService: LoadingTransparentOverlayService,
		private $sharedService: OrganizationSharedService,
	) {
		super();
		$sharedService.onIncomingDonationAdded().takeUntil(this.ngUnsubscribe).subscribe(_ => $loadingTransparentOverlayService.showOverlay());
		$sharedService.onIncomingDonationConfirmed().takeUntil(this.ngUnsubscribe).subscribe(_ => $loadingTransparentOverlayService.showOverlay());
	}

	onDonationCreated(donationAddress: string) {
		console.log(donationAddress)
		this.donationCreated$.next(donationAddress);
		this.close.emit(true);
		this.activeModal.close('Donation Created');
	  }
}
