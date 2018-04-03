import {Routes} from '@angular/router';
// Dashboard Components
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {OrganizationsListComponent} from './organizations-list/organizations-list.component';
import {CharityEventTransactionsHistoryComponent} from './charity-events/charity-event-transactions-history/charity-event-transactions-history.component';
import {CommonLayoutComponent} from '../common/common-layout.component';
import {CharityEventEditorComponent} from './charity-events/charity-event-editor/charity-event-editor.component';
import {CharityEventsAllComponent} from './charity-events/charity-events-all/charity-events-all.component';
import {IncomingDonationsDetailsComponent} from './incoming-donations/incoming-donations-details/incoming-donations-details.component';
import {IncomingDonationsEditorComponent} from './incoming-donations/incoming-donation-editor/incoming-donation-editor.component';
import {IncomingDonationsAllComponent} from './incoming-donations/incoming-donations-all/incoming-donations-all.component';
import {IsOrganizationAddressGuard} from './is-organization-address.guard';
import {IsAdminGuard} from './is-admin.guard';
import {AddIncomingDonationComponent} from './incoming-donations/add-incoming-donation/add-incoming-donation.component';

export const organizationRoutes: Routes = [{
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
		component: CharityEventTransactionsHistoryComponent
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
		path: ':address/donation/:donation/edit',
		component: IncomingDonationsEditorComponent
	}, {
		path: ':address/donation/add',
		component: AddIncomingDonationComponent
	}, {
		path: ':address/donations',
		component: IncomingDonationsAllComponent
	}]
}];
