import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {IncomingDonationContractService} from '../../core/contracts-services/incoming-donation-contract.service';
import {ContractIncomingDonation} from '../../open-charity-types';

@Component({
	templateUrl: 'incoming-donation-editor.component.html',
	styleUrls: ['incoming-donation-editor.component.scss']
})
export class IncomingDonationsEditorComponent implements OnInit, OnDestroy {
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

	public goBackToOrganization(event: Event): void {
		this.router.navigate(['/organization', this.organizationAddress]);
		event.preventDefault();
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}
}
