import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';

@Component({
	templateUrl: 'charity-events-transactions-history.component.html',
	styleUrls: ['charity-events-transactions-history.component.scss']
})
export class CharityEventsTransactionsHistoryComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string = null;
	public charityEventAddress: string = null;
	public name: string = "";
	public transactions: any[] = [];



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
