import {Injectable} from '@angular/core';
import {Contract, EventEmitter} from 'web3/types';
import {Web3ProviderService} from '../../core/web3-provider.service';
import Web3 from 'web3';
import {Observable} from 'rxjs/Observable';
import {OrganizationContractAbi} from '../../contracts-abi';
import {ConnectableObservable} from 'rxjs/Rx';
import {Observer} from 'rxjs/Observer';

@Injectable()
export class OrganizationContractEventsService {
	private organizationContract: Contract;
	// web3 instance with websocker provider;
	private web3: Web3;

	// tracks Observables for different organizations
	// key is organization address
	private charityEventAddedObservable: {[key: string]: ConnectableObservable<any>} = {};
	private incomingDonationAddedObservable: {[key: string]: ConnectableObservable<any>} = {};

	private readonly eventsSignatures = {
		CHARITY_EVENT_ADDED: "CharityEventAdded(address,address)",
		INCOMING_DONATION_ADDED: "IncomingDonationAdded(address,address,address,uint256)"
	};


	constructor(
		private web3ProviderService: Web3ProviderService
	) {
		// websocket provider is required to subscribe to events
		this.web3 = new Web3(environment.websocketProviderUrl);
		this.organizationContract = this.buildOrganizationContract();
	}


	// listen for CharityEventAdded event
	public onCharityEventAdded(address: string): Observable<any> {
		if (!this.charityEventAddedObservable[address]) {
			this.charityEventAddedObservable[address] = this.buildOnCharityEventAddedObservable(address);
		}

		return this.charityEventAddedObservable[address];
	}

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
						console.error('error during unsubscribe')
					}

				});
			}

		}).share();
	}

	public onIncomingDonationAdded(address: string): Observable<any> {
		if (!this.incomingDonationAddedObservable[address]) {
			this.incomingDonationAddedObservable[address] = this.buildOnIncomingDonationAddedObservable(address);
		}

		return this.incomingDonationAddedObservable[address];
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
			}

		}).share();
	}


	private cloneContract(original: Contract, address: string): Contract {
		const contract: any = (<any>original).clone();
		(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildOrganizationContract(): Contract {
		return new this.web3.eth.Contract(OrganizationContractAbi);
	}

}
