import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {Subject} from 'rxjs/Subject';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {OrganizationContractEventsService} from '../../core/contracts-services/organization-contract-events.service';
import {constant, findIndex, merge, reverse, times} from 'lodash';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {AppCharityEvent, ConfirmationResponse, ConfirmationStatusState} from '../../open-charity-types';


@Component({
	selector: 'opc-charity-events-list',
	templateUrl: 'charity-events-list.component.html',
	styleUrls: ['charity-events-list.component.scss']
})
export class CharityEventsListComponent implements OnInit, OnDestroy {
	@Input('organizationContractAddress') organizationContractAddress: string;

	public charityEvents: AppCharityEvent[] = [];
	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(private organizationContractService: OrganizationContractService,
				private charityEventContractService: CharityEventContractService,
				private tokenContractService: TokenContractService,
				private organizationContractEventsService: OrganizationContractEventsService,
				private organizationSharedService: OrganizationSharedService,
				private cd: ChangeDetectorRef) {

	}

	async ngOnInit(): Promise<void> {
		this.updateCharityEventsList();
		this.initEventsListeners();
	}

	private initEventsListeners(): void {
		this.organizationSharedService.onCharityEventAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				this.charityEvents.push(merge({}, res, {raised: 0}));
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});


		this.organizationSharedService.onCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {
				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
				if (i !== -1) {
					this.charityEvents[i].address = res.address;
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
				}
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});

		this.organizationSharedService.onCharityEventFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
				if (i !== -1) {
					this.charityEvents[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
			});


		this.organizationSharedService.onCharityEventCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});
				if (i !== -1) {
					this.charityEvents.splice(i, 1);
				}
			}, (err: any) => {
				console.error(err);
				alert('`Error ${err.message}');
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
		let loadedItemsCount: number = charityEventsCount;

		this.organizationContractService.getCharityEvents(this.organizationContractAddress)
			.takeWhile(() => loadedItemsCount > 0)
			.subscribe(async (res: { address: string, index: number }) => {
				this.charityEvents[res.index] = merge({}, await this.charityEventContractService.getCharityEventDetails(res.address), {
					confirmation: ConfirmationStatusState.CONFIRMED
				});
				await this.updateCharityEventRaised(this.charityEvents[res.index]);
				this.cd.detectChanges();

				loadedItemsCount--;

			});
	}


	public async updateCharityEventsListSync(): Promise<void> {
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationContractAddress);
		this.charityEvents = reverse(await this.charityEventContractService.getCharityEventsList(charityEventsAddresses));
		this.updateCharityEventsRaised(this.charityEvents);
	}

	public isPending(charityEvent: AppCharityEvent): boolean {
		return (charityEvent.confirmation === ConfirmationStatusState.PENDING);
	}

	public isConfirmed(charityEvent: AppCharityEvent): boolean {
		return (charityEvent.confirmation === ConfirmationStatusState.CONFIRMED);
	}

	public isFailed(charityEvent: AppCharityEvent): boolean {
		return (charityEvent.confirmation === ConfirmationStatusState.FAILED);
	}

	public isErrored(charityEvent: AppCharityEvent): boolean {
		return (charityEvent.confirmation === ConfirmationStatusState.ERROR);
	}


	private async updateCharityEventRaised(charityEvent: AppCharityEvent) {
		charityEvent.raised = await this.tokenContractService.balanceOf(charityEvent.address);
	}

	private async updateCharityEventsRaised(charityEvents: AppCharityEvent[]) {
		charityEvents.forEach(async (charityEvent) => {
			this.updateCharityEventRaised(charityEvent);
		});
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
