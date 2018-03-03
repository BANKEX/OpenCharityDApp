import {Component, Input, OnInit} from '@angular/core';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {TransactionReceipt} from 'web3/types';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {ConfirmationStatusState, ContractIncomingDonation} from '../../../open-charity-types';

@Component({
	selector: 'opc-add-incoming-donation',
	templateUrl: 'add-incoming-donation.component.html',
	styleUrls: ['add-incoming-donation.component.scss']
})
export class AddIncomingDonationComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;

	incomingDonationForm: FormGroup;
	selectedTagsBitmask: number = 0;

	constructor(private organizationContractService: OrganizationContractService,
				private fb: FormBuilder,
				private tagsBitmaskService: TagsBitmaskService,
				private organizationSharedService: OrganizationSharedService
	) {
	}

	public ngOnInit(): void {
		this.initForm();
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

}
