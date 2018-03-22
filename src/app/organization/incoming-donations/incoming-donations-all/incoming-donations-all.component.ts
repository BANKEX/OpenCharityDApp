import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {ActivatedRoute, Router} from '@angular/router';
import {constant, find, findIndex, merge, reverse, times} from 'lodash';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import {AppIncomingDonation, ConfirmationStatusState} from '../../../open-charity-types';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';

@Component({
	templateUrl: 'incoming-donations-all.component.html',
	styleUrls: ['incoming-donations-all.component.scss']
})
export class IncomingDonationsAllComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string;
	public incomingDonations: AppIncomingDonation[] = [];
	public name: string = '';

	constructor(private organizationContractService: OrganizationContractService,
				private incomingDonationContractService: IncomingDonationContractService,
				private charityEventContractService: CharityEventContractService,
				private tokenContractService: TokenContractService,
				private modalService: NgbModal,
				private router: Router,
				private route: ActivatedRoute,
				private zone: NgZone) {
	}

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
		});
		await this.updateIncomingDonationsList();
		this.name = await this.organizationContractService.getName(this.organizationAddress);
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

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}

	public addClick() {
		this.router.navigate([`/organization/${this.organizationAddress}/donation/add`]);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
