import {Component, Input, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {TransactionReceipt, PromiEvent} from 'web3/types';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {AppIncomingDonation, ConfirmationStatusState, ContractIncomingDonation, AppCharityEvent} from '../../../open-charity-types';
import {NgbTypeahead, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {find} from 'lodash';
import {isString} from 'ng2-toasty/src/toasty.utils';
import {isObject} from 'rxjs/util/isObject';
import {PendingTransactionSourceType} from '../../../pending-transaction.types';
import {PendingTransactionService} from '../../../core/pending-transactions.service';
import {ToastyService} from 'ng2-toasty';
import {ErrorMessageService} from '../../../core/error-message.service';
import {LoadingOverlayService} from '../../../core/loading-overlay.service';
import {TagService} from '../../services/tag.service';
// tslint:disable:no-any

type IncomingDonationSource = {
	id: number;
	name: string;
};

export function sourceMinValidator(): ValidatorFn {
	return (control: AbstractControl): {[key: string]: object} => {
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
	@Input('charityEvent' ) public charityEvent: AppCharityEvent;
	@Input('organizationAddress') public organizationAddress: string;
	@Input('incomingDonation') public incomingDonation: AppIncomingDonation;
	@Output('transactionHash$') public transactionHash$: EventEmitter<string> = new EventEmitter();

	@ViewChild('typeahead') public sourceTypeahead: NgbTypeahead;
	public focus$ = new Subject<string>();
	public click$ = new Subject<string>();

	public formatter: Function;
	public incomingDonationForm: FormGroup;
	public search: Function;
	public selectedTagNames: string[] = [];
	public sources: IncomingDonationSource[] = [];

	constructor(
		private errorMessageService: ErrorMessageService,
		private fb: FormBuilder,
		private activeModal: NgbActiveModal,
		private loadingOverlayService: LoadingOverlayService,
		private organizationContractService: OrganizationContractService,
		private organizationSharedService: OrganizationSharedService,
		private pendingTransactionService: PendingTransactionService,
		private toastyService: ToastyService,
		private tagService: TagService,
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

		// TODO: Add test data
		// this.addTestData();
	}

	public async submitForm(data?: ContractIncomingDonation) {
		// if (this.incomingDonationForm.invalid && !data) { return; }
		const f = this.incomingDonationForm.value;
		const tags = this.charityEvent ? this.charityEvent.tags : (await this.tagService.getTagIds(this.selectedTagNames)).map((item: any) => item.tagID);
		const newIncomingDonation: ContractIncomingDonation = data ? data : {
			realWorldsIdentifier: f.realWorldIdentifier,
			amount: f.amount,
			note: f.note,
			tags: tags,
			sourceId: f.source.id
		};

		let incomingDonationInternalId: string = this.organizationSharedService.makePseudoRandomHash(newIncomingDonation);
		let receipt: TransactionReceipt;
		let transaction: PromiEvent<TransactionReceipt>;
		let newIncomingDonationAddress: string = null;
		try {

			if (!data)
				this.organizationSharedService.incomingDonationAdded({
					realWorldsIdentifier: f.realWorldsIdentifier,
					amount: f.amount,
					note: f.note,
					tags: tags,
					sourceId: f.source.id,
					internalId: incomingDonationInternalId,
					confirmation: ConfirmationStatusState.PENDING
				});

			this.pendingTransactionService.addPending(
				newIncomingDonation.realWorldsIdentifier,
				'Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction pending',
				PendingTransactionSourceType.ID
			);
			this.toastyService.warning('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction pending');
			this.loadingOverlayService.showOverlay(true);
			transaction = this.organizationContractService.addIncomingDonation(
				this.organizationAddress,
				newIncomingDonation.realWorldsIdentifier,
				newIncomingDonation.amount,
				newIncomingDonation.note,
				newIncomingDonation.tags,
				newIncomingDonation.sourceId
			);
			transaction.on('transactionHash', (hash) => {
				this.loadingOverlayService.hideOverlay();
				this.transactionHash$.emit(hash);
				this.organizationSharedService.incomingDonationSubmited(incomingDonationInternalId, undefined , hash);
			});
			receipt = await transaction;

			if (receipt.events && receipt.events.IncomingDonationAdded) {
				newIncomingDonationAddress = receipt.events.IncomingDonationAdded.returnValues['incomingDonation'];
				this.organizationSharedService.incomingDonationConfirmed(incomingDonationInternalId, newIncomingDonationAddress, receipt.transactionHash);
				this.pendingTransactionService.addConfirmed(
					newIncomingDonation.realWorldsIdentifier,
					'Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction confirmed',
					PendingTransactionSourceType.ID
				);
				this.toastyService.success('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction confirmed');
			} else {
				this.organizationSharedService.incomingDonationFailed(incomingDonationInternalId, newIncomingDonationAddress);
				this.pendingTransactionService.addFailed(
					newIncomingDonation.realWorldsIdentifier,
					'Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction failed',
					PendingTransactionSourceType.ID
				);
				this.toastyService.error('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction failed');
			}

			this.initForm();

		} catch (e) {
			this.loadingOverlayService.hideOverlay();
			this.activeModal.close();
			if (e.message.search('MetaMask Tx Signature: User denied transaction signature') !== -1) {
				this.organizationSharedService.incomingDonationCanceled(incomingDonationInternalId, newIncomingDonationAddress);
				this.pendingTransactionService.addFailed(
					newIncomingDonation.realWorldsIdentifier,
					'Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction canceled',
					PendingTransactionSourceType.ID
				);
				this.toastyService.error('Adding ' + newIncomingDonation.realWorldsIdentifier + ' transaction canceled');
			} else {
				// TODO:  global errors notifier
				this.errorMessageService.addError(e.message, 'submitForm');
			}
		}

	}

	public async getListOfSources(): Promise<void>  {
		const sourceIds: number = parseInt(await this.organizationContractService.getIncomingDonationsSourcesIds(this.organizationAddress));

		for (let i = 0; i < sourceIds; i++) {
			this.sources[i] = {
				id: i,
				name: await this.organizationContractService.getIncomingDonationSourceName(this.organizationAddress, i)
			};
		}
	}

	public tagsChanged(tagNames: string[]) {
		this.selectedTagNames = tagNames;
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

	private async addTestData() {
		const data: ContractIncomingDonation[] = this.organizationSharedService.getTestDataIncomingDonations();

		data.forEach(async (item: ContractIncomingDonation) => await this.submitForm(item));
	}
}
