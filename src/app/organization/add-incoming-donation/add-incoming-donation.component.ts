import {Component, Input, OnInit} from '@angular/core';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TagsBitmaskService} from '../services/tags-bitmask.service';
import {TransactionReceipt} from 'web3/types';
import {OrganizationSharedService} from '../services/organization-shared.service';

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
		let incomingDonationAddress: string;

		try {
			// get future address of CE contract
			incomingDonationAddress = await this.organizationContractService.getNewIncomingDonationAddress(this.organizationContractAddress, {
				realWorldsIdentifier: f.realWorldIdentifier,
				amount: f.amount,
				note: f.note,
				tags: tags,
			});

			this.organizationSharedService.incomingDonationAdded({
				realWorldsIdentifier: f.realWorldIdentifier,
				amount: f.amount,
				address: incomingDonationAddress,
				note: f.note,
				tags: tags,
			});

			const receipt: TransactionReceipt = await this.organizationContractService.addIncomingDonation(this.organizationContractAddress, f.realWorldIdentifier, f.amount, f.note, tags);

			if (incomingDonationAddress === receipt.events.IncomingDonationAdded.returnValues['incomingDonation']) {
				this.organizationSharedService.incomingDonationConfirmed(incomingDonationAddress);
			} else {
				this.organizationSharedService.incomingDonationFailed(incomingDonationAddress);
			}

			this.initForm();
		} catch (e) {
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.incomingDonationCanceled(incomingDonationAddress);
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
