import {Component, Input, OnInit} from '@angular/core';
import {merge} from 'lodash';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'opc-add-charity-event-modal',
	templateUrl: 'add-charity-event-modal.component.html',
	styleUrls: ['add-charity-event-modal.component.scss']
})
export class AddCharityEventModalComponent implements OnInit {
	@Input('organizationContractAddress') organizationContractAddress: string;

	constructor(
		public activeModal: NgbActiveModal
	) {}

	public ngOnInit() {}
}
