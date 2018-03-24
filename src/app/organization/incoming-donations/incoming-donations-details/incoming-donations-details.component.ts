import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';

import {IncomingDonationContractService} from '../../../core/contracts-services/incoming-donation-contract.service';
import {ContractIncomingDonation} from '../../../open-charity-types';
import {AppIncomingDonation, ConfirmationResponse, ConfirmationStatusState} from '../../../open-charity-types';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from '../incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';
import {find} from 'lodash';
import {TokenContractService} from '../../../core/contracts-services/token-contract.service';
import {CharityEventContractService} from '../../../core/contracts-services/charity-event-contract.service';
import {Location} from '@angular/common';

@Component({
	templateUrl: 'incoming-donations-details.component.html',
	styleUrls: ['incoming-donations-details.component.scss']
})
export class IncomingDonationsDetailsComponent implements OnInit, OnDestroy {
	private componentDestroyed: Subject<void> = new Subject<void>();
	public organizationAddress: string = null;
	public incomingDonationAddress: string = null;
	public incomingDonation: ContractIncomingDonation = null;
	public name: string = '';

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private incomingDonationsContractService: IncomingDonationContractService,
		private organizationContractService: OrganizationContractService,
		private tokenContractService: TokenContractService,
		private charityEventContractService: CharityEventContractService,
		private modalService: NgbModal,
		private location: Location
	) { }

	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(params => {
			this.organizationAddress = params['address'];
			this.incomingDonationAddress = params['donation'];
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

	public goBackToPreviousPage(event: Event): void {
		this.location.back();
		event.preventDefault();
	}

	public async openSendDonationFundsModal(incomingDonation: AppIncomingDonation): Promise<void> {
		const charityEventsAddresses: string[] = await this.organizationContractService.getCharityEventsAsync(this.organizationAddress);
		const charityEvents = await this.charityEventContractService.getCharityEventsList(charityEventsAddresses);

		const modalRef: NgbModalRef = this.modalService.open(IncomingDonationSendFundsModalComponent);
		modalRef.componentInstance.organizationAddress = this.organizationAddress;
		modalRef.componentInstance.incomingDonation = incomingDonation;
		modalRef.componentInstance.charityEvents = charityEvents;
		modalRef.componentInstance.fundsMoved.subscribe((incomingDonationAddress: string) => {
			this.updateIncomingDonationAmount(this.incomingDonation);
		});
	}

	public async updateIncomingDonationAmount(incomingDonation: ContractIncomingDonation): Promise<void> {
		incomingDonation.amount = await this.tokenContractService.balanceOf(incomingDonation.address);
	}



}
