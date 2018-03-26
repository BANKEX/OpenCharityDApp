import {Component, Input, OnInit} from '@angular/core';
import {AppCharityEvent, ConfirmationStatusState, AppIncomingDonation} from '../../../open-charity-types';
import {Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddIncomingDonationModalComponent } from '../../incoming-donations/add-incoming-donation-modal/add-incoming-donation-modal.component';
import { IncomingDonationSendFundsModalComponent } from '../../incoming-donations/incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import { OrganizationContractService } from '../../../core/contracts-services/organization-contract.service';
import { CharityEventContractService } from '../../../core/contracts-services/charity-event-contract.service';
import { OrganizationSharedService } from '../../services/organization-shared.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { NeatComponent } from '../../../shared/neat.component';
import { LoadingTransparentOverlayService } from '../../../core/loading-transparent-overlay.service';
import { IncomingDonationContractService } from '../../../core/contracts-services/incoming-donation-contract.service';
@Component({
	selector: 'opc-charity-events-card',
	templateUrl: 'charity-event-card.component.html',
	styleUrls: ['charity-event-card.component.scss']
})
export class CharityEventCardComponent extends NeatComponent {
	@Input('organizationAddress') organizationAddress: string;
	@Input('charityEvent') public charityEvent: AppCharityEvent;

	constructor(
		private $router: Router,
		private $modal: NgbModal,
		private $loadingTransparentOverlayService: LoadingTransparentOverlayService,
		private $organizationContractService: OrganizationContractService,
		private $incomingDonationContractService: IncomingDonationContractService,
		private $charityEventContractService: CharityEventContractService,
		private $sharedService: OrganizationSharedService,
	) {
		super();
	}

	public isEvent(): boolean {
		return this.charityEvent != null;
	}

	public isPending(): boolean {
		if (this.charityEvent == null) return true;
		return (this.charityEvent.confirmation === ConfirmationStatusState.PENDING);
	}

	public isConfirmed(): boolean {
		return (this.charityEvent.confirmation === ConfirmationStatusState.CONFIRMED);
	}

	public isFailed(): boolean {
		return (this.charityEvent.confirmation === ConfirmationStatusState.FAILED);
	}

	public isErrored(): boolean {
		return (this.charityEvent.confirmation === ConfirmationStatusState.ERROR);
	}

	public goToTransactions($event): void {
		if (!this.isConfirmed() || $event.defaultPrevented) {
			return;
		}
		this.$router.navigate([`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/transactions`]);
	}

	public editClick($event: Event): void {
		this.$router.navigate([`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/editor`]);
	}

	public removeClick($event: Event): void {
	}

	public addDonationClick($event) {
		let modalInstance;
		modalInstance =	this.$modal.open(AddIncomingDonationModalComponent, {size: 'lg'}).componentInstance;
		modalInstance.charityEvent = this.charityEvent;
		modalInstance.organizationAddress = this.organizationAddress;
		let fromService$ = this.$sharedService.onIncomingDonationConfirmed();
		fromService$.takeUntil(this.ngUnsubscribe).subscribe(async (donation) => {
			this.$loadingTransparentOverlayService.showOverlay();
			const charityEventsAddresses = await this.$organizationContractService.getCharityEventsAsync(this.organizationAddress);
			Promise.all([
				this.$incomingDonationContractService.getIncomingDonationDetails(donation.address),
				this.$charityEventContractService.getCharityEventsList(charityEventsAddresses),
			]).then(([incomingDonation, charityEvents]) => {
				this.$loadingTransparentOverlayService.hideOverlay();
				modalInstance = this.$modal.open(IncomingDonationSendFundsModalComponent).componentInstance;
				modalInstance.organizationAddress = this.organizationAddress;
				modalInstance.incomingDonation = incomingDonation;
				modalInstance.charityEvents = charityEvents;
				modalInstance.charityEvent = this.charityEvent;
				modalInstance.fundsMoved.takeUntil(this.ngUnsubscribe).subscribe((donationAddress: string) => {
					//TODO: Update components
					window.location.reload();
					// const incDonation = find(this.incomingDonations, {address: incomingDonationAddress});
					// if (this.incomingDonations) {
					// 	this.updateIncomingDonationAmount(incDonation);
					// }
				});
			}).catch((err) => console.error(err));
		});
	}

	// public stopClickBubbling($event: Event): void {
	// 	$event.preventDefault();
	// }
}
