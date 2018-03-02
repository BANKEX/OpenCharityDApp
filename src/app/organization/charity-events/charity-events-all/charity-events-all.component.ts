import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {constant, findIndex, merge, reverse, times} from 'lodash';

import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventsListBaseComponent} from '../charity-events-list-base.component';
import {MetaDataStorageService} from '../../../core/meta-data-storage.service';

@Component({
	selector: 'opc-charity-events-all',
	templateUrl: 'charity-events-all.component.html',
	styleUrls: ['charity-events-all.component.scss']
})
export class CharityEventsAllComponent extends CharityEventsListBaseComponent implements OnInit, OnDestroy {
	public name: string = '';
	public changer: string = 'actual';

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected charityEventContractService: CharityEventContractService,
		protected tokenContractService: TokenContractService,
		protected zone: NgZone,
		protected metaDataStorageService: MetaDataStorageService,
		private route: ActivatedRoute,
		private router: Router
	) {
		super(organizationContractService, tokenContractService, charityEventContractService, zone, metaDataStorageService);
	}

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => { this.organizationAddress = params['address']; });
		this.name = await this.organizationContractService.getName(this.organizationAddress);
		this.updateCharityEventsList();
	}

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
