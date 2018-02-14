import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BlockingNotificationOverlayService} from '../blocking-notification-overlay.service';
import {Subject} from 'rxjs/Subject';

@Component({
	selector: 'opc-blocking-notification-overlay',
	templateUrl: 'blocking-notification-overlay.component.html',
	styleUrls: ['blocking-notification-overlay.component.scss']
})
export class BlockingNotificationOverlayComponent implements OnInit, OnDestroy {

	public showOverlay: boolean;
	public message: string;
	private componentDestroyed: Subject<void> = new Subject<void>();

	constructor(
		private blockingNotificationOverlayService: BlockingNotificationOverlayService
	) {

	}

	ngOnInit(): void {
		this.blockingNotificationOverlayService.onSetMessage()
			.takeUntil(this.componentDestroyed)
			.subscribe((message: string) => {
					this.message = message;
				},
				(err: any) => {
					console.error(err);
				});

		this.blockingNotificationOverlayService.onShowOverlay()
			.subscribe((isVisible: boolean) => {
					this.showOverlay = isVisible;
				},
				(err: any) => {
					console.error(err);
				});
	}

	ngOnDestroy(): void {
		this.componentDestroyed.next();
	}

}
