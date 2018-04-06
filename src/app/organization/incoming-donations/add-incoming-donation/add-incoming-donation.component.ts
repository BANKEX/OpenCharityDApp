import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {Location} from '@angular/common';

@Component({
	selector: 'opc-add-incoming-donation',
	templateUrl: 'add-incoming-donation.component.html',
	styleUrls: ['add-incoming-donation.component.scss']
})

export class AddIncomingDonationComponent implements OnInit, OnDestroy {
	public organizationAddress: string;
	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(private route: ActivatedRoute,
				private location: Location) {
	}

	public ngOnInit() {
		this.route.params.subscribe((params: Params) => {
			this.organizationAddress = params.address;
		});
	}

	public goBackToPreviousPage(event: Event): void {
		this.location.back();
		event.preventDefault();
	}

	public ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
