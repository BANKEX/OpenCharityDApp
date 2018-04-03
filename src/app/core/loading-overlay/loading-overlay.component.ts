import {Component, OnInit} from '@angular/core';
import {LoadingOverlayService} from '../loading-overlay.service';
import {loadingOverlayConfig} from '../../open-charity-types';

@Component({
	selector: 'opc-loading-overlay',
	templateUrl: 'loading-overlay.component.html',
	styleUrls: ['loading-overlay.component.scss']
})
export class LoadingOverlayComponent implements OnInit {
	public showOverlay: boolean = true;
	public transparent: boolean = false;

	constructor(
		private loadingOverlayService: LoadingOverlayService
	) {

	}

	public ngOnInit(): void {
		this.loadingOverlayService.onOverlayStateChanged()
			.debounceTime(200)
			.subscribe((config: loadingOverlayConfig) => {
					this.showOverlay = config.showOverlay;
					this.transparent = config.transparent;
				},
				(err: Error) => {
					console.error(err.message);
				});

	}

}
