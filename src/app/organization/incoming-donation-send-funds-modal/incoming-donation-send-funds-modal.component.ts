import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import {CharityEvent} from '../../core/contracts-services/charity-event-contract.service';
import {IncomingDonation, IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {filter} from 'lodash';
import {TagsBitmaskService} from '../services/tags-bitmask.service';



@Component({
	selector: 'opc-incoming-donation-send-funds-modal',
	templateUrl: 'incoming-donation-send-funds-modal.component.html'
})

export class IncomingDonationSendFundsModalComponent implements OnInit {
	@Input('charityEvents') charityEvents: CharityEvent[];
	@Input('incomingDonation') incomingDonation: IncomingDonation;
	@ViewChild('instance') instance: NgbTypeahead;
	focus$ = new Subject<string>();
	click$ = new Subject<string>();

	public formatter: any;
	public search: any;
	public statesWithFlags: any;

	public targetCharityEvent: CharityEvent;
	public amount: string;
	public moveFundsForm: FormGroup;

	constructor(
		private incomingDonationContractService: IncomingDonationContractService,
		private tagsBitmaskService: TagsBitmaskService,
		private fb: FormBuilder,
	) {
	}

	public ngOnInit(): void {
		this.statesWithFlags = this.filterCharityEventsByTags(this.charityEvents);
		this.search = (text$: Observable<string>) =>
			text$
				.debounceTime(200).distinctUntilChanged()
				.merge(this.focus$)
				.merge(this.click$.filter(() => !this.instance.isPopupOpen()))
				.map(term => term === '' ?  this.statesWithFlags
					: this.statesWithFlags.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));

		this.formatter = (x: {name: string}) => x.name;

		this.initForm();
	}

	private filterCharityEventsByTags(charityEvents: CharityEvent[]): CharityEvent[] {
		const donationTags = parseInt(this.incomingDonation.tags, 16);
		return charityEvents.filter((event) => {
			return this.tagsBitmaskService.containSimilarTags(parseInt(event.tags, 16), donationTags);
		});
	}

	private initForm(): void {
		this.moveFundsForm = this.fb.group({
			targetCharityEvent: ['', [Validators.required]],
			amount: ['', [Validators.required, this.validateAmount.bind(this)]]
		})
	}

	private validateAmount(control: AbstractControl): ValidationErrors | null {
		if (parseInt(control.value, 10) > parseInt(this.incomingDonation.amount, 10)) {
			return { moreThanMax: true };
		}

		if( parseInt(control.value, 10) <= 0) {
			return { lessThanMin: true };
		}

		return null;
	}


	public async sendFounds(targetCharityEvent: CharityEvent, amount: string): Promise<void> {
		try {
			const transaction = await this.incomingDonationContractService.moveToCharityEvent(this.incomingDonation.address, targetCharityEvent.address, amount);
			console.log(transaction);
		} catch (e) {
			console.log(e);
		}
	}

}

