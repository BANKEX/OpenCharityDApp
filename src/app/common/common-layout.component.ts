import {Component, OnInit} from '@angular/core';

@Component({
	selector: 'app-dashboard',
	templateUrl: './common-layout.component.html'
})

export class CommonLayoutComponent implements OnInit {

	public app: any;
	public headerThemes: any;
	public changeHeader: any;
	public sidenavThemes: any;
	public changeSidenav: any;
	public headerSelected: any;
	public sidenavSelected: any;

	constructor() {
		this.app = {
			layout: {
				sidePanelOpen: false,
				isMenuOpened: true,
				isMenuCollapsed: false,
				themeConfigOpen: false,
				rtlActived: false
			}
		};

		this.headerThemes = ['header-default', 'header-primary', 'header-info', 'header-success', 'header-danger', 'header-dark'];
		this.changeHeader = changeHeader;

		function changeHeader(headerTheme) {
			this.headerSelected = headerTheme;
		}

		this.sidenavThemes = ['sidenav-default', 'side-nav-dark'];
		this.changeSidenav = changeSidenav;

		function changeSidenav(sidenavTheme) {
			this.sidenavSelected = sidenavTheme;
		}
	}


	ngOnInit() {
	}
}
