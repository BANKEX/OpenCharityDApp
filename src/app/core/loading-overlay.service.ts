import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LoadingOverlayService {

	private _showOverlay = false;
	private onOverlayStateChangedSource: Subject<boolean> = new Subject<boolean>();

	constructor() {

	}

	public showOverlay(): void {
		this._showOverlay = true;
		this.onOverlayStateChangedSource.next(true);
	}

	public hideOverlay(): void {
		this._showOverlay = false;
		this.onOverlayStateChangedSource.next(false);
	}

	public onOverlayStateChanged(): Observable<boolean> {
		return this.onOverlayStateChangedSource.asObservable().share();
	}

}
