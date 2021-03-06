import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {OrderPipe} from './pipes/order-by.pipe';
import {LoginFormComponent} from './login-form/login-form.component';
import {TestDataComponent} from './test-data/test-data.component';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModule,
	],
	exports: [
		// MODULES
		CommonModule,
		FormsModule,
		NgbModule,
		ReactiveFormsModule,
		NgbModule,
		// COMPONENTS
		// PIPES
		OrderPipe,
	],
	declarations: [
		OrderPipe,
		LoginFormComponent,
		TestDataComponent
	],
	providers: []
})
export class SharedModule {
}
