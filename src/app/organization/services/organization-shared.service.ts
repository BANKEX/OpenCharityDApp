import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ContractCharityEvent, ContractIncomingDonation} from '../../open-charity-types';

// service to share events between components in organization module

@Injectable()
export class OrganizationSharedService {

	/*********************************/
	/****** Events sources ***********/
	/*********************************/

	// triggered when user try to add new charity event
	private _onCharityEventAdded: Subject<ContractCharityEvent> = new Subject<ContractCharityEvent>();
	private onCharityEventAddedSource = this._onCharityEventAdded.asObservable().share<ContractCharityEvent>();

	// triggered when transaction succeed i.e CE stored in blockchain
	private _onCharityEventConfirmed: Subject<string> = new Subject<string>();
	private onCharityEventConfirmedSource = this._onCharityEventConfirmed.asObservable().share<string>();


	// triggered when transaction failed  i.e CE is not stored in blockchain
	private _onCharityEventFailed: Subject<string> = new Subject<string>();
	private onCharityEventFailedSource = this._onCharityEventFailed.asObservable().share<string>();

	// triggered when transaction canceled by user
	private _onCharityEventCanceled: Subject<string> = new Subject<string>();
	private onCharityEventCanceledSource = this._onCharityEventCanceled.asObservable().share<string>();

	/*********************************/

	// triggered when user try to add new incoming donation
	private _onIncomingDonationAdded: Subject<ContractIncomingDonation> = new Subject<ContractIncomingDonation>();
	private onIncomingDonationAddedSource = this._onIncomingDonationAdded.asObservable().share<ContractIncomingDonation>();

	// triggered when transaction succeed i.e CE stored in blockchain
	private _onIncomingDonationConfirmed: Subject<string> = new Subject<string>();
	private onIncomingDonationConfirmedSource = this._onIncomingDonationConfirmed.asObservable().share<string>();


	// triggered when transaction failed  i.e CE is not stored in blockchain
	private _onIncomingDonationFailed: Subject<string> = new Subject<string>();
	private onIncomingDonationFailedSource = this._onIncomingDonationFailed.asObservable().share<string>();

	// triggered when transaction canceled by user
	private _onIncomingDonationCanceled: Subject<string> = new Subject<string>();
	private onIncomingDonationCanceledSource = this._onIncomingDonationCanceled.asObservable().share<string>();



	constructor() {

	}

	/*********************************/
	/****** Methods to emit data *****/
	/*********************************/

	public charityEventAdded(charityEvent: ContractCharityEvent): void {
		this._onCharityEventAdded.next(charityEvent);
	}

	public charityEventConfirmed(charityEventAddress: string): void {
		this._onCharityEventConfirmed.next(charityEventAddress);
	}

	public charityEventFailed(charityEventAddress: string): void {
		this._onCharityEventFailed.next(charityEventAddress);
	}

	public charityEventCanceled(charityEventAddress: string): void {
		this._onCharityEventCanceled.next(charityEventAddress);
	}

	public incomingDonationAdded(incomingDonation: ContractIncomingDonation): void {
		this._onIncomingDonationAdded.next(incomingDonation);
	}

	public incomingDonationConfirmed(incomingDonationAddress: string): void {
		this._onIncomingDonationConfirmed.next(incomingDonationAddress);
	}

	public incomingDonationFailed(incomingDonationAddress: string): void {
		this._onIncomingDonationFailed.next(incomingDonationAddress);
	}

	public incomingDonationCanceled(incomingDonationAddress: string): void {
		this._onIncomingDonationCanceled.next(incomingDonationAddress);
	}





	/***********************************/
	/** Methods to subscribe to events **/
	/***********************************/

	public onCharityEventAdded(): Observable<ContractCharityEvent> {
		return this.onCharityEventAddedSource;
	}

	public onCharityEventConfirmed(): Observable<string> {
		return this.onCharityEventConfirmedSource;
	}

	public onCharityEventFailed(): Observable<string> {
		return this.onCharityEventFailedSource;
	}

	public onCharityEventCanceled(): Observable<string> {
		return this.onCharityEventCanceledSource;
	}


	public onIncomingDonationAdded(): Observable<ContractIncomingDonation> {
		return this.onIncomingDonationAddedSource;
	}

	public onIncomingDonationConfirmed(): Observable<string> {
		return this.onIncomingDonationConfirmedSource;
	}

	public onIncomingDonationFailed(): Observable<string> {
		return this.onIncomingDonationFailedSource;
	}

	public onIncomingDonationCanceled(): Observable<string> {
		return this.onIncomingDonationCanceledSource;
	}



}
