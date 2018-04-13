import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderPipe } from './pipes/order-by.pipe';

@NgModule({
  imports: [CommonModule],
  exports : [
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
  ],
  providers: [
  ]
})
export class SharedModule { }
