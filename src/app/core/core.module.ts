import {NgModule} from '@angular/core';
import {Web3ProviderService} from './web3-provider.service';
import {TokenContractService} from './token-contract.service';
import {LoadingOverlayComponent} from './loading-overlay/loading-overlay.component';
import {LoadingOverlayService} from './loading-overlay.service';

@NgModule({
	declarations: [
		LoadingOverlayComponent
	],
	exports: [LoadingOverlayComponent],
	providers: [
		Web3ProviderService,
		TokenContractService,
		LoadingOverlayService
	]
})
export class CoreModule {
}
