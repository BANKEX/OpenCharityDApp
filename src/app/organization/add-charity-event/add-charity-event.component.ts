import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {TagsBitmaskService} from '../services/tags-bitmask.service';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {TransactionReceipt} from 'web3/types';
import {ConfirmationStatusState, ContractCharityEvent} from '../../open-charity-types';

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
		const newCharityEvent: ContractCharityEvent = {
			name: f.name,
			target: f.target,
			payed: (f.payed) ? f.payed : 0,
			tags: tags,
		};

		let charityEventInternalId: string = this.organizationSharedService.makePseudoRandomHash(newCharityEvent);
		let newCharityEventAddress: string = null;

		try {
			this.organizationSharedService.charityEventAdded({
				name: f.name,
				target: f.target,
				payed: (f.payed) ? f.payed : 0,
				tags: tags,
				internalId: charityEventInternalId,
				confirmation: ConfirmationStatusState.PENDING
			});

			const receipt: TransactionReceipt = await this.organizationContractService.addCharityEvent(this.organizationContractAddress, newCharityEvent);

			if (receipt.events && receipt.events.CharityEventAdded) {
				newCharityEventAddress = receipt.events.CharityEventAdded.returnValues['charityEvent'];
				this.organizationSharedService.charityEventConfirmed(charityEventInternalId, newCharityEventAddress);
			} else {
				this.organizationSharedService.charityEventFailed(charityEventInternalId, newCharityEventAddress);
			}

			this.initForm();

		} catch (e) {
			// TODO: listen for failed transaction
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.charityEventCanceled(charityEventInternalId, newCharityEventAddress);
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
