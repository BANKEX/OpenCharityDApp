import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {constant, findIndex, merge, reverse, times} from 'lodash';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventsListBaseComponent} from '../charity-events-list-base.component';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {ConfirmationResponse} from '../../../open-charity-types';
import {OrganizationSharedService} from '../../services/organization-shared.service';

@Component({
	selector: 'opc-dashboard-charity-events-list',
	templateUrl: 'dashboard-charity-events-list.component.html',
	styleUrls: ['dashboard-charity-events-list.component.scss']
})
export class DashboardCharityEventsList extends CharityEventsListBaseComponent implements OnInit, OnDestroy {
	constructor(
		protected organizationContractService: OrganizationContractService,
		protected charityEventContractService: CharityEventContractService,
		protected tokenContractService: TokenContractService,
		protected zone: NgZone,
		protected route: ActivatedRoute,
		protected metaDataStorageService: MetaDataStorageService,
		private router: Router,
		private organizationSharedService: OrganizationSharedService
	) {
		super(organizationContractService, tokenContractService, charityEventContractService, zone, metaDataStorageService);
	}

	ngOnInit(): void {
		this.route.params.subscribe(params => { this.organizationAddress = params['address']; });
		this.updateCharityEventsList();
		this.initEventsListeners();
	}

	public toAllCharityEvents() {
		this.router.navigate([`/organization/${this.organizationAddress}/events`]);
	}

	public initEventsListeners(): void {
		this.organizationSharedService.onMoveFundsToCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				const i: number = findIndex(this.charityEvents, {address: res.address});

				if (i !== -1) {
					await this.updateCharityEventRaised(this.charityEvents[i]);
				}
			}, (err: any) => {
				console.error(err);
				alert(`Error ${err.message}`);
			});
	}

}
