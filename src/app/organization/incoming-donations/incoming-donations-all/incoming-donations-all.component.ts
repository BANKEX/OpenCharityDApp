import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {assign, constant, filter, find, findIndex, merge, reverse, times} from 'lodash';

import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {IncomingDonationsListBaseComponent} from '../incoming-donations-list-base.component';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorMessageService} from '../../../core/error-message.service';
import {OrganizationContractEventsService} from '../../../core/contracts-services/organization-contract-events.service';
import {NgProgress} from '@ngx-progressbar/core';

@Component({
	templateUrl: 'incoming-donations-all.component.html',
	styleUrls: ['incoming-donations-all.component.scss']
})
export class IncomingDonationsAllComponent extends IncomingDonationsListBaseComponent implements OnInit, OnDestroy {
	public organizationName: string = '';

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected incomingDonationContractService: IncomingDonationContractService,
		protected tokenContractService: TokenContractService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected zone: NgZone,
		protected organizationSharedService: OrganizationSharedService,
		protected modal: NgbModal,
		protected errorMessageService: ErrorMessageService,
		protected organizationContractEventsService: OrganizationContractEventsService,
		protected progress: NgProgress,
	) {
		super(
			router,
			route,
			tokenContractService,
			organizationContractService,
			incomingDonationContractService,
			zone,
			organizationSharedService,
			modal,
			errorMessageService,
			organizationContractEventsService,
			progress,
		);
	}

	public async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
		});

		this.updateIncomingDonationsList();

		this.organizationName = await this.organizationContractService.getName(this.organizationAddress);
	}

}
