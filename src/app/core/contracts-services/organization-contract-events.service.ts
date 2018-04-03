// TODO: create reconnection process for events listeners;
import {Injectable} from '@angular/core';
import {Contract, EventEmitter, EventLog, Tx} from 'web3/types';
import {Web3ProviderService} from '../web3-provider.service';
import Web3 from 'web3';
import {Observable} from 'rxjs/Observable';
import {ORGANIZATION_CONTRACT_ABI} from '../../contracts-abi';
import {ConnectableObservable} from 'rxjs/Rx';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';
import {ContractCharityEvent, ContractIncomingDonation} from '../../open-charity-types';

@Injectable()
export class OrganizationContractEventsService {
	private organizationContract: Contract;
	// web3 instance with websocker provider;
	private web3: Web3;

	// tracks Observables for different organizations
	// key is organization address
	private charityEventAddedObservable: {[key: string]: ConnectableObservable<ContractCharityEvent>} = {};
	private incomingDonationAddedObservable: {[key: string]: ConnectableObservable<ContractIncomingDonation>} = {};

	private readonly eventsSignatures = {
		CHARITY_EVENT_ADDED: 'CharityEventAdded(address,address)',
		INCOMING_DONATION_ADDED: 'IncomingDonationAdded(address,address,address,uint256)'
	};


	constructor(
		private web3ProviderService: Web3ProviderService
	) {
		// websocket provider is required to subscribe to events
		this.web3 = new Web3(environment.websocketProviderUrl);
		this.organizationContract = this.buildOrganizationContract();
	}


	// listen for CharityEventAdded event
	public onCharityEventAdded(address: string): Observable<ContractCharityEvent> {
		if (!this.charityEventAddedObservable[address]) {
			this.charityEventAddedObservable[address] = this.buildOnCharityEventAddedObservable(address);
		}

		return this.charityEventAddedObservable[address];
	}

	public onIncomingDonationAdded(address: string): Observable<ContractIncomingDonation> {
		if (!this.incomingDonationAddedObservable[address]) {
			this.incomingDonationAddedObservable[address] = this.buildOnIncomingDonationAddedObservable(address);
		}

		return this.incomingDonationAddedObservable[address];
	}

	public getCharityEventTransactions(organizationAddress: string, charityEventAddress: string, txOptions?: Tx): Observable<EventLog[]> {
		const contract: Contract = this.cloneContract(this.organizationContract, organizationAddress);
		const sourceSubject: Subject<EventLog[]> = new Subject<EventLog[]>();

		contract.getPastEvents('FundsMovedToCharityEvent', {
			filter: {charityEvent: charityEventAddress},
			fromBlock: 0,
			toBlock: 'latest'
		}, (err, events) => {
			if (err) {
				sourceSubject.error(err);
				return;
			}
			sourceSubject.next(events);
		});

		return sourceSubject.asObservable();
	}


	public getCharityEventsByID(organizationAddress: string, incomingDonationAddress: string, txOptions?: Tx): Observable<EventLog[]> {
		const contract: Contract = this.cloneContract(this.organizationContract, organizationAddress);
		const sourceSubject: Subject<EventLog[]> = new Subject<EventLog[]>();

		contract.getPastEvents('FundsMovedToCharityEvent', {
			filter: {incomingDonation: incomingDonationAddress},
			fromBlock: 0,
			toBlock: 'latest'
		}, (err, events) => {
			if (err) {
				sourceSubject.error(err);
				return;
			}
			sourceSubject.next(events);
		});

		return sourceSubject.asObservable();
	}
	/* tslint:disable */
	private buildOnCharityEventAddedObservable(address: string): ConnectableObservable<any> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
		return ConnectableObservable.create((observer: Observer<any>) => {
			const contractEventListener: EventEmitter = contract.events.CharityEventAdded({},
				function (error: any, event) {
					if (error) {
						if (error.code === 1006) {
							(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
						} else {
							observer.error(error);
						}
					}
					console.log((<any>contractEventListener).arguments);
				}
			)
				.on('data', (data: any) => {
					observer.next(data);
				})
				.on('changed', (data: any) => {
					observer.next(data);
				});

			return function() {

				(<any>contractEventListener).unsubscribe(function(err, success) {
					if (success) {
						console.log('unsubscribed');
					} else {
						console.error('error during unsubscribe');
					}

				});
			};

		}).share();
	}

	private buildOnIncomingDonationAddedObservable(address: string): ConnectableObservable<any> {
		return ConnectableObservable.create((observer: Observer<any>) => {
			const contract: Contract = this.cloneContract(this.organizationContract, address);
			const contractEventListener: EventEmitter = contract.events.IncomingDonationAdded({},
				function (error: any, event) {
					if (error) {
						if (error.code === 1006) {
							(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
						} else {
							observer.error(error);
						}
					}
				}
			)
				.on('data', (data: any) => {
					observer.next(data);
				})
				.on('changed', (data: any) => {
					observer.next(data);
				});

			return function() {
				(<any>contractEventListener).unsubscribe();
			};

		}).share();
	}

	private cloneContract(original: Contract, address: string): Contract {
		const contract: any = (<any>original).clone();
		(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
		contract.options.address = address;

		return <Contract> contract;
	}
	/* tslint:enable */
	private buildOrganizationContract(): Contract {
		return new this.web3.eth.Contract(ORGANIZATION_CONTRACT_ABI);
	}

}
