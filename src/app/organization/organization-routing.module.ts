import {Routes} from '@angular/router';
//Dashboard Components
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {OrganizationsListComponent} from './organizations-list/organizations-list.component';
import {CharityEventsTransactionsHistoryComponent} from './charity-events-transactions-history/charity-events-transactions-history.component';
import {CommonLayoutComponent} from '../common/common-layout.component';
import {IsOrganizationAddressGuard} from './is-organization-address.guard';
import {IsAdminGuard} from './is-admin.guard';


export const OrganizationRoutes: Routes = [{
	path: 'organization',
	component: CommonLayoutComponent,
	children: [{
		path: '',
		component: OrganizationsListComponent
	}, {
		path: ':address',
		component: OrganizationDetailsComponent,
		canActivate: [IsOrganizationAddressGuard, IsAdminGuard]
	}, {
		path: ':address/charityevent/:event/transactions',
		component: CharityEventsTransactionsHistoryComponent
	}]
}];
