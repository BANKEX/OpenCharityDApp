import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';

import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {ContractIncomingDonation} from '../../../open-charity-types';
import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState} from '../../../open-charity-types';

@Component({
	templateUrl: 'incoming-donations-details.component.html',
	styleUrls: ['incoming-donations-details.component.scss']
})
export class IncomingDonationsDetailsComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string = null;
	public incomingDonationAddress: string = null;
	public incomingDonation: ContractIncomingDonation = null;
	public name: string = "";

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private incomingDonationsContractService: IncomingDonationContractService
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params["address"];
			this.incomingDonationAddress = params["donation"];
		});
		this.incomingDonation = await this.incomingDonationsContractService.getIncomingDonationDetails(this.incomingDonationAddress);
	}

	public isDonation(): boolean {
		return this.incomingDonation != null;
	}

	public isPending(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.PENDING);
	}

	public isConfirmed(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.CONFIRMED);
	}

	public isFailed(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.FAILED);
	}

	public isErrored(incomingDonation: AppIncomingDonation): boolean {
		return (incomingDonation.confirmation === ConfirmationStatusState.ERROR);
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

	goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}
}
