import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

// service to share events between components in organization module

@Injectable()
export class OrganizationSharedService {

	// triggered when user try to add new charity event
	private _onCharityEventAdded: Subject<ContractCharityEvent> = new Subject<ContractCharityEvent>();
	private onCharityEventAddedSource = this._onCharityEventAdded.asObservable().share<ContractCharityEvent>();

	// triggered when transaction succeed i.e CE stored in blockchain
	private _onCharityEventConfirmed: Subject<string> = new Subject<string>();
	private onCharityEventConfirmedSource = this._onCharityEventConfirmed.asObservable().share<string>();


	// triggered when transaction failed  i.e CE is not stored in blockchain
	private _onCharityEventFailed: Subject<string> = new Subject<string>();
	private onCharityEventFailedSource = this._onCharityEventFailed.asObservable().share<string>();

	private _onCharityEventCanceled: Subject<string> = new Subject<string>();
	private onCharityEventCanceledSource = this._onCharityEventCanceled.asObservable().share<string>();


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





	/***********************************/
	/** Methods to subscribe to event **/
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

}
