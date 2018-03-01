import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {constant, findIndex, merge, reverse, times} from 'lodash';

import {AppCharityEvent, ConfirmationResponse, ConfirmationStatusState} from '../../open-charity-types';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
// import {OrganizationSharedService} from '../services/organization-shared.service';

@Component({
	selector: 'opc-actual-charity-events',
	templateUrl: 'actual-events.component.html',
	styleUrls: ['actual-events.component.scss']
})
export class ActualCharityEventsComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public address: string = "";
	public charityEvents: AppCharityEvent[] = [];

	constructor(
		private organizationContractService: OrganizationContractService,
		private charityEventContractService: CharityEventContractService,
		private tokenContractService: TokenContractService,
		private router: Router,
		private route: ActivatedRoute,
		private zone: NgZone,
		// private organizationSharedService: OrganizationSharedService,
		private changer: ChangeDetectorRef
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => { this.address = params["address"]; });
		await this.updateCharityEventsList();

		// this.organizationSharedService.onCharityEventAdded()
		// 	.takeUntil(this.componentDestroyed)
		// 	.subscribe((res: AppCharityEvent) => {
		// 		this.charityEvents.push(merge({}, res, {raised: 0}));
		// 	}, (err: any) => { console.error(err); });
		//
		// this.organizationSharedService.onCharityEventConfirmed()
		// 	.takeUntil(this.componentDestroyed)
		// 	.subscribe((res: ConfirmationResponse) => {
		// 		const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
		// 		if (i !== -1) {
		// 			this.charityEvents[i].address = res.address;
		// 			this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
		// 		}
		// 	}, (err: any) => { console.error(err); });
		//
		// this.organizationSharedService.onCharityEventFailed()
		// 	.takeUntil(this.componentDestroyed)
		// 	.subscribe((res: ConfirmationResponse) => {
		// 		const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
		// 		if (i !== -1) {
		// 			this.charityEvents[i].confirmation = ConfirmationStatusState.FAILED;
		// 		}
		// 	}, (err: any) => { console.error(err); });
		//
		// this.organizationSharedService.onCharityEventCanceled()
		// 	.takeUntil(this.componentDestroyed)
		// 	.subscribe((res: ConfirmationResponse) => {
		// 		const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
		// 		if (i !== -1) {
		// 			this.charityEvents.splice(i, 1);
		// 		}
		// 	}, (err: any) => { console.error(err); });
	}

	public async updateCharityEventsList(): Promise<void> {
		// get amount of organization incoming donations
		const charityEventsCount: number = parseInt(await this.organizationContractService.getCharityEventsCount(this.address), 10);


		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.charityEvents = times(charityEventsCount, constant(null));


		this.organizationContractService.getCharityEvents(this.address)
			.take(charityEventsCount)
			.subscribe(async (res: { address: string, index: number }) => {

				// it is a hack. without zone.run it doesn't work properly:
				// it doesn't update charityEvents in template
				// if you change it to .detectChanges, it breaks further change detection of other comopnents
				// if you know how to fix it, please do it
				this.zone.run(async() => {
					this.charityEvents[res.index] = merge({}, await this.charityEventContractService.getCharityEventDetails(res.address), {
						confirmation: ConfirmationStatusState.CONFIRMED
					});

					await this.updateCharityEventRaised(this.charityEvents[res.index]);
				});
			});
	}

	private async updateCharityEventRaised(charityEvent: AppCharityEvent) {
		charityEvent.raised = await this.tokenContractService.balanceOf(charityEvent.address);
	}

	public toAllCharityEvents() {
		this.router.navigate([`/organization/${this.address}/charityeventsall`]);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
