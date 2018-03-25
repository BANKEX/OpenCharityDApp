import {Component, Input, Output, OnInit, ViewChild, EventEmitter} from '@angular/core';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {TransactionReceipt} from 'web3/types';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {ConfirmationStatusState, ContractIncomingDonation} from '../../../open-charity-types';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Params, Router} from '@angular/router';


@Component({
	selector: 'opc-add-incoming-donation-modal',
	templateUrl: 'add-incoming-donation-modal.component.html',
	styleUrls: ['add-incoming-donation-modal.component.scss']
})
export class AddIncomingDonationModalComponent implements OnInit {

	private componentDestroyed: Subject<void> = new Subject<void>();

	@Input() charityEvent: any;
	@Input() organization: any;
	@Output() close = new EventEmitter();

	constructor(
	) {}

	submitClick() {
		this.close.next(true);
	}

	cancelClick() {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
