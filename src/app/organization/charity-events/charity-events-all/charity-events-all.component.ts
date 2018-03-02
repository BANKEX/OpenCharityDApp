import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {constant, findIndex, merge, reverse, times} from 'lodash';

import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventsListBaseComponent} from '../charity-events-list-base.component';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {AppCharityEvent, ConfirmationResponse, ConfirmationStatusState} from '../../../open-charity-types';
import {OrganizationSharedService} from '../../services/organization-shared.service';

@Component({
	selector: 'opc-charity-events-all',
	templateUrl: 'charity-events-all.component.html',
	styleUrls: ['charity-events-all.component.scss']
})
export class CharityEventsAllComponent extends CharityEventsListBaseComponent implements OnInit, OnDestroy {
	public name: string = '';
	public changer: string = 'actual';

	public isAddCharityFormEnabled: boolean = false;

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected charityEventContractService: CharityEventContractService,
		protected tokenContractService: TokenContractService,
		protected zone: NgZone,
		protected metaDataStorageService: MetaDataStorageService,
		private route: ActivatedRoute,
		private router: Router,
		private organizationSharedService: OrganizationSharedService
	) {
		super(organizationContractService, tokenContractService, charityEventContractService, zone, metaDataStorageService);
	}

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => { this.organizationAddress = params['address']; });
		this.name = await this.organizationContractService.getName(this.organizationAddress);
		this.updateCharityEventsList();
		this.initEventsListeners();
	}

	private initEventsListeners(): void {
		this.organizationSharedService.onCharityEventAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				this.charityEvents.push(merge({}, res, {raised: 0}));
				this.updateCharityEventMetaStorageData(this.charityEvents[this.charityEvents.length-1]);
				this.hideAddCharityEventForm();
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
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
				alert(`Error ${err.message}`);
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
				alert(`Error ${err.message}`);
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
				alert(`Error ${err.message}`);
			});
	}

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}

	public showAddCharityEventForm() {
		this.isAddCharityFormEnabled = true;
	}

	public hideAddCharityEventForm() {
		this.isAddCharityFormEnabled = false;
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
