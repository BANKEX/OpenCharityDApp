import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [CommonModule],
  exports : [
	// MODULES
	CommonModule,
	FormsModule,
	NgbModule,
	ReactiveFormsModule,
	// COMPONENTS
  ],
  declarations: [],
})
export class SharedModule { }
