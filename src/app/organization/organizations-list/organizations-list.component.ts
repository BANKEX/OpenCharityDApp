import {Component, OnInit} from '@angular/core';
import {Organization, OrganizationContractService} from '../services/organization-contract.service';
import {Router} from '@angular/router';

@Component({
	selector: 'opc-organizations-list',
	templateUrl: 'organizations-list.component.html',
	styleUrls: ['organizations-list.component.scss']
})
export class OrganizationsListComponent implements OnInit {
	// hardcoded list of organizations

	organizations: Organization[] = [];
	organizationsAddresses: string[] = environment.organizations;

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
