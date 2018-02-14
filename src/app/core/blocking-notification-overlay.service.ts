import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class BlockingNotificationOverlayService {

	private onSetMessageSource: Subject<string> = new Subject<string>();
	private onShowOverlaySource: Subject<boolean> = new Subject<boolean>();

	constructor() {}

	public showOverlay(): void {
		this.onShowOverlaySource.next(true);

	}

	public hideOverlay(): void {
		this.onShowOverlaySource.next(false);
	}

	public setOverlayMessage(message: string) {
		this.onSetMessageSource.next(message);
	}

	public onSetMessage(): Observable<string> {
		return this.onSetMessageSource.asObservable();
	}

	public onShowOverlay(): Observable<boolean> {
		return this.onShowOverlaySource.asObservable();
	}

}
