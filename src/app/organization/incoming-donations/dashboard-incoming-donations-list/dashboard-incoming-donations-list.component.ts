import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {constant, find, findIndex, merge, reverse, times} from 'lodash';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {AppIncomingDonation, ConfirmationStatusState} from '../../../open-charity-types';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {OrganizationSharedService} from '../../services/organization-shared.service';

@Component({
	selector: 'opc-dashboard-incoming-donations-list',
	templateUrl: 'dashboard-incoming-donations-list.component.html',
	styleUrls: ['dashboard-incoming-donations-list.component.scss']
})
export class DashboardIncomingDonationsListComponent  implements OnInit {
	@Input('organizationAddress') organizationAddress: string;

	public incomingDonations: AppIncomingDonation[] = [];

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected incomingDonationContractService: IncomingDonationContractService,
		protected tokenContractService: TokenContractService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected zone: NgZone
	) {
	}

	async ngOnInit(): Promise<void> {
		this.updateIncomingDonationsList();
	}

	public async updateIncomingDonationsList(): Promise<void> {
		// get amount of organization incoming donations
		const incomingDonationsCount: number = parseInt(await this.organizationContractService.getIncomingDonationsCount(this.organizationAddress), 10);

		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.incomingDonations = times(incomingDonationsCount, constant(null));


		this.organizationContractService.getIncomingDonations(this.organizationAddress)
			.take(incomingDonationsCount)
			.subscribe(async (res: { address: string, index: number }) => {

				// it is a hack. without zone.run it doesn't work properly:
				// it doesn't update incoming donations in template
				// if you change it to .detectChanges, it breaks further change detection of other components
				// if you know how to fix it, please do it
				this.zone.run(async () => {
					this.incomingDonations[res.index] = merge({}, await this.incomingDonationContractService.getIncomingDonationDetails(res.address), {
						confirmation: ConfirmationStatusState.CONFIRMED
					});
					await this.updateIncomingDonationAmount(this.incomingDonations[res.index]);
				});

			});
	}

	public async updateIncomingDonationAmount(incomingDonation: AppIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}


	public toDetails(incomingDonation: AppIncomingDonation): void {
		this.router.navigate([`/organization/${this.organizationAddress}/donation/${incomingDonation.address}/details`]);
	}

	public toAllDonations() {
		this.router.navigate([`/organization/${this.organizationAddress}/donations`]);
	}

	public addClick() {
		this.router.navigate([`/organization/${this.organizationAddress}/donation/add`]);
	}

}
