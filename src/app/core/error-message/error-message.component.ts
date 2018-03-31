import {Component, OnInit} from '@angular/core';
import {ErrorMessageService} from '../error-message.service';

@Component({
	selector: 'opc-error-message',
	templateUrl: 'error-message.component.html',
	styleUrls: ['error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {
	public errorMessages: Array<string> = [];

	constructor(
		private errorMessageService: ErrorMessageService
	) {}

	ngOnInit(): void {
		this.errorMessageService.onErrorMessageChanged()
			.debounceTime(200)
			.subscribe((message: string) => {
					this.errorMessages.push(message);
				},
				(err: any) => {
					this.errorMessageService.addError(err.message);
				});

	}

	public closeMessage(index: number) {
		this.errorMessages.splice(index, 1);
	}
}
