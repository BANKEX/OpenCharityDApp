import {NgModule} from '@angular/core';
import {Web3ProviderService} from './web3-provider.service';
import {TokenContractService} from './token-contract.service';
import {LoadingOverlayComponent} from './loading-overlay/loading-overlay.component';
import {LoadingOverlayService} from './loading-overlay.service';
import {BlockingNotificationOverlayComponent} from './blocking-notification-overlay/blocking-notification-overlay.component';
import {MetamaskCheckService} from './metamask-check.service';
import {BlockingNotificationOverlayService} from './blocking-notification-overlay.service';
import {CommonModule} from '@angular/common';

export function windowFactory() {
	return window;

}

@NgModule({
	imports: [CommonModule],
	declarations: [
		LoadingOverlayComponent,
		BlockingNotificationOverlayComponent
	],
	exports: [LoadingOverlayComponent, BlockingNotificationOverlayComponent],
	providers: [
		Web3ProviderService,
		TokenContractService,
		LoadingOverlayService,
		BlockingNotificationOverlayService,
		MetamaskCheckService,
		{provide: 'Window', useFactory: windowFactory }
	]
})
export class CoreModule {
}
