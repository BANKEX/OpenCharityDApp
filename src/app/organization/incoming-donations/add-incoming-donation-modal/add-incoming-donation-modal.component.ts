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
import { OnDestroy, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { NeatComponent } from '../../../shared/neat.component';
import { LoadingTransparentOverlayService } from '../../../core/loading-transparent-overlay.service';


@Component({
	selector: 'opc-add-incoming-donation-modal',
	templateUrl: 'add-incoming-donation-modal.component.html',
})
export class AddIncomingDonationModalComponent extends NeatComponent implements AfterViewInit {

	@Input() charityEvent: AppCharityEvent;
	@Input() organizationAddress: string;
 	@Output() donationCreated$: Subject<string> = new Subject();

	constructor(
		public activeModal: NgbActiveModal,
		private $loadingTransparentOverlayService: LoadingTransparentOverlayService,
		private $sharedService: OrganizationSharedService,
	) {
		super();
	}

	onDonationCreated(donationAddress: string) {
		this.donationCreated$.next(donationAddress);
		// this.activeModal.close('Donation Created');
	}

	onCloseClick() {
		this.activeModal.close();
	}

	ngAfterViewInit() {
		if (this.charityEvent) {
			this.$sharedService.onIncomingDonationAdded().takeUntil(this.ngUnsubscribe).subscribe(_ => this.$loadingTransparentOverlayService.showOverlay());
			this.$sharedService.onIncomingDonationConfirmed().takeUntil(this.ngUnsubscribe).subscribe(_ => this.$loadingTransparentOverlayService.showOverlay());
		} else {
			this.$sharedService.onIncomingDonationAdded().takeUntil(this.ngUnsubscribe).subscribe(_ => this.activeModal.close('Donation Pending'));
		}
	}
}
