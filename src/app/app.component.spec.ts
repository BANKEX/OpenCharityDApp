/* tslint:disable: max-line-length */
import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';

import {NotFound404Component} from './not-found404.component';
import {routes} from './app.routing';

import 'rxjs/add/operator/takeUntil';

describe('App Component', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				ReactiveFormsModule,
				RouterTestingModule.withRoutes(routes)
			],
			providers: [],
			declarations: [AppComponent, NotFound404Component]
		});
	});

	it('should contain app text', async(() => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		expect(fixture.nativeElement).toContainText('Angular Starter App');
	}));

});
