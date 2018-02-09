import {NgModule} from '@angular/core';
import {Web3ProviderService} from './web3-provider.service';
import {TokenContractService} from './token-contract.service';

@NgModule({
	providers: [
		Web3ProviderService,
		TokenContractService
	]
})
export class CoreModule {
}
