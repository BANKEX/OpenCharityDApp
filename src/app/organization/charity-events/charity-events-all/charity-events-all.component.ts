import {Component, NgZone, OnDestroy, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {constant, findIndex, merge, reverse, times} from 'lodash';

import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventsListBaseComponent} from '../charity-events-list-base.component';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorMessageService} from '../../../core/error-message.service';
import { OrganizationContractEventsService } from '../../../core/contracts-services/organization-contract-events.service';
import { Web3ProviderService } from '../../../core/web3-provider.service';
import {AsyncLocalStorage} from 'angular-async-local-storage';
import {NgProgress} from '@ngx-progressbar/core';

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
		protected organizationContractEventsService: OrganizationContractEventsService,
		protected charityEventContractService: CharityEventContractService,
		protected tokenContractService: TokenContractService,
		protected zone: NgZone,
		protected metaDataStorageService: MetaDataStorageService,
		protected modal: NgbModal,
		protected organizationSharedService: OrganizationSharedService,
		protected errorMessageService: ErrorMessageService,
		protected web3ProviderService: Web3ProviderService,
		protected localStorage: AsyncLocalStorage,
		protected progress: NgProgress,
		protected cdf: ChangeDetectorRef,
		private route: ActivatedRoute,
		private router: Router
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
			cdf
		);
	}

	public async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => { this.organizationAddress = params['address']; });
		this.name = await this.organizationContractService.getName(this.organizationAddress);
		this.updateCharityEventsList();
		this.initEventsListeners();
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

	public ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
