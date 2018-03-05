import {Routes} from '@angular/router';
//Dashboard Components
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {OrganizationsListComponent} from './organizations-list/organizations-list.component';
import {CharityEventsTransactionsHistoryComponent} from './charity-events/charity-events-transactions-history/charity-events-transactions-history.component';
import {CommonLayoutComponent} from '../common/common-layout.component';
import {CharityEventEditorComponent} from './charity-events/charity-event-editor/charity-event-editor.component';
import {CharityEventsAllComponent} from './charity-events/charity-events-all/charity-events-all.component';
import {IncomingDonationsDetailsComponent} from './incoming-donations/incoming-donations-details/incoming-donations-details.component';
import {IncomingDonationsEditorComponent} from './incoming-donations/incoming-donation-editor/incoming-donation-editor.component';
import {IncomingDonationsAllComponent} from './incoming-donations/incoming-donations-all/incoming-donations-all.component';
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
		path: ':address/event/:event/transactions',
		component: CharityEventsTransactionsHistoryComponent
	}, {
		path: ':address/event/:event/editor',
		component: CharityEventEditorComponent
	}, {
		path: ':address/events',
		component: CharityEventsAllComponent
	}, {
		path: ':address/donation/:donation/details',
		component: IncomingDonationsDetailsComponent
	}, {
		path: ':address/donation/editor',
		component: IncomingDonationsEditorComponent
	}, {
		path: ':address/donations',
		component: IncomingDonationsAllComponent
	}]
}];
