import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {loadingOverlayConfig} from '../open-charity-types';

@Injectable()
export class LoadingOverlayService {

	private _showOverlay = false;
	private onOverlayStateChangedSource: Subject<loadingOverlayConfig> = new Subject<loadingOverlayConfig>();

	constructor() {}

	public showOverlay(transparent?: boolean): void {
		this._showOverlay = true;
		this.onOverlayStateChangedSource.next({ showOverlay: true, transparent: transparent});
	}

	public hideOverlay(): void {
		this._showOverlay = false;
		this.onOverlayStateChangedSource.next({ showOverlay: false, transparent: false});
	}

	public onOverlayStateChanged(): Observable<loadingOverlayConfig> {
		return this.onOverlayStateChangedSource.asObservable().share();
	}

}
