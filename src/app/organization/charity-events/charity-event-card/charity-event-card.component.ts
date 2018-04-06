import { Component, Input, OnInit } from '@angular/core';
import { AppCharityEvent, ConfirmationStatusState, AppIncomingDonation } from '../../../open-charity-types';
import { Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddIncomingDonationModalComponent } from '../../incoming-donations/add-incoming-donation-modal/add-incoming-donation-modal.component';
import { IncomingDonationSendFundsModalComponent } from '../../incoming-donations/incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import { OrganizationContractService } from '../../../core/contracts-services/organization-contract.service';
import { CharityEventContractService } from '../../../core/contracts-services/charity-event-contract.service';
import { OrganizationSharedService } from '../../services/organization-shared.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { NeatComponent } from '../../../shared/neat.component';
import { LoadingOverlayService } from '../../../core/loading-overlay.service';
import { IncomingDonationContractService } from '../../../core/contracts-services/incoming-donation-contract.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CharityEventEditorModalComponent } from '../charity-event-editor-modal/charity-event-editor-modal.component';
import { ErrorMessageService } from '../../../core/error-message.service';
import { Subscription } from 'rxjs/Subscription';
@Component({
	selector: 'opc-charity-events-card',
	templateUrl: 'charity-event-card.component.html',
	styleUrls: ['charity-event-card.component.scss']
})
export class CharityEventCardComponent extends NeatComponent {
	@Input('organizationAddress') public organizationAddress: string;
	@Input('charityEvent') public charityEvent: AppCharityEvent;

	constructor(
		private charityEventContractService: CharityEventContractService,
		private incomingDonationContractService: IncomingDonationContractService,
		private loadingOverlayService: LoadingOverlayService,
		private modalService: NgbModal,
		private organizationContractService: OrganizationContractService,
		private router: Router,
		private sanitize: DomSanitizer,
		private sharedService: OrganizationSharedService,
		private errorMessageService: ErrorMessageService
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
		this.router.navigate(
			[`/organization/${this.organizationAddress}/event/${this.charityEvent.address}/transactions`],
			{queryParams: {date: this.charityEvent.date.getTime()}}
		);
	}

	public editClick($event: Event): void {
		let modalInstance;
		modalInstance =	this.modalService.open(
			CharityEventEditorModalComponent,
			{
				size: 'lg',
				windowClass: 'modal-more-lg'
			}).componentInstance;
		modalInstance.organizationAddress = this.organizationAddress;
		modalInstance.charityEventAddress = this.charityEvent.address;
	}

	public removeClick($event: Event): void {
	}

	public addDonationClick($event) {
		let modalInstance; 		// store link to current modal here
		let txHash: string; 			// store current transaction hash here
		try {
			modalInstance =	this.modalService.open(AddIncomingDonationModalComponent, {size: 'lg'}).componentInstance;
			modalInstance.charityEvent = this.charityEvent;
			modalInstance.organizationAddress = this.organizationAddress;
			modalInstance.donationTxHash$.subscribe(_txHash => txHash = _txHash);
			this.sharedService.onIncomingDonationConfirmed().takeUntil(this.ngUnsubscribe).filter(donation => donation.txHash === txHash).subscribe(async (donation) => {
				const charityEventsAddresses = await this.organizationContractService.getCharityEventsAsync(this.organizationAddress);
				Promise.all([
					this.incomingDonationContractService.getIncomingDonationDetails(donation.address),
					this.charityEventContractService.getCharityEventsList(charityEventsAddresses),
				]).then(([incomingDonation, charityEvents]) => {
					modalInstance = this.modalService.open(IncomingDonationSendFundsModalComponent).componentInstance;
					modalInstance.organizationAddress = this.organizationAddress;
					modalInstance.incomingDonation = incomingDonation;
					modalInstance.charityEvents = charityEvents;
					modalInstance.charityEvent = this.charityEvent;
					modalInstance.sendFunds(this.charityEvent, incomingDonation.amount);
				});
			});
		} catch (err) {
			this.errorMessageService.addError(err, 'addDonationClick');
		}
	}

	public getSafeHTML(html: string): SafeHtml {
		return this.sanitize.bypassSecurityTrustHtml(html);
	}
}
