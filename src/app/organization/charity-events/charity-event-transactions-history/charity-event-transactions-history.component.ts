import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {
	OrganizationContractEventsService
} from '../../../core/contracts-services/organization-contract-events.service';
import {EventLog} from 'web3/types';
import {Web3ProviderService} from '../../../core/web3-provider.service';
import * as moment from 'moment';

export interface CharityEventTransaction {
	date?: string;
	amount: string;
	transactionHash: string;
	incomingDonation: string;
	sender: string;
}

interface FundsMovedToCharityEvent {
	incomingDonation: string;
	charityEvent: string;
	sender: string;
	amount: string;
}

@Component({
	templateUrl: 'charity-event-transactions-history.component.html',
	styleUrls: ['charity-event-transactions-history.component.scss']
})
export class CharityEventTransactionsHistoryComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string = null;
	public charityEventAddress: string = null;
	public name: string = "";
	public transactions: CharityEventTransaction[] = [];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private charityEventContractService: CharityEventContractService,
		private organizationContractEventsService: OrganizationContractEventsService,
		private web3ProviderService: Web3ProviderService,
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params["address"];
			this.charityEventAddress = params["event"];
		});
		this.name = await this.charityEventContractService.getName(this.charityEventAddress);
		this.transactions = [];

		this.organizationContractEventsService.getCharityEventTransactions(this.organizationAddress, this.charityEventAddress)
			.subscribe(async (res: EventLog[]) => {
				res.forEach(async (log: EventLog) => {
					const eventValues: FundsMovedToCharityEvent = <FundsMovedToCharityEvent>log.returnValues;
					const blockTimestamp: number = (await this.web3ProviderService.web3.eth.getBlock(log.blockNumber)).timestamp;
					this.transactions.push({
						date: moment(blockTimestamp*1000).format('DD.MM.YYYY'),
						transactionHash: log.transactionHash,
						incomingDonation: eventValues.incomingDonation,
						amount: eventValues.amount,
						sender: eventValues.sender,
					});
				});
			}, (err: any) => {
				console.error(err);
			});
	}

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
