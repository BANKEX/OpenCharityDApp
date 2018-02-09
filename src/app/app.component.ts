import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Web3ProviderService} from './core/web3-provider.service';

@Component({
	selector: 'my-app',
	styleUrls: ['main.scss', './app.component.scss'],
	templateUrl: './app.component.html'
})

export class AppComponent {
	constructor(public route: ActivatedRoute,
				public router: Router,
				private web3ProviderService: Web3ProviderService) {
	}

}
