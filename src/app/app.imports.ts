import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {OrganizationModule} from './organization/organization.module';
import {FileDropModule} from 'ngx-file-drop';
import {ToastyModule} from 'ng2-toasty';

export const APP_IMPORTS = [
	BrowserAnimationsModule,
	NgbModule.forRoot(),
	ReactiveFormsModule,
	OrganizationModule,
	FileDropModule,
	ToastyModule
];

