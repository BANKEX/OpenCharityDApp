import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class IsOrganizationAddressGuard implements CanActivate {

	constructor(private router: Router,) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const address = route.params.address;
		if (address.length > 10) {
			return true;
		} else {
			this.router.navigate(['/organization/list']);
			// abort current navigation
			return false;
		}
	}

	private isValidAddress(address: string): boolean {
		return false;
	}
}
