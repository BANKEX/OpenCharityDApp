/**
 * This module is the entry for your App when NOT using universal.
 *
 * Make sure to use the 3 constant APP_ imports so you don't have to keep
 * track of your root app dependencies here. Only import directly in this file if
 * there is something that is specific to the environment.
 */

import {APP_INITIALIZER, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {IdlePreload, IdlePreloadModule} from 'angular-idle-preload';

import {APP_DECLARATIONS} from './app.declarations';
import {APP_ENTRY_COMPONENTS} from './app.entry-components';
import {APP_IMPORTS} from './app.imports';
import {APP_PROVIDERS} from './app.providers';

import {routes} from './app.routing';

import {AppComponent} from './app.component';


import {CoreModule} from './core/core.module';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {CommonSettingsService} from './core/common-settings.service';

// tslint:disable-next-line:no-any
export function initAppFactory(commonSettingsService: CommonSettingsService): () => Promise<any> {
	return () => commonSettingsService.initSettings();
}

@NgModule({
	declarations: [
		AppComponent,
		APP_DECLARATIONS
	],
	entryComponents: [APP_ENTRY_COMPONENTS],
	imports: [
		BrowserModule,
		HttpClientModule,
		CoreModule,
		APP_IMPORTS,
		IdlePreloadModule.forRoot(), // forRoot ensures the providers are only created once
		RouterModule.forRoot(routes, {useHash: false, preloadingStrategy: IdlePreload}),
	],
	bootstrap: [AppComponent],
	exports: [AppComponent],
	providers: [
		APP_PROVIDERS,
		{provide: APP_INITIALIZER, useFactory: initAppFactory, deps: [CommonSettingsService], multi: true}
	]
})

export class AppModule {

}
