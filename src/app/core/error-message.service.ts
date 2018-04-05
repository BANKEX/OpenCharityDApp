import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {AlertMessage} from '../open-charity-types';

@Injectable()
export class ErrorMessageService {

	private onErrorMessageAddSource: Subject<AlertMessage> = new Subject<AlertMessage>();

	constructor() {}

	public addError(message: string, title?: string): void {
		this.onErrorMessageAddSource.next({ title, message });
	}

	public onErrorMessageChanged(): Observable<AlertMessage> {
		return this.onErrorMessageAddSource.asObservable().share();
	}

}
