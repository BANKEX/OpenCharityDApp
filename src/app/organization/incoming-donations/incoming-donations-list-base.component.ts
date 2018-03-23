import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AppIncomingDonation, ConfirmationStatusState} from '../../open-charity-types';
import {Subject} from 'rxjs/Subject';
import {ActivatedRoute, Router} from '@angular/router';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {assign, constant, filter, find, findIndex, merge, reverse, times} from 'lodash';
import {IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';

@Component({
	selector: 'opc-incoming-donations-list-base',
	template: ''
})
export class IncomingDonationsListBaseComponent implements OnInit, OnDestroy {
	@Input('organizationAddress') organizationAddress: string;

	private componentDestroyed: Subject<void> = new Subject<void>();
	public incomingDonations: AppIncomingDonation[] = [];
	public displayedIncomingDonations = [];

	constructor(protected router: Router,
				protected route: ActivatedRoute,
				protected tokenContractService: TokenContractService,
				protected organizationContractService: OrganizationContractService,
				protected incomingDonationContractService: IncomingDonationContractService,
				protected zone: NgZone
	) {

	}

	ngOnInit() {
		console.log('base ngInit');
		if( !this.organizationAddress) {
			this.route.params.subscribe(params => {
				this.organizationAddress = params['address'];
			});
		}
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
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
					this.displayedIncomingDonations[res.index] = this.incomingDonations[res.index];
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

	public selectedSourceChanged(sourceId: number) {
		if (sourceId === -1) { this.displayedIncomingDonations = this.incomingDonations; return; }

		this.displayedIncomingDonations = filter(this.incomingDonations, (incd: AppIncomingDonation) => {
			return incd.sourceId === sourceId.toString();
		});
	}
}