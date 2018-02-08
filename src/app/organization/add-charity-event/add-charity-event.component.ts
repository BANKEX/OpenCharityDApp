import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrganizationContractService} from '../services/organization-contract.service';
import {TagsBitmaskService} from '../services/tags-bitmask.service';

@Component({
	selector: 'opc-add-charity-event',
	templateUrl: 'add-charity-event.component.html',
	styleUrls: ['add-charity-event.component.scss']
})
export class AddCharityEventComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;

	charityEventForm: FormGroup;
	selectedTagsBitmask: number = 0;

	constructor(private organizationContractService: OrganizationContractService,
				private fb: FormBuilder,
				private tagsBitmaskService: TagsBitmaskService) {
	}

	public ngOnInit(): void {
		this.initForm();

	}

	public async submitForm(): Promise<void> {
		if (this.charityEventForm.invalid) {
			return;
		}
		const f = this.charityEventForm.value;

		const tags = '0x' + this.tagsBitmaskService.convertToHexWithLeadingZeros(this.selectedTagsBitmask);
		const transactionHash = this.organizationContractService.addCharityEvent(this.organizationContractAddress, f.name, f.target, f.payed, tags);
	}

	public bitmaskChanged(bitmask: number) {
		this.selectedTagsBitmask = bitmask;
	}

	private initForm(): void {
		this.charityEventForm = this.fb.group({
			name: ['', Validators.required],
			target: ['', Validators.required],
			payed: ''
		});
	}

}
