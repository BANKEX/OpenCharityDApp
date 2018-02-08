import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {OrganizationContractService} from '../services/organization-contract.service';

@Component({
	selector: 'opc-organization-details',
	templateUrl: 'organization-details.component.html',
	styleUrls: ['organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit {
	public name: string;
	public changer: string = 'events';
	public organizationContractAddress;


	constructor(private organizationService: OrganizationContractService,
				private route: ActivatedRoute) {
		this.route.params.subscribe((params: Params) => {
			this.organizationContractAddress = params.address;
		});
	}

	public async ngOnInit(): Promise<void> {
		this.name = await this.organizationService.getName(this.organizationContractAddress);
	}

}
