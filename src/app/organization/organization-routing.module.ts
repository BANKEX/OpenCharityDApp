import {Routes} from '@angular/router';
//Dashboard Components
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {OrganizationsListComponent} from './organizations-list/organizations-list.component';
import {CommonLayoutComponent} from '../common/common-layout.component';
import {IsOrganizationAddressGuard} from './is-organization-address.guard';


export const OrganizationRoutes: Routes = [
	{
		path: 'list',
		component: OrganizationsListComponent,
	},
	{
		path: 'organization',
		component: CommonLayoutComponent,
		children: [
			{
				path: '',
				component: OrganizationsListComponent
			},
			{
				path: ':address',
				component: OrganizationDetailsComponent,
				canActivate: [IsOrganizationAddressGuard]
			},
		]
	}
];

