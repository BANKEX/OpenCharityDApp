import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {OrganizationContractService} from '../services/organization-contract.service';
import {CharityEvent, CharityEventContractService} from '../services/charity-event-contract.service';
import {Subject} from 'rxjs/Subject';
import {TokenContractService} from '../../core/token-contract.service';
import {OrganizationContractEventsService} from '../services/organization-contract-events.service';
import {reverse, times, constant} from 'lodash';

@Component({
	selector: 'opc-charity-events-list',
	templateUrl: 'charity-events-list.component.html',
	styleUrls: ['charity-events-list.component.scss']
})
export class CharityEventsListComponent implements OnInit, OnDestroy {
	@Input('organizationContractAddress') organizationContractAddress: string;
	charityEvents: CharityEvent[] = [];
	private componentDestroyed: Subject<void> = new Subject<void>();



	constructor(private organizationContractService: OrganizationContractService,
				private charityEventContractService: CharityEventContractService,
				private tokenContractService: TokenContractService,
				private organizationContractEventsService: OrganizationContractEventsService,
				private cd: ChangeDetectorRef
) {

	}

	async ngOnInit(): Promise<void> {
		this.updateCharityEventsList();

		this.organizationContractEventsService.onCharityEventAdded(this.organizationContractAddress)
		    .takeUntil(this.componentDestroyed)
		    .subscribe((event: any) => {
		            this.updateCharityEventsList();
		        },
		        (err) => {
		            alert(`Error: ${err}`);
		        });
	}

	public async updateCharityEventsList(): Promise<void> {
		// get amount of organization incoming donations
		const charityEventsCount: number = parseInt(await this.organizationContractService.getCharityEventsCount(this.organizationContractAddress), 10);


		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.charityEvents = times(charityEventsCount, constant(null));


		// this counter is used to track how much items is loaded
		// if all data is loaded, unsubscribe from Observable
		let charityEventsCounter: number = charityEventsCount;

		this.organizationContractService.getCharityEvents(this.organizationContractAddress)
			.takeWhile(() => charityEventsCounter > 0 )
			.subscribe(async (res: { address: string, index: number }) => {
				try {
					this.charityEvents[res.index] = await this.charityEventContractService.getCharityEventDetails(res.address);
					await this.updateCharityEventRaised(this.charityEvents[res.index]);
					this.cd.detectChanges();

				} catch(e) {
					console.error(e);
				}

				charityEventsCounter--;

			});
	}


	public async updateCharityEventsListSync(): Promise<void> {
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationContractAddress);
		this.charityEvents = reverse(await this.charityEventContractService.getCharityEventsList(charityEventsAddresses));
		this.updateCharityEventsRaised(this.charityEvents);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}


	private async updateCharityEventRaised(charityEvent: CharityEvent) {
		charityEvent.raised = await this.tokenContractService.balanceOf(charityEvent.address);
	}

	private async updateCharityEventsRaised(charityEvents: CharityEvent[]) {
		charityEvents.forEach(async (charityEvent) => {
			this.updateCharityEventRaised(charityEvent);
		});
	}
}
