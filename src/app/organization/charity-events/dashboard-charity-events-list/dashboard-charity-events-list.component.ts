import {Component, NgZone, OnDestroy, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {constant, findIndex, merge, reverse, times} from 'lodash';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventsListBaseComponent} from '../charity-events-list-base.component';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorMessageService} from '../../../core/error-message.service';
import {OrganizationContractEventsService} from '../../../core/contracts-services/organization-contract-events.service';
import {Web3ProviderService} from '../../../core/web3-provider.service';
import {AsyncLocalStorage} from 'angular-async-local-storage';
import {NgProgress} from '@ngx-progressbar/core';

@Component({
	selector: 'opc-dashboard-charity-events-list',
	templateUrl: 'dashboard-charity-events-list.component.html',
	styleUrls: ['dashboard-charity-events-list.component.scss']
})
export class DashboardCharityEventsListComponent extends CharityEventsListBaseComponent implements OnInit, OnDestroy {
	constructor(
		protected organizationContractService: OrganizationContractService,
		protected organizationContractEventsService: OrganizationContractEventsService,
		protected charityEventContractService: CharityEventContractService,
		protected tokenContractService: TokenContractService,
		protected zone: NgZone,
		protected route: ActivatedRoute,
		protected metaDataStorageService: MetaDataStorageService,
		protected modal: NgbModal,
		protected organizationSharedService: OrganizationSharedService,
		protected errorMessageService: ErrorMessageService,
		protected web3ProviderService: Web3ProviderService,
		protected localStorage: AsyncLocalStorage,
		protected progress: NgProgress,
		protected cdf: ChangeDetectorRef,
		private router: Router,
	) {
		super(
			organizationContractService,
			organizationContractEventsService,
			tokenContractService,
			charityEventContractService,
			zone,
			metaDataStorageService,
			modal,
			organizationSharedService,
			errorMessageService,
			web3ProviderService,
			localStorage,
			progress,
			cdf,
		);
	}

	public async ngOnInit() {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
		});
		await this.updateCharityEventsList();
		this.initEventsListeners();
	}

	public toAllCharityEvents() {
		this.router.navigate([`/organization/${this.organizationAddress}/events`]);
	}
}
