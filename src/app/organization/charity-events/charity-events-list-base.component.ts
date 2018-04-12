import {Component, Input, Output, NgZone, OnDestroy, OnInit, EventEmitter} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
	AppCharityEvent, CharityEventMetaStorageData, ConfirmationResponse, ConfirmationStatusState,
	MetaStorageData, SortParams, SortBy
} from '../../open-charity-types';
import {TokenContractService} from '../../core/contracts-services/token-contract.service';
import {OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {constant, findIndex, merge, times} from 'lodash';
import {CharityEventContractService} from '../../core/contracts-services/charity-event-contract.service';
import {MetaDataStorageService} from '../../core/meta-data-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddCharityEventModalComponent} from './add-charity-event-modal/add-charity-event-modal.component';
import {OrganizationSharedService} from '../services/organization-shared.service';
import {ErrorMessageService} from '../../core/error-message.service';
import {OrganizationContractEventsService} from '../../core/contracts-services/organization-contract-events.service';
import {Web3ProviderService} from '../../core/web3-provider.service';
import {AsyncLocalStorage} from 'angular-async-local-storage';
import {AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import {NgProgress} from '@ngx-progressbar/core';
// tslint:disable:no-any
@Component({
	selector: 'opc-charity-events-list-base',
	template: '',
})

export class CharityEventsListBaseComponent implements OnInit, OnDestroy, AfterViewInit {
	@Input('organizationAddress') public organizationAddress: string;
	@Input('sort$') public sort$: Observable<SortParams> = Observable.empty<SortParams>(); // to recive external sort requests
	public charityEvents: AppCharityEvent[] = [];	// list of CE to show
	public dataLoader = 0; 							// count how many charityEvents fully loaded
	public dataReady = new BehaviorSubject(false);						// flag to show preloader
	public sort = {by: SortBy.DATE, reverse: true};	// CE sorting settings
	public sortModes = [['Sort by Date', SortBy.DATE], ['Sort by Name', SortBy.NAME], ['Sort by Raised', SortBy.RASED]];

	protected componentDestroyed: Subject<void> = new Subject<void>();

	constructor(
		protected organizationContractService: OrganizationContractService,
		protected organizationContractEventsService: OrganizationContractEventsService,
		protected tokenContractService: TokenContractService,
		protected charityEventContractService: CharityEventContractService,
		protected zone: NgZone,
		protected metaDataStorageService: MetaDataStorageService,
		protected modal: NgbModal,
		protected organizationSharedService: OrganizationSharedService,
		protected errorMessageService: ErrorMessageService,
		protected web3ProviderService: Web3ProviderService,
		protected localStorage: AsyncLocalStorage,
		protected progress: NgProgress,
	) {}

	public initEventsListeners(): void {
		this.organizationSharedService.onCharityEventSubmited()
			.withLatestFrom(this.organizationSharedService.onCharityEventAdded(), (fromSubm, fromAdded) => fromAdded)
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				this.charityEvents.push(merge({}, res, {raised: 0}));
				this.updateCharityEventMetaStorageData(this.charityEvents[this.charityEvents.length - 1]);
				this.charityEvents = Object.assign([], this.charityEvents); // to run change detection and show added CE
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventAdded');
			});

		this.organizationSharedService.onCharityEventEdited()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: AppCharityEvent) => {
				const i: number = findIndex(this.charityEvents, {address: res.address});
				if (i !== -1) {
					this.charityEvents[i] = res;
					this.charityEvents[i].address = res.address;
					this.charityEvents[i].confirmation = ConfirmationStatusState.PENDING;
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventEdited');
			});

		this.organizationSharedService.onCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				let i: number = findIndex(this.charityEvents, {address: res.address});

				i = i !== -1 ? i : findIndex(this.charityEvents, {internalId: res.internalId});

				if (i !== -1) {
					this.charityEvents[i].address = res.address;
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
					this.charityEvents[i].metaStorageHash = await this.charityEventContractService.getMetaStorageHash(res.address);
					this.updateCharityEventMetaStorageData(this.charityEvents[i]);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventConfirmed');
			});

		this.organizationSharedService.onCharityEventFailed()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});

				if (findIndex(this.charityEvents, {address: res.address}) !== -1) { // For CE editing
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
					return;
				}

				if (i !== -1) {
					this.charityEvents[i].confirmation = ConfirmationStatusState.FAILED;
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventFailed');
			});

		this.organizationSharedService.onCharityEventCanceled()
			.takeUntil(this.componentDestroyed)
			.subscribe((res: ConfirmationResponse) => {

				const i: number = findIndex(this.charityEvents, {internalId: res.internalId});

				if (findIndex(this.charityEvents, {address: res.address}) !== -1) { // For CE editing
					this.charityEvents[i].confirmation = ConfirmationStatusState.CONFIRMED;
					return;
				}

				if (i !== -1) {
					this.charityEvents.splice(i, 1);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onCharityEventCanceled');
			});

		this.organizationSharedService.onMoveFundsToCharityEventConfirmed()
			.takeUntil(this.componentDestroyed)
			.subscribe(async (res: ConfirmationResponse) => {
				const i: number = findIndex(this.charityEvents, {address: res.address});

				if (i !== -1) {
					await this.updateCharityEventRaised(this.charityEvents[i]);
				}
			}, (err: Error) => {
				this.errorMessageService.addError(err.message, 'onMoveFundsToCharityEventConfirmed');
			});
	}

	public async updateCharityEventsList(): Promise<void> {
		// get amount of organization incoming donations
		const charityEventsCount: number = parseInt(await this.organizationContractService.getCharityEventsCount(this.organizationAddress), 10);
		// initialize empty array
		// null value means that incoming donation data is loading
		// when data is loaded, replace null by data
		this.charityEvents = times(charityEventsCount, constant(null));
		const blockNumbers =
			await this.organizationContractEventsService.getBlockNumbersForEvents(this.organizationAddress, 'CharityEventAdded', 'charityEvent');
		await this.organizationContractService.getCharityEvents(this.organizationAddress)
			.take(charityEventsCount)
			.subscribe(async (event: { address: string, index: number }) => {

				// it is a hack. without zone.run it doesn't work properly:
				// it doesn't update charityEvents in template
				// if you change it to .detectChanges, it breaks further change detection of other comopnents
				// if you know how to fix it, please do it
				this.zone.run(async() => {
					this.charityEvents[event.index] = merge({}, await this.charityEventContractService.getCharityEventDetails(event.address), {
						date: await this.charityEventContractService.getDate(event.address, blockNumbers[event.address]),
						confirmation: ConfirmationStatusState.CONFIRMED
					});
					await this.updateCharityEventRaised(this.charityEvents[event.index]);
					this.updateCharityEventMetaStorageData(this.charityEvents[event.index]);
					this.dataLoader += 1;
					let persents = Math.floor(this.dataLoader * 100 / charityEventsCount);
					this.progress.set(persents, 'charityEvents'); // update loading bar
					if (this.dataLoader === charityEventsCount) {
						this.dataReady.next(true);
						this.progress.complete('charityEvents');
					}
				});
			});
	}

	protected async updateCharityEventMetaStorageData(charityEvent: AppCharityEvent): Promise<void> {
		// TODO: add typescript interface for CE meta storage data
		let data: CharityEventMetaStorageData = (await this.getCharityEventMetaStorageData(charityEvent)).data;
		if (!data) {
			return;
		}

		if (data.image) {
			const localStorageImage: string = await this.localStorage.getItem(data.image.storageHash).toPromise();

			if (!localStorageImage) {
				charityEvent.image = await this.metaDataStorageService.compressImage(
					await this.metaDataStorageService.getImage(data.image.storageHash).toPromise(),
					data.image.type
				);
				await this.localStorage.setItem(data.image.storageHash, charityEvent.image).toPromise();
			} else {
				charityEvent.image = localStorageImage;
			}

		}

		charityEvent.description = data.description;
	}

	protected getCharityEventMetaStorageData(charityEvent: AppCharityEvent): Promise<MetaStorageData> {
		return this.metaDataStorageService.getData(charityEvent.metaStorageHash).toPromise();
	}

	protected async updateCharityEventRaised(charityEvent: AppCharityEvent): Promise<boolean> {
		charityEvent.raised = +(await this.tokenContractService.balanceOf(charityEvent.address));
		return Promise.resolve(true);
	}

	public showAddCharityEventModal() {
		let modalInstance;
		modalInstance =	this.modal.open(
			AddCharityEventModalComponent,
			{
				size: 'lg',
				windowClass: 'modal-more-lg'
			}).componentInstance;
		modalInstance.organizationContractAddress = this.organizationAddress;
	}

	public doSort(mode: SortBy, reverse?: boolean) {
		if (mode === this.sort.by && reverse === undefined) {
			this.sort.reverse = !this.sort.reverse;
		} else {
			this.sort.by = mode;
			if (reverse !== undefined) {
				this.sort.reverse = reverse;
			} else {
				this.sort.reverse = this.sort.by !== SortBy.NAME; // don't reverse if sorting by name
			}
		}
		this.localStorage.getItem('SortCharityEvents').subscribe(item => {
			item = item || {}; // on first run item is NULL
			item[this.organizationAddress] = this.sort;
			this.localStorage.setItem('SortCharityEvents', item).toPromise();
		});
	}

	public ngAfterViewInit() {
		this.localStorage.getItem('SortCharityEvents')
			.filter((val) => !!val)
			.map(item => item && item[this.organizationAddress])
			.merge(this.sort$)
			.subscribe((sortParams: SortParams) => {
				if (!sortParams) return;
				this.sort.by = sortParams.by;
				this.sort.reverse = sortParams.reverse;
				this.doSort(sortParams.by, sortParams.reverse);
			});
	}
	public ngOnInit(): void {

	}
	public ngOnDestroy(): void {
		this.componentDestroyed.next();

	}

}
