import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';

import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {ContractIncomingDonation, FundsMovedToCharityEvent, IncomingDonationTransaction} from '../../../open-charity-types';
import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState} from '../../../open-charity-types';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {find} from 'lodash';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {Location} from '@angular/common';
import {EventLog} from 'web3/types';
import * as moment from 'moment';
import {OrganizationContractEventsService} from '../../../core/contracts-services/organization-contract-events.service';
import {Web3ProviderService} from '../../../core/web3-provider.service';
import {ErrorMessageService} from '../../../core/error-message.service';
import {LoadingOverlayService} from '../../../core/loading-overlay.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';

@Component({
	templateUrl: 'incoming-donations-details.component.html',
	styleUrls: ['incoming-donations-details.component.scss']
})
export class IncomingDonationsDetailsComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string = null;
	public incomingDonationAddress: string = null;
	public incomingDonation: ContractIncomingDonation = null;
	public name: string = '';
	public transactions: IncomingDonationTransaction[] = [];

	private transactionsLoading: boolean = false;
	private transactionsEmpty: boolean = true;

	private modalRef: NgbModalRef;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private incomingDonationsContractService: IncomingDonationContractService,
		private organizationContractService: OrganizationContractService,
		private tokenContractService: TokenContractService,
		private charityEventContractService: CharityEventContractService,
		private modalService: NgbModal,
		private location: Location,
		private organizationContractEventsService: OrganizationContractEventsService,
		private web3ProviderService: Web3ProviderService,
		private errorMessageService: ErrorMessageService,
		private loadingOverlayService: LoadingOverlayService,
		private organizationSharedService: OrganizationSharedService
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
			this.incomingDonationAddress = params['donation'];
		});
		this.incomingDonation = await this.incomingDonationsContractService.getIncomingDonationDetails(this.incomingDonationAddress);
		this.getCharityEventsByID();

		this.initEventsListeners();
	}

	private initEventsListeners(): void {
		this.organizationSharedService.onMoveFundsToCharityEventAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: IncomingDonationTransaction) => {
				this.transactions.push(res);
				this.modalRef.close();
				this.setTransactionsEmpty(false);
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onMoveFundsToCharityEventAdded');
			});

		this.organizationSharedService.onMoveFundsToCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async () => {
				this.getCharityEventsByID();
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onMoveFundsToCharityEventConfirmed');
			});

		this.organizationSharedService.onMoveFundsToCharityEventFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				const i: number = this.transactions.findIndex(item => { return item.charityEvent === res.address && item.confirmation === ConfirmationStatusState.PENDING; });

				if (i !== -1) {
					this.transactions.splice(i, 1);
				}
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onMoveFundsToCharityEventFailed');
			});

		this.organizationSharedService.onMoveFundsToCharityEventCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				const i: number = this.transactions.findIndex(item => { return item.charityEvent === res.address && item.confirmation === ConfirmationStatusState.PENDING; });

				if (i !== -1) {
					this.transactions.splice(i, 1);
				}
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onMoveFundsToCharityEventCanceled');
			});
	}

	public isDonation(): boolean {
		return this.incomingDonation != null;
	}

	public isPending(incomingDonation: IncomingDonationTransaction): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.PENDING);
	}

	public isConfirmed(incomingDonation: IncomingDonationTransaction): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.CONFIRMED);
	}

	public isFailed(incomingDonation: IncomingDonationTransaction): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.FAILED);
	}

	public isErrored(incomingDonation: IncomingDonationTransaction): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.ERROR);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

	public goBackToPreviousPage(event: Event): void {
		this.location.back();
		event.preventDefault();
	}

	public async openSendDonationFundsModal(incomingDonation: AppIncomingDonation): Promise<void> {
		this.loadingOverlayService.showOverlay(true);

		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		this.loadingOverlayService.hideOverlay();

		this.modalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		this.modalRef.componentInstance.organizationAddress = this.organizationAddress;
		this.modalRef.componentInstance.incomingDonation = incomingDonation;
		this.modalRef.componentInstance.charityEvents = charityEvents;
		this.modalRef.componentInstance.fundsMoved.subscribe(() => {
			this.updateIncomingDonationAmount(this.incomingDonation);
		});
	}

	public async updateIncomingDonationAmount(incomingDonation: ContractIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}

	private getCharityEventsByID() {
		this.transactions = [];

		this.setTransactionsLoading(true);

		this.organizationContractEventsService.getCharityEventsByID(this.organizationAddress, this.incomingDonationAddress)
			.subscribe(async (res: EventLog[]) => {
				res.forEach(async (log: EventLog) => {
					const eventValues: FundsMovedToCharityEvent = <FundsMovedToCharityEvent>log.returnValues;
					const blockTimestamp: number = (await this.web3ProviderService.web3.eth.getBlock(log.blockNumber)).timestamp;
					this.transactions.push({
						date: moment(blockTimestamp * 1000).format('DD.MM.YYYY'),
						transactionHash: log.transactionHash,
						charityEvent: eventValues.charityEvent,
						amount: eventValues.amount,
						sender: eventValues.sender,
						confirmation: ConfirmationStatusState.CONFIRMED
					});
				});

				this.setTransactionsLoading(false);
				this.setTransactionsEmpty(!res.length);
			}, (err: any) => {
				this.errorMessageService.addError(err, 'getCharityEventTransactions');
			});
	}

	public goToTransactions(charityEventAddress: string): void {
		this.router.navigate([`/organization/${this.organizationAddress}/event/${charityEventAddress}/transactions`]);
	}

	public setTransactionsLoading(loading): void {
		this.transactionsLoading = loading;
	}

	public isTransactionsLoading(): boolean {
		return this.transactionsLoading;
	}

	public setTransactionsEmpty(empty): void {
		this.transactionsEmpty = empty;
	}

	public isTransactionsEmpty(): boolean {
		return this.transactionsEmpty;
	}

}
