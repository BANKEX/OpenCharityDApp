import {NotFound404Component} from './not-found404.component';
import {CommonLayoutComponent} from './common/common-layout.component';
import {AuthenticationLayoutComponent} from './common/authentication-layout.component';
import {Sidebar_Directives} from './shared/directives/side-nav.directive';
import {Cards_Directives} from './shared/directives/cards.directive';

export const APP_DECLARATIONS = [
	NotFound404Component,
	CommonLayoutComponent,
	AuthenticationLayoutComponent,
	Sidebar_Directives,
	Cards_Directives
];
