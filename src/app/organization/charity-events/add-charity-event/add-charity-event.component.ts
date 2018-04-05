import {Component, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {merge} from 'lodash';

@Component({
	selector: 'opc-add-charity-event',
	templateUrl: 'add-charity-event.component.html',
	styleUrls: ['add-charity-event.component.scss']
})
export class AddCharityEventComponent implements OnInit {
	@Input('organizationContractAddress') public organizationContractAddress: string;

	constructor() {}

	public ngOnInit() {}
}
