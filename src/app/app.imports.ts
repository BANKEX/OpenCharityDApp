import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {OrganizationModule} from './organization/organization.module';
import {NgxDnDModule} from '@swimlane/ngx-dnd';
import {FileDropModule} from 'ngx-file-drop';

export const APP_IMPORTS = [
	BrowserAnimationsModule,
	NgbModule.forRoot(),
	PerfectScrollbarModule,
	ReactiveFormsModule,
	OrganizationModule,
	FileDropModule
];

