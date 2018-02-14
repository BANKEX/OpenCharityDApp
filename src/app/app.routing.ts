/* tslint:disable: max-line-length */
import {Routes} from '@angular/router';
import {NotFound404Component} from './not-found404.component';
import {CommonLayoutComponent} from './common/common-layout.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/organization',
		pathMatch: 'full'
	},
	{
		path: 'organization',
		loadChildren: './organization/organization.module#OrganizationModule'
	},
	{
		path: '**',
		component: CommonLayoutComponent,
		children: [
			{
				path: '**',
				component: NotFound404Component
			}
		]
	}
];
