import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TransactionReceipt} from 'web3/types';

import {IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';
import {TagsBitmaskService} from '../services/tags-bitmask.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {ConfirmationStatusState, ContractIncomingDonation} from '../../open-charity-types';

@Component({
	templateUrl: 'incoming-donation-editor.component.html',
	styleUrls: ['incoming-donation-editor.component.scss']
})
export class IncomingDonationsEditorComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationContractAddress: string;
	public incomingDonationForm: FormGroup;
	public selectedTagsBitmask: number = 0;

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
		this.route.params.subscribe(params => {
			this.organizationContractAddress = params["address"];
		});
		this.initForm();
	}

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationContractAddress]);
		event.preventDefault();
	}

	public async submitForm() {
		if (this.incomingDonationForm.invalid) {return;}
		const f = this.incomingDonationForm.value;


		const tags = '0x' + this.tagsBitmaskService.convertToHexWithLeadingZeros(this.selectedTagsBitmask);
		const newIncomingDonation: ContractIncomingDonation = {
			realWorldsIdentifier: f.realWorldIdentifier,
			amount: f.amount,
			note: f.note,
			tags: tags
		};

		let incomingDonationInternalId: string = this.organizationSharedService.makePseudoRandomHash(newIncomingDonation);
		let newIncomingDonationAddress: string = null;

		try {

			this.organizationSharedService.incomingDonationAdded({
				realWorldsIdentifier: f.realWorldIdentifier,
				amount: f.amount,
				note: f.note,
				tags: tags,
				internalId: incomingDonationInternalId,
				confirmation: ConfirmationStatusState.PENDING
			});

			const receipt: TransactionReceipt = await this.organizationContractService.addIncomingDonation(this.organizationContractAddress, f.realWorldIdentifier, f.amount, f.note, tags);


			if (receipt.events && receipt.events.IncomingDonationAdded) {
				newIncomingDonationAddress = receipt.events.IncomingDonationAdded.returnValues['incomingDonation'];
				this.organizationSharedService.incomingDonationConfirmed(incomingDonationInternalId, newIncomingDonationAddress);
			} else {
				this.organizationSharedService.incomingDonationFailed(incomingDonationInternalId, newIncomingDonationAddress);
			}

			this.initForm();

		} catch (e) {
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.incomingDonationCanceled(incomingDonationInternalId, newIncomingDonationAddress);
			} else {
				// TODO:  global errors notifier
				console.warn(e.message);
			}
		}

	}


	public bitmaskChanged(bitmask: number) {
		this.selectedTagsBitmask = bitmask;
	}

	private initForm() {
		this.incomingDonationForm = this.fb.group({
			realWorldIdentifier: ['', Validators.required],
			amount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
			note: ''
		});
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
