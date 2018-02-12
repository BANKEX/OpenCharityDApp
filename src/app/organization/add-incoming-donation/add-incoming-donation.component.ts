import {Component, Input, OnInit} from '@angular/core';
import {OrganizationContractService} from '../services/organization-contract.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TagsBitmaskService} from '../services/tags-bitmask.service';

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
				private tagsBitmaskService: TagsBitmaskService) {
	}

	public ngOnInit(): void {
		this.initForm();
	}

	public async submitForm() {
		if (this.incomingDonationForm.invalid) {
			return;
		}
		const f = this.incomingDonationForm.value;

		const tags = '0x' + this.tagsBitmaskService.convertToHexWithLeadingZeros(this.selectedTagsBitmask);

		try {
			this.organizationContractService.addIncomingDonation(this.organizationContractAddress, f.realWorldIdentifier, f.amount, f.note, tags);
		} catch(e) {
			console.warn(e.message);
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
