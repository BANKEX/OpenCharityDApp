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
	private charityEventAddedObservables: {[key: string]: ConnectableObservable<any>} = {};
	private incomingDonatioinAddedObservable: {[key: string]: ConnectableObservable<any>} = {};


	constructor(private web3ProviderService: Web3ProviderService,) {
		// websocket provider is required to subscribe to events
		this.web3 = new Web3(environment.websocketProviderUrl);

		this.organizationContract = this.buildOrganizationContract();
	}


	// listen for CharityEventAdded event
	public onCharityEventAdded(address: string): Observable<any> {
		if (!this.charityEventAddedObservables[address]) {
			this.charityEventAddedObservables[address] = this.buildOnCharityEventAddedObservable(address);
		}

		return this.charityEventAddedObservables[address];
	}

	private buildOnCharityEventAddedObservable(address: string): ConnectableObservable<any> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
		return ConnectableObservable.create((observer: Observer<any>) => {
			const contractEventListener: EventEmitter = contract.events.CharityEventAdded({},
				function (error, event) {
					if (error) {
						observer.error(error);
					}
				}
			)
				.on('data', (data: any) => {
					observer.next(data);
				})
				.on('changed', (data: any) => {
					observer.next(data);
				})
				.on('error', (err: any) => {
					observer.error(err);
				});

			return function() {
				(<any>contractEventListener).unsubscribe();
			}

		}).share();
	}

	public onIncomingDonationAdded(address: string): Observable<any> {
		if (!this.incomingDonatioinAddedObservable[address]) {
			this.incomingDonatioinAddedObservable[address] = this.buildOnIncomingDonationAddedObservable(address);
		}

		return this.incomingDonatioinAddedObservable[address];
	}

	private buildOnIncomingDonationAddedObservable(address: string): ConnectableObservable<any> {
		const contract: Contract = this.cloneContract(this.organizationContract, address);
		(<any>contract).setProvider(new Web3.providers.WebsocketProvider(environment.websocketProviderUrl));
		return ConnectableObservable.create((observer: Observer<any>) => {
			const contractEventListener: EventEmitter = contract.events.IncomingDonationAdded({},
				function (error, event) {
					if (error) {
						observer.error(error);
					}
				}
			)
				.on('data', (data: any) => {
					observer.next(data);
				})
				.on('changed', (data: any) => {
					observer.next(data);
				})
				.on('error', (err: any) => {
					observer.error(err);
				});

			return function() {
				(<any>contractEventListener).unsubscribe();
			}

		}).share();
	}


	private cloneContract(original: Contract, address: string): Contract {
		const contract: any = (<any>original).clone();
		const originalProvider = (<any>original).currentProvider;
		contract.setProvider(contract.givenProvider || originalProvider);
		contract.options.address = address;

		return <Contract> contract;
	}

	private buildOrganizationContract(): Contract {
		return new this.web3.eth.Contract(OrganizationContractAbi);
	}

}
