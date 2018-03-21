import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TransactionReceipt} from 'web3/types';

import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {AppIncomingDonation, ConfirmationStatusState, ContractIncomingDonation} from '../../../open-charity-types';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';


type IncomingDonationSource = {
	id: number;
	name: string;
}

@Component({
	templateUrl: 'incoming-donation-editor.component.html',
	styleUrls: ['incoming-donation-editor.component.scss']
})
export class IncomingDonationsEditorComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string;
	public incomingDonation: AppIncomingDonation;
	public incomingDonationForm: FormGroup;
	public selectedTagsBitmask: number = 0;

	@ViewChild('typeahead') typeahead: NgbTypeahead;
	focus$ = new Subject<string>();
	click$ = new Subject<string>();

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private incomingDonationsContractService: IncomingDonationContractService,
		private fb: FormBuilder,
		private tagsBitmaskService: TagsBitmaskService,
		private organizationContractService: OrganizationContractService,
		private organizationSharedService: OrganizationSharedService
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(async (params) => {
			this.organizationAddress = params['address'];
			// this.incomingDonation =  await this.incomingDonationsContractService.getIncomingDonationDetails(params['donation']);
		});
	}



	public goBackToOrganization(event: Event): void {
		event.preventDefault();
		this.router.navigate(['/organization', this.organizationAddress]);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
