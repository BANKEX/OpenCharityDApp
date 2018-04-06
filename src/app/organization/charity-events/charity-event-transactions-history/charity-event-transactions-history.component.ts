import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {
	OrganizationContractEventsService
} from '../../../core/contracts-services/organization-contract-events.service';
import {EventLog} from 'web3/types';
import {Web3ProviderService} from '../../../core/web3-provider.service';
import {Location} from '@angular/common';
import * as moment from 'moment';
import {ErrorMessageService} from '../../../core/error-message.service';
import {FundsMovedToCharityEvent} from '../../../open-charity-types';

export type CharityEventTransaction = {
	date?: string;
	amount: string;
	transactionHash: string;
	incomingDonation: string;
	sender: string;
};

@Component({
	templateUrl: 'charity-event-transactions-history.component.html',
	styleUrls: ['charity-event-transactions-history.component.scss']
})
export class CharityEventTransactionsHistoryComponent implements OnInit, OnDestroy {
	public organizationAddress: string = null;
	public charityEventAddress: string = null;
	public charityEventDate: Date = null;
	public name: string = '';
	public transactions: CharityEventTransaction[] = [];
	private componentDestroyed: Subject<void> = new Subject<void>();

	private transactionsLoading: boolean = false;
	private transactionsEmpty: boolean = false;

	constructor(private router: Router,
				private route: ActivatedRoute,
				private charityEventContractService: CharityEventContractService,
				private organizationContractEventsService: OrganizationContractEventsService,
				private web3ProviderService: Web3ProviderService,
				private location: Location,
				private errorMessageService: ErrorMessageService) {
	}

	public async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
			this.charityEventAddress = params['event'];
		});
		this.charityEventDate = new Date(+this.route.snapshot.queryParamMap.get('date'));
		this.name = await this.charityEventContractService.getName(this.charityEventAddress);
		this.transactions = [];

		this.setTransactionsLoading(true);

		this.organizationContractEventsService.getCharityEventTransactions(this.organizationAddress, this.charityEventAddress)
			.subscribe(async (res: EventLog[]) => {
				res.forEach(async (log: EventLog) => {
					const eventValues: FundsMovedToCharityEvent = <FundsMovedToCharityEvent>log.returnValues;
					const blockTimestamp: number = (await this.web3ProviderService.web3.eth.getBlock(log.blockNumber)).timestamp;
					this.transactions.push({
						date: moment(blockTimestamp * 1000).format('DD.MM.YYYY'),
						transactionHash: log.transactionHash,
						incomingDonation: eventValues.incomingDonation,
						amount: eventValues.amount,
						sender: eventValues.sender,
					});
				});
				this.setTransactionsLoading(false);
				this.setTransactionsEmpty(!res.length);
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'getCharityEventTransactions');
			});
	}

	public goBackToPreviousPage(event: Event): void {
		this.location.back();
		event.preventDefault();
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

	public toDetails(incomingDonationAddress: string): void {
		this.router.navigate([`/organization/${this.organizationAddress}/donation/${incomingDonationAddress}/details`]);
	}

	public ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
