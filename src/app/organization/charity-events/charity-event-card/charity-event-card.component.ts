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
	@Input('organizationAddress') organizationAddress: string;
	@Input('charityEvent') charityEvent: AppCharityEvent;

	public subs: Subscription[];
	public modal: any;

	constructor(
		private $charityEventContractService: CharityEventContractService,
		private $incomingDonationContractService: IncomingDonationContractService,
		private $loadingTransparentOverlayService: LoadingTransparentOverlayService,
		private $modal: NgbModal,
		private $organizationContractService: OrganizationContractService,
		private $router: Router,
		private $sanitize: DomSanitizer,
		private $sharedService: OrganizationSharedService,
		private $errorMessageService: ErrorMessageService
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
		let modalInstance;
		modalInstance =	this.$modal.open(
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
		this.subs = [];
		let modalInstance;
		this.subs.push(this.$sharedService.onMoveFundsToCharityEventCanceled().takeUntil(this.ngUnsubscribe).subscribe(_ => this.cancelActions('Fund transfer canceled by user')));
		this.subs.push(this.$sharedService.onMoveFundsToCharityEventFailed().takeUntil(this.ngUnsubscribe).subscribe(_ => this.cancelActions('Fund transfer failed')));
		this.subs.push(this.$sharedService.onIncomingDonationCanceled().takeUntil(this.ngUnsubscribe).subscribe(_ => this.cancelActions('Donation canceled by user')));
		this.subs.push(this.$sharedService.onIncomingDonationFailed().takeUntil(this.ngUnsubscribe).subscribe(_ => this.cancelActions('Donation createon failed')));
		try {
			modalInstance =	this.$modal.open(AddIncomingDonationModalComponent, {size: 'lg'}).componentInstance;
			modalInstance.charityEvent = this.charityEvent;
			modalInstance.organizationAddress = this.organizationAddress;
			this.modal = modalInstance.activeModal; // save link to active modal
			this.$sharedService.onIncomingDonationAdded().take(1).subscribe(_ => this.$loadingTransparentOverlayService.showOverlay());
			this.$sharedService.onIncomingDonationConfirmed().takeUntil(this.ngUnsubscribe).subscribe(async (donation) => {
				const charityEventsAddresses = await this.$organizationContractService.getCharityEventsAsync(this.organizationAddress);
				this.modal.close();
				Promise.all([
					this.$incomingDonationContractService.getIncomingDonationDetails(donation.address),
					this.$charityEventContractService.getCharityEventsList(charityEventsAddresses),
				]).then(([incomingDonation, charityEvents]) => {
					modalInstance = this.$modal.open(IncomingDonationSendFundsModalComponent).componentInstance;
					modalInstance.organizationAddress = this.organizationAddress;
					modalInstance.incomingDonation = incomingDonation;
					modalInstance.charityEvents = charityEvents;
					modalInstance.charityEvent = this.charityEvent;
					modalInstance.sendFunds(this.charityEvent, incomingDonation.amount);
					this.modal = modalInstance.activeModal;
					this.$sharedService.onMoveFundsToCharityEventConfirmed().takeUntil(this.ngUnsubscribe).subscribe(async (transaction) => {
						this.cancelActions();
					});
				});
			});
		} catch (err) {
			this.cancelActions();
			this.$errorMessageService.addError(err)
		}
	}

	// public stopClickBubbling($event: Event): void {
	// 	$event.preventDefault();
	// }

	public getSafeHTML(html: string): SafeHtml {
		return this.$sanitize.bypassSecurityTrustHtml(html);
	}

	private cancelActions(msg?) {
		// tslint:disable:no-unused-expression
		msg && console.warn(msg, '...');
		this.modal && this.modal.close();
		this.subs.forEach((sub: Subscription) => sub.unsubscribe());
		this.$loadingTransparentOverlayService.hideOverlay();
	}
}
