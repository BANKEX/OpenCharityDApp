import {Injectable} from '@angular/core';
import {ReplaySubject, Observable} from 'rxjs';
import {PendingTransaction, PendingTransactionState, PendingTransactionSourceType} from '../pending-transaction.types';

@Injectable()
export class PendingTransactionService {
	private _amount: number = 0;
	public message: ReplaySubject<PendingTransaction> = new ReplaySubject<PendingTransaction>();

	constructor() {
		// TODO Remove next time, just test code
		// this.message.next(<PendingTransaction>{
		// 	title: "Test one",
		// 	text: "Some transaction pending",
		// 	state: PendingTransactionState.PENDING,
		// 	source: PendingTransactionSourceType.CE
		// });
		// this.message.next(<PendingTransaction>{
		// 	title: "Test two",
		// 	text: "Some transaction confirmed",
		// 	state: PendingTransactionState.CONFIRMED,
		// 	source: PendingTransactionSourceType.ID
		// });
		// this.message.next(<PendingTransaction>{
		// 	title: "Test three",
		// 	text: "Some transaction failed",
		// 	state: PendingTransactionState.FAILED,
		// 	source: PendingTransactionSourceType.COMMON
		// });
	}

	public addPending(title: string, text: string): PendingTransaction {
		const id = this._amount;
		let message = <PendingTransaction>{
			id: id,
			title: title,
			text: text,
			state: PendingTransactionState.PENDING,
			source: PendingTransactionSourceType.COMMON
		};
		this.message.next(message);
		this._amount++;
		return message;
	}

	public confirmTransaction(transaction: PendingTransaction): void {
		transaction.state = PendingTransactionState.CONFIRMED;
		this.message.next(transaction);
	}

	public rejectTransaction(transaction: PendingTransaction): void {
		transaction.state = PendingTransactionState.FAILED;
		this.message.next(transaction);
	}
}
