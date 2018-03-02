import {NgModule} from '@angular/core';
import {CharityEventsListComponent} from './charity-events-list/charity-events-list.component';
import {RouterModule} from '@angular/router';
import {OrganizationRoutes} from './organization-routing.module';
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {AddCharityEventComponent} from './add-charity-event/add-charity-event.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
// tslint:disable-next-line:max-line-length
import {IncomingDonationsListComponent} from './incoming-donations-list/incoming-donations-list.component';
// tslint:disable-next-line:max-line-length
import {AddIncomingDonationComponent} from './add-incoming-donation/add-incoming-donation.component';
import {NgSelectizeModule} from 'ng-selectize';
import {OrganizationsListComponent} from './organizations-list/organizations-list.component';
import {IsOrganizationAddressGuard} from './is-organization-address.guard';
import {TagsBitmaskService} from './services/tags-bitmask.service';
import {SetBitmaskTagsComponent} from './set-bitmask-tags/set-bitmask-tags.component';
import {BitmaskTagsListComponent} from './bitmask-tags-list/bitmask-tags-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {IncomingDonationSendFundsModalComponent} from './incoming-donation-send-funds-modal/incoming-donation-send-funds-modal.component';
import {OrganizationContractEventsService} from '../core/contracts-services/organization-contract-events.service';
import {IsAdminGuard} from './is-admin.guard';
import {OrganizationSharedService} from './services/organization-shared.service';
import {CharityEventsCardComponent} from './charity-event-card/charity-events-card.component';
import {ActualCharityEventsComponent} from './actual-events/actual-events.component';
import {ActualIncomingDonationsComponent} from './actual-donations/actual-donations.component';
import {CharityEventsTransactionsHistoryComponent} from './charity-events-transactions-history/charity-events-transactions-history.component';
import {CharityEventEditorComponent} from './charity-event-editor/charity-event-editor.component';
import {CharityEventsAllComponent} from './charity-events-all/charity-events-all.component';
import {IncomingDonationsDetailsComponent} from './incoming-donations-details/incoming-donations-details.component';
import {IncomingDonationsEditorComponent} from './incoming-donation-editor/incoming-donation-editor.component';
import {IncomingDonationsAllComponent} from './incoming-donations-all/incoming-donations-all.component';

@NgModule({
	declarations: [
		OrganizationDetailsComponent,
		CharityEventsListComponent,
		AddCharityEventComponent,
		IncomingDonationsListComponent,
		AddIncomingDonationComponent,
		OrganizationsListComponent,
		SetBitmaskTagsComponent,
		BitmaskTagsListComponent,
		IncomingDonationSendFundsModalComponent,
		CharityEventsCardComponent,
		ActualCharityEventsComponent,
		ActualIncomingDonationsComponent,
		CharityEventsTransactionsHistoryComponent,
		CharityEventEditorComponent,
		CharityEventsAllComponent,
		IncomingDonationsDetailsComponent,
		IncomingDonationsEditorComponent,
		IncomingDonationsAllComponent
	],
  	entryComponents: [IncomingDonationSendFundsModalComponent],
	imports: [
		FormsModule,
		CommonModule,
		RouterModule.forChild(OrganizationRoutes),
		ReactiveFormsModule,
		NgSelectizeModule,
		NgbModule
	],
	providers: [
		IsOrganizationAddressGuard,
		TagsBitmaskService,
		IsOrganizationAddressGuard,
		IsAdminGuard,
		OrganizationSharedService,
	]
})

export class OrganizationModule {
}
