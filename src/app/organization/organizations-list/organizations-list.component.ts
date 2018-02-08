import {Component, OnInit} from '@angular/core';
import {Organization, OrganizationContractService} from '../organization-contract.service';
import {Router} from '@angular/router';

@Component({
	selector: 'opc-organizations-list',
	templateUrl: 'organizations-list.component.html',
	styleUrls: ['organizations-list.component.scss']
})
export class OrganizationsListComponent implements OnInit {
	// hardcoded list of organizations

	organizations: Organization[] = [];
	organizationsAddresses: string[] = [
		'0xe777faf8240196ba99c6e2a89e8f24b75c52eb2a',
		'0x8ccb553bc7c6cc3112c9918362eae0bddcc51e3f',
		'0x05cfcc5c600945df11bb799344be75429dc72097',
		'0xc4e24e6b25fb81e3aae568c3e1d7da04ccebd762'
	];

	constructor(private organizationContractService: OrganizationContractService,
				private router: Router) {


	}


	public async ngOnInit(): Promise<void> {
		for (let address of this.organizationsAddresses) {
			this.organizations.push(await this.organizationContractService.getOrganization(address));
		}
	}

	public goToOgranizationPage(address: string) {
		this.router.navigate(['/organization', address]);
	}


}
