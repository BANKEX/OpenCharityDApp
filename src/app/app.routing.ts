/* tslint:disable: max-line-length */
import {Routes} from '@angular/router';
import {CommonLayoutComponent} from './common/common-layout.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/organization',
		pathMatch: 'full'
	},
	{
		path: '',
		component: CommonLayoutComponent,
		children: [
			{
				path: 'organization',
				loadChildren: './organization/organization.module#OrganizationModule'
			}
		]
	}
];
