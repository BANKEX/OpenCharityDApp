import {Component, OnInit} from '@angular/core';
import {LoadingTransparentOverlayService} from '../loading-transparent-overlay.service';

@Component({
	selector: 'opc-loading-transparent-overlay',
	templateUrl: 'loading-transparent-overlay.component.html',
	styleUrls: ['loading-transparent-overlay.component.scss']
})
export class LoadingTransparentOverlayComponent implements OnInit {
	public showOverlay: boolean = false;

	constructor(
		private loadingTransparentOverlayService: LoadingTransparentOverlayService
	) {

	}

	ngOnInit(): void {
		this.loadingTransparentOverlayService.onOverlayStateChanged()
			.debounceTime(200)
			.subscribe((showOverlay: boolean) => {
					this.showOverlay = showOverlay;
				},
				(err: any) => {
					console.error(err.message);
				});

	}

}
