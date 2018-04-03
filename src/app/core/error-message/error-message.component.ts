import {Component, OnInit} from '@angular/core';
import {ErrorMessageService} from '../error-message.service';
import {AlertMessage} from '../../open-charity-types';

@Component({
	selector: 'opc-error-message',
	templateUrl: 'error-message.component.html',
	styleUrls: ['error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {
	public errorMessages: Array<AlertMessage> = [];
	public hideMessages: Array<boolean> = [];

	constructor(
		private errorMessageService: ErrorMessageService
	) {}

	public ngOnInit(): void {
		this.errorMessageService.onErrorMessageChanged()
			.debounceTime(200)
			.subscribe((alertMessage: AlertMessage) => {
					this.errorMessages.push(alertMessage);
				},
				(err: Error) => {
					this.errorMessageService.addError(err.message);
				});

	}

	public closeMessage(index: number) {
		this.errorMessages.splice(index, 1);
	}
}
