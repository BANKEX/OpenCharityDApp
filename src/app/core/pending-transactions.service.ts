import {Injectable} from '@angular/core';
import {ReplaySubject, Observable} from 'rxjs';
import {PendingTransaction, PendingTransactionState, PendingTransactionSourceType} from '../pending-transaction.types';

@Injectable()
export class PendingTransactionService {
	public message: ReplaySubject<PendingTransaction> = new ReplaySubject<PendingTransaction>();

	constructor() {
		// TODO Remove next time, just test code
		this.message.next(<PendingTransaction>{
			title: "Test one",
			text: "Some transaction pending",
			state: PendingTransactionState.PENDING,
			source: PendingTransactionSourceType.CE
		});
		this.message.next(<PendingTransaction>{
			title: "Test two",
			text: "Some transaction confirmed",
			state: PendingTransactionState.CONFIRMED,
			source: PendingTransactionSourceType.ID
		});
		this.message.next(<PendingTransaction>{
			title: "Test three",
			text: "Some transaction failed",
			state: PendingTransactionState.FAILED,
			source: PendingTransactionSourceType.COMMON
		});
	}

	public addPending(title: string, text: string, source: PendingTransactionSourceType): void {
		this.message.next(<PendingTransaction>{
			title: title,
			text: text,
			state: PendingTransactionState.PENDING,
			source: source
		});
	}

	public addConfirmed(title: string, text: string, source: PendingTransactionSourceType): void {
		this.message.next(<PendingTransaction>{
			title: title,
			text: text,
			state: PendingTransactionState.CONFIRMED,
			source: source
		});
	}

	public addFailed(title: string, text: string, source: PendingTransactionSourceType): void {
		this.message.next(<PendingTransaction>{
			title: title,
			text: text,
			state: PendingTransactionState.FAILED,
			source: source
		});
	}
}
