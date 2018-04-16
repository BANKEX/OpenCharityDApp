import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {OrderPipe} from './pipes/order-by.pipe';
import {LoginFormComponent} from './login-form/login-form.component';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
	],
	exports: [
		// MODULES
		CommonModule,
		FormsModule,
		NgbModule,
		ReactiveFormsModule,
		// COMPONENTS
		// PIPES
		OrderPipe,
	],
	declarations: [
		OrderPipe,
		LoginFormComponent
	],
	providers: []
})
export class SharedModule {
}
