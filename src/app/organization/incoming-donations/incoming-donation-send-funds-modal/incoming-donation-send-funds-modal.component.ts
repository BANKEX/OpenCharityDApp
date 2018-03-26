import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgbActiveModal, NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs/Observable';
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {filter} from 'lodash';
import {TagsBitmaskService} from '../../services/tags-bitmask.service';
import {ContractCharityEvent, ContractIncomingDonation, AppCharityEvent} from '../../../open-charity-types';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';


@Component({
	selector: 'opc-incoming-donation-send-funds-modal',
	templateUrl: 'incoming-donation-send-funds-modal.component.html'
})

export class IncomingDonationSendFundsModalComponent implements OnInit {
	@Input('charityEvent') charityEvent: AppCharityEvent; // If spcified - move all funds to this CE
	@Input('organizationAddress') organizationAddress: string;
	@Input('charityEvents') charityEvents: ContractCharityEvent[];
	@Input('incomingDonation') incomingDonation: ContractIncomingDonation;
	@Output('fundsMoved') fundsMoved: EventEmitter<string> = new EventEmitter<string>();
	@ViewChild('typeahead') typeahead: NgbTypeahead;
	focus$ = new Subject<string>();
	click$ = new Subject<string>();

	public formatter: any;
	public search: any;
	public statesWithFlags: any;

	public amount: string;
	public moveFundsForm: FormGroup;

	constructor(
		private organizationContractService: OrganizationContractService,
		private incomingDonationContractService: IncomingDonationContractService,
		private tagsBitmaskService: TagsBitmaskService,
		private fb: FormBuilder,
		private activeModal: NgbActiveModal
	) {
	}

	public ngOnInit(): void {
		this.statesWithFlags = this.filterContractCharityEventsByTags(this.charityEvents);
		this.search = (text$: Observable<string>) =>
			text$
				.debounceTime(200).distinctUntilChanged()
				.merge(this.focus$)
				.merge(this.click$.filter(() => !this.typeahead.isPopupOpen()))
				.map(term => term === '' ?  this.statesWithFlags
					: this.statesWithFlags.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));

		this.formatter = (x: {name: string}) => x.name;

		this.initForm();
	}

	private filterContractCharityEventsByTags(charityEvents: ContractCharityEvent[]): ContractCharityEvent[] {
		const donationTags = parseInt(this.incomingDonation.tags, 16);
		return charityEvents.filter((event) => {
			return this.tagsBitmaskService.containSimilarTags(parseInt(event.tags, 16), donationTags);
		});
	}

	private initForm(): void {
		this.moveFundsForm = this.fb.group({
			targetCharityEvent: ['', [Validators.required]],
			amount: ['', [Validators.required, this.validateAmount.bind(this)]]
		});
		// set initial data to the form fields
		if (this.charityEvent) {
			this.moveFundsForm.setValue({
				targetCharityEvent: this.charityEvent,
				amount: this.incomingDonation.amount,
			  });
		}
	}

	private validateAmount(control: AbstractControl): ValidationErrors | null {
		if (parseInt(control.value, 10) > parseInt(this.incomingDonation.amount, 10)) {
			return { moreThanMax: true };
		}

		if (parseInt(control.value, 10) <= 0) {
			return { lessThanMin: true };
		}

		return null;
	}


	// tslint:disable-next-line:member-ordering
	public async sendFunds(targetCharityEvent: ContractCharityEvent, amount: string): Promise<void> {
		try {
			const tran = await this.organizationContractService.moveFundsToCharityEvent(this.organizationAddress, this.incomingDonation.address, targetCharityEvent.address, amount);
			console.log(tran);
			this.fundsMoved.emit(this.incomingDonation.address);
			this.activeModal.close();
		} catch (e) {
			console.log(e);
		}
	}




}

