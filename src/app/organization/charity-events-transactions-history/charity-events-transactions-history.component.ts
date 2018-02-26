import {Component, OnDestroy, OnInit} from '@angular/core';
import {CharityEvent, CharityEventContractService} from '../services/charity-event-contract.service';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
	templateUrl: 'charity-events-transactions-history.component.html',
	styleUrls: ['charity-events-transactions-history.component.scss']
})
export class CharityEventsTransactionsHistoryComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	private organizationAddress: string = null;
	private charityEventAddress: string = null;
	private name: string = "";
	private transactions: any[] = [];



	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private charityEventContractService: CharityEventContractService
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params["address"];
			this.charityEventAddress = params["event"];
		});
		this.name = await this.charityEventContractService.getName(this.charityEventAddress);
		this.transactions = [{
			from: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			transaction: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			value: "500"
		}, {
			from: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			transaction: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			value: "500"
		}, {
			from: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			transaction: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			value: "500"
		}, {
			from: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			transaction: "0xbb8251c7252b6fec412a0a99995ebc1a28e4e103",
			value: "500"
		}];
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

	goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}
}
