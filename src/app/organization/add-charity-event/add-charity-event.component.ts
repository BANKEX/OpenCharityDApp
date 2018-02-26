import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {TagsBitmaskService} from '../services/tags-bitmask.service';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {TransactionReceipt} from 'web3/types';

@Component({
	selector: 'opc-add-charity-event',
	templateUrl: 'add-charity-event.component.html',
	styleUrls: ['add-charity-event.component.scss']
})
export class AddCharityEventComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;

	charityEventForm: FormGroup;
	selectedTagsBitmask: number = 0;

	constructor(
		private organizationContractService: OrganizationContractService,
		private fb: FormBuilder,
		private tagsBitmaskService: TagsBitmaskService,
		private organizationSharedService: OrganizationSharedService
	) {
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
		let charityEventAddress: string;
		try {

			// get future address of CE contract
			charityEventAddress = await this.organizationContractService.addCharityEventCall(this.organizationContractAddress, f.name, f.target, f.payed, tags);

			this.organizationSharedService.charityEventAdded({
				name: f.name,
				address: charityEventAddress,
				target: f.target,
				payed: f.payed,
				tags: tags,
			});

			const receipt: TransactionReceipt = await this.organizationContractService.addCharityEvent(this.organizationContractAddress, f.name, f.target, f.payed, tags);

			if (charityEventAddress === receipt.events.CharityEventAdded.returnValues['charityEvent']) {
				this.organizationSharedService.charityEventConfirmed(charityEventAddress);
			} else {
				this.organizationSharedService.charityEventFailed(charityEventAddress);
			}

			this.initForm();

		} catch (e) {
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {

				this.organizationSharedService.charityEventCanceled(charityEventAddress);

			} else {

				// TODO:  global errors notifier
				console.warn(e.message);

			}
		}
	}


	public bitmaskChanged(bitmask: number) {
		this.selectedTagsBitmask = bitmask;
	}

	private initForm(): void {
		this.charityEventForm = this.fb.group({
			name: ['', Validators.required],
			target: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
			payed: ''
		});
	}

}
