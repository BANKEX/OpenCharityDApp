import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Web3ProviderService} from './core/web3-provider.service';
import {LoadingOverlayService} from './core/loading-overlay.service';

@Component({
	selector: 'my-app',
	styleUrls: ['main.scss', './app.component.scss'],
	templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

	public showLoadingOverlay: boolean = true;

	constructor(
		private web3ProviderService: Web3ProviderService,
		private loadingOverlayService: LoadingOverlayService
	) {
	}

	ngOnInit() {
		this.showLoadingOverlay = false;

		this.loadingOverlayService.onOverlayStateChanged()
			.subscribe((showOverlay: boolean) => {
					this.showLoadingOverlay = showOverlay;
				},
				(err: any) => {
					console.error(err.message);
				});
	}



}
