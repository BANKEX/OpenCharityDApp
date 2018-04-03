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
import { LoadingOverlayService } from '../../../core/loading-overlay.service';


@Component({
	selector: 'opc-add-incoming-donation-modal',
	templateUrl: 'add-incoming-donation-modal.component.html',
})
export class AddIncomingDonationModalComponent extends NeatComponent implements AfterViewInit {

	@Input() public charityEvent: AppCharityEvent;
	@Input() public organizationAddress: string;
 	@Output() public donationCreated$: Subject<string> = new Subject();

	constructor(
		public activeModal: NgbActiveModal,
		private $loadingOverlayService: LoadingOverlayService,
		private $sharedService: OrganizationSharedService,
	) {
		super();
	}

	public onDonationCreated(donationAddress: string) {
		this.donationCreated$.next(donationAddress);
		// this.activeModal.close('Donation Created');
	}

	public onCloseClick() {
		this.activeModal.close();
	}

	public ngAfterViewInit() {
		if (this.charityEvent) {
			this.$sharedService.onIncomingDonationAdded().takeUntil(this.ngUnsubscribe).subscribe(_ => this.$loadingOverlayService.showOverlay(true));
			this.$sharedService.onIncomingDonationConfirmed().takeUntil(this.ngUnsubscribe).subscribe(_ => this.$loadingOverlayService.showOverlay(true));
		} else {
			this.$sharedService.onIncomingDonationAdded().takeUntil(this.ngUnsubscribe).subscribe(_ => this.activeModal.close('Donation Pending'));
		}
	}
}
