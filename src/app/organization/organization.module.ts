import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {organizationRoutes} from './organization-routing.module';
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {AddCharityEventComponent} from './charity-events/add-charity-event/add-charity-event.component';
// tslint:disable-next-line:max-line-length
import {IncomingDonationsListComponent} from './incoming-donations/incoming-donations-list/incoming-donations-list.component';
// tslint:disable-next-line:max-line-length
import {AddIncomingDonationComponent} from './incoming-donations/add-incoming-donation/add-incoming-donation.component';
import {NgSelectizeModule} from 'ng-selectize';
import {OrganizationsListComponent} from './organizations-list/organizations-list.component';
import {IsOrganizationAddressGuard} from './is-organization-address.guard';
import {TagsBitmaskService} from './services/tags-bitmask.service';
import {SetBitmaskTagsComponent} from './set-bitmask-tags/set-bitmask-tags.component';
import {BitmaskTagsListComponent} from './bitmask-tags-list/bitmask-tags-list.component';
import {IncomingDonationSendFundsModalComponent} from './incoming-donations/incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {IsAdminGuard} from './is-admin.guard';
import {OrganizationSharedService} from './services/organization-shared.service';
import {CharityEventCardComponent} from './charity-events/charity-event-card/charity-event-card.component';
import {DashboardIncomingDonationsListComponent} from './incoming-donations/dashboard-incoming-donations-list/dashboard-incoming-donations-list.component';
import {CharityEventTransactionsHistoryComponent} from './charity-events/charity-event-transactions-history/charity-event-transactions-history.component';
import {CharityEventEditorComponent} from './charity-events/charity-event-editor/charity-event-editor.component';
import {CharityEventsAllComponent} from './charity-events/charity-events-all/charity-events-all.component';
import {IncomingDonationsDetailsComponent} from './incoming-donations/incoming-donations-details/incoming-donations-details.component';
import {IncomingDonationsEditorComponent} from './incoming-donations/incoming-donation-editor/incoming-donation-editor.component';
import {IncomingDonationsAllComponent} from './incoming-donations/incoming-donations-all/incoming-donations-all.component';
import {FileDropModule} from 'ngx-file-drop';
import {CharityEventsListBaseComponent} from './charity-events/charity-events-list-base.component';
import {DashboardCharityEventsListComponent} from './charity-events/dashboard-charity-events-list/dashboard-charity-events-list.component';
import {IncomingDonationFormComponent} from './incoming-donations/incoming-donation-form/incoming-donation-form.component';
import {IncomingDonationsSourcesFilterComponent} from './incoming-donations/incoming-donations-sources-filter/incoming-donations-sources-filter.component';
import {TagInputModule} from 'ngx-chips';
import {IncomingDonationsListBaseComponent} from './incoming-donations/incoming-donations-list-base.component';
import {AddIncomingDonationModalComponent} from './incoming-donations/add-incoming-donation-modal/add-incoming-donation-modal.component';
import {SharedModule} from '../shared/shared.module';
import {CharityEventFormComponent} from './charity-events/charity-event-form/charity-event-form.component';

import {QuillModule} from 'ngx-quill/src/quill.module';
import {ToastyConfig} from 'ng2-toasty';
import {AddCharityEventModalComponent} from './charity-events/add-charity-event-modal/add-charity-event-modal.component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CharityEventEditorModalComponent} from './charity-events/charity-event-editor-modal/charity-event-editor-modal.component';

@NgModule({
	declarations: [
		OrganizationDetailsComponent,
		AddCharityEventComponent,
		IncomingDonationsListComponent,
		AddIncomingDonationComponent,
		OrganizationsListComponent,
		SetBitmaskTagsComponent,
		BitmaskTagsListComponent,
		IncomingDonationSendFundsModalComponent,
		CharityEventCardComponent,
		DashboardCharityEventsListComponent,
		DashboardIncomingDonationsListComponent,
		CharityEventTransactionsHistoryComponent,
		CharityEventEditorComponent,
		CharityEventsAllComponent,
		IncomingDonationsDetailsComponent,
		IncomingDonationsEditorComponent,
		IncomingDonationsAllComponent,
		CharityEventsListBaseComponent,
		IncomingDonationFormComponent,
		IncomingDonationsSourcesFilterComponent,
		IncomingDonationsListBaseComponent,
		AddIncomingDonationModalComponent,
		IncomingDonationsListBaseComponent,
		CharityEventFormComponent,
		AddCharityEventModalComponent,
		CharityEventEditorModalComponent
	],
	entryComponents: [
		IncomingDonationSendFundsModalComponent,
		AddIncomingDonationModalComponent,
		AddCharityEventModalComponent,
		CharityEventEditorModalComponent
	],
	imports: [
		SharedModule,
		RouterModule.forChild(organizationRoutes),
		NgSelectizeModule,
		FileDropModule,
		TagInputModule,
		QuillModule
	],
	providers: [
		IsOrganizationAddressGuard,
		TagsBitmaskService,
		IsOrganizationAddressGuard,
		IsAdminGuard,
		OrganizationSharedService,
		NgbActiveModal
	]
})

export class OrganizationModule {
	constructor(private toastyConfig: ToastyConfig) {
		this.toastyConfig.theme = 'bootstrap';
	}
}
