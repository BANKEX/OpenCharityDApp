import {Component, OnInit} from '@angular/core';
import {Organization, OrganizationContractService} from '../../core/contracts-services/organization-contract.service';
import {Router} from '@angular/router';
import {Web3ProviderService} from '../../core/web3-provider.service';
import {LoadingOverlayService} from '../../core/loading-overlay.service';
import {CommonSettingsService} from '../../core/common-settings.service';
import {AuthService} from '../../core/auth.service';

@Component({
	selector: 'opc-organizations-list',
	templateUrl: 'organizations-list.component.html',
	styleUrls: ['organizations-list.component.scss']
})
export class OrganizationsListComponent implements OnInit {

	public organizations: Organization[] = [];
	public listLoaded: boolean = false;

	private organizationsAddresses: string[];

	constructor(private commonSettingsService: CommonSettingsService,
				private organizationContractService: OrganizationContractService,
				private authService: AuthService,
				private router: Router,
				private loadingOverlayService: LoadingOverlayService) {
	}

	public async ngOnInit(): Promise<void> {
		this.loadingOverlayService.showOverlay();

		this.organizationsAddresses = this.commonSettingsService.organizations;

		for (let address of this.organizationsAddresses) {
			if (await this.organizationContractService.isAdmin(address, this.authService.currentAccount)) {
				this.organizations.push(await this.organizationContractService.getOrganization(address));
			}
		}




		this.loadingOverlayService.hideOverlay();
		this.listLoaded = true;
	}

	public goToOgranizationPage(address: string) {
		this.router.navigate(['/organization', address]);
	}

}
