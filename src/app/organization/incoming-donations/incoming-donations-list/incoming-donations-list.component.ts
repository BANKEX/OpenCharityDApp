import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {constant, find, findIndex, merge, reverse, times} from 'lodash';
import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState} from '../../../open-charity-types';
import {OrganizationSharedService} from '../../services/organization-shared.service';
import {Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {LoadingOverlayService} from '../../../core/loading-overlay.service';
import {ErrorMessageService} from '../../../core/error-message.service';

@Component({
	selector: 'opc-incoming-donations-list',
	templateUrl: 'incoming-donations-list.component.html',
	styleUrls: ['incoming-donations-list.component.scss']
})

export class IncomingDonationsListComponent implements OnInit, OnDestroy {
	@Input('organizationAddress') organizationAddress: string;
	@Input('incomingDonations') incomingDonations: AppIncomingDonation[];

	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(protected organizationContractService: OrganizationContractService,
				protected incomingDonationContractService: IncomingDonationContractService,
				protected tokenContractService: TokenContractService,
				protected charityEventContractService: CharityEventContractService,
				protected modalService: NgbModal,
				protected organizationSharedService: OrganizationSharedService,
				protected zone: NgZone,
				protected router: Router,
				protected loadingOverlayService: LoadingOverlayService,
				protected errorMessageService: ErrorMessageService) {

	}

	public ngOnInit(): void {
		this.initEventsListeners();
	}

	public toDetails(incomingDonation: AppIncomingDonation): void {
		this.router.navigate([`/organization/${this.organizationAddress}/donation/${incomingDonation.address}/details`]);
	}

	public async openSendDonationFundsModal(incomingDonation: AppIncomingDonation): Promise<void> {
		this.loadingOverlayService.showOverlay(true);

		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		this.loadingOverlayService.hideOverlay();

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.organizationAddress = this.organizationAddress;
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
		modalRef.componentInstance.fundsMoved.subscribe((incomingDonationAddress: string) => {
			const incDonation = find(this.incomingDonations, {address: incomingDonationAddress});
			if (this.incomingDonations) {
				this.updateIncomingDonationAmount(incDonation);
			}
		});
	}

	public async updateIncomingDonationAmount(incomingDonation: AppIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}

	// Incoming Donations States
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

	ngOnDestroy() {
		this.componentDestroyed.next();
	}

	private initEventsListeners(): void {
		this.organizationSharedService.onIncomingDonationAdded()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppIncomingDonation) => {
				this.incomingDonations.push(res);
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationAdded');
			});


		this.organizationSharedService.onIncomingDonationConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.incomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.incomingDonations[i].address = res.address;
					this.incomingDonations[i].confirmation = ConfirmationStatusState.CONFIRMED;
				}
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationConfirmed');
			});

		this.organizationSharedService.onIncomingDonationFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.incomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.incomingDonations[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationFailed');
			});


		this.organizationSharedService.onIncomingDonationCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.incomingDonations, {internalId: res.internalId});
				if (i !== -1) {
					this.incomingDonations.splice(i, 1);
				}
			}, (err: any) => {
				this.errorMessageService.addError(err.message, 'onIncomingDonationCanceled');
			});

	}
}
