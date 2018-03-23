import {Component, Input, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {constant, find, findIndex, merge, reverse, times} from 'lodash';

import {AppIncomingDonation, ConfirmationStatusState} from '../../../open-charity-types';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {IncomingDonationsListBaseComponent} from '../incoming-donations-list-base.component';

@Component({
	selector: 'opc-dashboard-incoming-donations-list',
	templateUrl: 'dashboard-incoming-donations-list.component.html',
	styleUrls: ['dashboard-incoming-donations-list.component.scss']
})
export class DashboardIncomingDonationsListComponent extends IncomingDonationsListBaseComponent implements OnInit {


	constructor(protected organizationContractService: OrganizationContractService,
				protected incomingDonationContractService: IncomingDonationContractService,
				protected tokenContractService: TokenContractService,
				protected router: Router,
				protected route: ActivatedRoute,
				protected zone: NgZone) {
		super(router, route, tokenContractService, organizationContractService, incomingDonationContractService, zone)
	}

	async ngOnInit(): Promise<void> {
		this.updateIncomingDonationsList();
	}

	public toAllDonations() {
		this.router.navigate([`/organization/${this.organizationAddress}/donations`]);
	}

}
