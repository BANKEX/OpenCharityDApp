import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TransactionReceipt} from 'web3/types';

import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {AppIncomingDonation, ConfirmationStatusState, ContractIncomingDonation} from '../../../open-charity-types';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Location} from '@angular/common';


type IncomingDonationSource = {
	id: number;
	name: string;
};

@Component({
	templateUrl: 'incoming-donation-editor.component.html',
	styleUrls: ['incoming-donation-editor.component.scss']
})

export class IncomingDonationsEditorComponent implements OnInit, OnDestroy {
	@ViewChild('typeahead') public typeahead: NgbTypeahead;
	public focus$ = new Subject<string>();
	public click$ = new Subject<string>();

	public organizationAddress: string;
	public incomingDonation: AppIncomingDonation;
	public incomingDonationForm: FormGroup;
	public selectedTagsBitmask: number = 0;

	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(private router: Router,
				private route: ActivatedRoute,
				private incomingDonationsContractService: IncomingDonationContractService,
				private fb: FormBuilder,
				private organizationContractService: OrganizationContractService,
				private organizationSharedService: OrganizationSharedService,
				private location: Location) {
	}

	public async ngOnInit(): Promise<void> {
		this.route.params.subscribe(async (params) => {
			this.organizationAddress = params['address'];
			// this.incomingDonation =  await this.incomingDonationsContractService.getIncomingDonationDetails(params['donation']);
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
