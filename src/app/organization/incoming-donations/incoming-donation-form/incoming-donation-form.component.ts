import {Component, Input, OnInit, ViewChild, Output} from '@angular/core';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {TransactionReceipt} from 'web3/types';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {AppIncomingDonation, ConfirmationStatusState, ContractIncomingDonation} from '../../../open-charity-types';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {find} from 'lodash';
import {isString} from 'ng2-toasty/src/toasty.utils';
import {isObject} from 'rxjs/util/isObject';


type IncomingDonationSource = {
	id: number;
	name: string;
};

export function sourceMinValidator(): ValidatorFn {
	return (control: AbstractControl): {[key: string]: any} => {
		if (isObject(control.value) &&
			Object.keys(control.value).length === 0) {
			return {
				'required': { value: control.value }
			};
		}

		if (!control.value) {
			return {
				'required': { value: control.value }
			};
		}

		if (isString(control.value) && parseInt(control.value, 10) <= 0) {
			return {
				'min': { value: control.value }
			};
		}

		return null;
	};
}

@Component({
	selector: 'opc-incoming-donation-form',
	templateUrl: 'incoming-donation-form.component.html',
	styleUrls: ['incoming-donation-form.component.scss']
})

export class IncomingDonationFormComponent implements OnInit {
	@Input('organizationAddress') organizationAddress: string;
	@Input('incomingDonation') incomingDonation: AppIncomingDonation;
	@Output('donationCreated') donationCreated: Subject<string> = new Subject();

	@ViewChild('typeahead') sourceTypeahead: NgbTypeahead;
	focus$ = new Subject<string>();
	click$ = new Subject<string>();

	public incomingDonationForm: FormGroup;
	public selectedTagsBitmask: number = 0;
	public sources: IncomingDonationSource[] = [];

	public search: Function;
	public formatter: Function;

	constructor(private organizationContractService: OrganizationContractService,
				private fb: FormBuilder,
				private tagsBitmaskService: TagsBitmaskService,
				private organizationSharedService: OrganizationSharedService
	) {
	}

	public async ngOnInit(): Promise<void> {

		this.getListOfSources();

		this.search = (text$: Observable<string>) =>
			text$
				.debounceTime(200).distinctUntilChanged()
				.merge(this.focus$)
				.merge(this.click$.filter(() => !this.sourceTypeahead.isPopupOpen()))
				.map(term => term === '' ?  this.sources
					: this.sources.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));

		this.formatter = (x: {name: string}) => x.name;

		this.initForm();
	}

	public async submitForm() {
		if (this.incomingDonationForm.invalid) { return; }
		const f = this.incomingDonationForm.value;


		const tags = '0x' + this.tagsBitmaskService.convertToHexWithLeadingZeros(this.selectedTagsBitmask);
		const newIncomingDonation: ContractIncomingDonation = {
			realWorldsIdentifier: f.realWorldIdentifier,
			amount: f.amount,
			note: f.note,
			tags: tags,
			sourceId: f.source.id
		};

		let incomingDonationInternalId: string = this.organizationSharedService.makePseudoRandomHash(newIncomingDonation);
		let newIncomingDonationAddress: string = null;

		try {
			this.organizationSharedService.incomingDonationAdded({
				realWorldsIdentifier: f.realWorldIdentifier,
				amount: f.amount,
				note: f.note,
				tags: tags,
				sourceId: f.source.id,
				internalId: incomingDonationInternalId,
				confirmation: ConfirmationStatusState.PENDING
			});

			const receipt: TransactionReceipt = await this.organizationContractService.addIncomingDonation(this.organizationAddress, f.realWorldIdentifier, f.amount, f.note, tags, f.source.id);


			if (receipt.events && receipt.events.IncomingDonationAdded) {
				newIncomingDonationAddress = receipt.events.IncomingDonationAdded.returnValues['incomingDonation'];
				this.organizationSharedService.incomingDonationConfirmed(incomingDonationInternalId, newIncomingDonationAddress);
				this.donationCreated.next(newIncomingDonationAddress);

			} else {
				this.donationCreated.next(null);
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

	public async getListOfSources(): Promise<void>  {
		const sourceIds: number = parseInt(await this.organizationContractService.getIncomingDonationsSourcesIds(this.organizationAddress));

		for (let i = 0; i < sourceIds; i++) {
			this.sources[i] = {
				id: i,
				name: await this.organizationContractService.getIncomingDonationSourceName(this.organizationAddress, i)
			}
		}
	}

	public bitmaskChanged(bitmask: number): void {
		this.selectedTagsBitmask = bitmask;
	}

	private initForm(): void {
		if (this.incomingDonation) {
			this.incomingDonationForm = this.fb.group({
				realWorldIdentifier: [this.incomingDonation.realWorldsIdentifier, Validators.required],
				amount: [this.incomingDonation.amount, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
				source: [this.getSourceById(this.incomingDonation.sourceId), Validators.required],
				note: this.incomingDonation.note
			});
		} else {
			this.incomingDonationForm = this.fb.group({
				realWorldIdentifier: ['', Validators.required],
				amount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
				source: [{}, [Validators.required, sourceMinValidator()]],
				note: ''
			});
		}
	}

	private getSourceById(id: string): IncomingDonationSource  {
		return find(this.sources, {id: id});
	}
}
