import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ErrorMessageService {

	private onErrorMessageAddSource: Subject<string> = new Subject<string>();

	constructor() {}

	public addError(message: string): void {
		this.onErrorMessageAddSource.next(message);
	}

	public onErrorMessageChanged(): Observable<string> {
		return this.onErrorMessageAddSource.asObservable().share();
	}

}
