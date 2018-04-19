import {Injectable} from '@angular/core';
import {ReplaySubject, Observable} from 'rxjs';
import {PendingTransaction, PendingTransactionState, PendingTransactionSourceType} from '../pending-transaction.types';
import * as moment from 'moment';

@Injectable()
export class PendingTransactionService {
	public message: ReplaySubject<PendingTransaction> = new ReplaySubject<PendingTransaction>();

	constructor() {}

	public addPending(internalId: string, title: string, text: string, source: PendingTransactionSourceType): void {
		this.message.next(<PendingTransaction>{
			internalId: internalId,
			time: moment(new Date().getTime()).format('hh:mm:ss'),
			title: title,
			text: text,
			state: PendingTransactionState.PENDING,
			source: source
		});
	}

	public addConfirmed(internalId: string, title: string, text: string, source: PendingTransactionSourceType): void {
		this.message.next(<PendingTransaction>{
			internalId: internalId,
			time: moment(new Date().getTime()).format('hh:mm:ss'),
			title: title,
			text: text,
			state: PendingTransactionState.CONFIRMED,
			source: source
		});
	}

	public addFailed(internalId: string, title: string, text: string, source: PendingTransactionSourceType): void {
		this.message.next(<PendingTransaction>{
			internalId: internalId,
			time: moment(new Date().getTime()).format('hh:mm:ss'),
			title: title,
			text: text,
			state: PendingTransactionState.FAILED,
			source: source
		});
	}
}
