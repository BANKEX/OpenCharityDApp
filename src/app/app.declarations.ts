import {NotFound404Component} from './not-found404.component';
import {CommonLayoutComponent} from './common/common-layout.component';
import {AuthenticationLayoutComponent} from './common/authentication-layout.component';
import {SIDEBAR_DIRECTIVES} from './shared/directives/side-nav.directive';
import {CARDS_DIRECTIVES} from './shared/directives/cards.directive';

export const APP_DECLARATIONS = [
	NotFound404Component,
	CommonLayoutComponent,
	AuthenticationLayoutComponent,
	SIDEBAR_DIRECTIVES,
	CARDS_DIRECTIVES
];
