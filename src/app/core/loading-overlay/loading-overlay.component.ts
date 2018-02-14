import {Component, Input, OnInit} from '@angular/core';
import {LoadingOverlayService} from '../loading-overlay.service';

@Component({
	selector: 'opc-loading-overlay',
	templateUrl: 'loading-overlay.component.html',
	styleUrls: ['loading-overlay.component.scss']
})
export class LoadingOverlayComponent implements OnInit {
	public showOverlay: boolean = true;

	constructor(
		private loadingOverlayService: LoadingOverlayService
	) {

	}

	ngOnInit(): void {
		this.loadingOverlayService.onOverlayStateChanged()
			.debounceTime(200)
			.subscribe((showOverlay: boolean) => {
				console.log(Date.now());
					this.showOverlay = showOverlay;
				},
				(err: any) => {
					console.error(err.message);
				});

	}

}
