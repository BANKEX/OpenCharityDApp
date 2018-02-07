import {Directive, ElementRef, OnInit} from '@angular/core';

declare var $: any; // JQuery

//Card Portlet Refresh
@Directive({
	selector: '[card-portlet-refresh]'
})
export class cardPortletRefresh implements OnInit {
	constructor(private el: ElementRef) {
	}

	ngOnInit(): any {
		$(this.el.nativeElement).on('click', function (e) {
			$(this).parents('.card').addClass('card-refresh');
			setTimeout(() => {
				$(this).parents('.card').removeClass('card-refresh');
			}, 2000);
			e.preventDefault();
			e.stopPropagation();
		});
	}
}

//Card Portlet Refresh
@Directive({
	selector: '[card-portlet-delete]'
})
export class cardPortletDelete implements OnInit {
	constructor(private el: ElementRef) {
	}

	ngOnInit(): any {
		$(this.el.nativeElement).on('click', function (e) {
			$(this).parents('.card').addClass('animated zoomOut');
			$(this).parents('.card').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', () => {
				$(this).parents('.card').remove();
			});
			e.preventDefault();
			e.stopPropagation();
		});
	}
}

export const Cards_Directives = [
	cardPortletRefresh,
	cardPortletDelete
];
