import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {MetamaskCheckService} from '../core/metamask-check.service';
import {OrganizationContractService} from '../core/contracts-services/organization-contract.service';
import {Web3ProviderService} from '../core/web3-provider.service';
import {BlockingNotificationOverlayService} from '../core/blocking-notification-overlay.service';
import {AuthService} from '../core/auth.service';

@Injectable()
export class IsAdminGuard implements CanActivate {

	constructor(
		private router: Router,
		private authService: AuthService,
		private organizationContractService: OrganizationContractService
	) {
	}

	public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const organizationAddress = route.params.address;
		const userAddress = this.authService.currentAccount;
		const isAdmin: boolean = await this.organizationContractService.isAdmin(organizationAddress, userAddress);
		if (isAdmin) {
			return true;
		} else {
			this.router.navigate(['organization']);
			return false;
		}

	}
}
