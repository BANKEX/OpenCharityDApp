import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

interface CommonSettingsResponse {
	abis: {
		CharityEvent: any,
		Organization: any,
		IncomingDonation: any,
		OpenCharityToken: any
	};
	list: string[];
	type: 0 | -1;
}

// This service communicates with common settings storage
// These settings are common for backend, donators app and organizations app
// The storage contains list of current organizations and smart contracts abis
@Injectable()
export class CommonSettingsService {

	public get organizations(): string[] {
		return this._organizations;
	}
	private _organizations: string[];


	constructor(private httpClient: HttpClient) {

	}

	public async initSettings(): Promise<void> {
		const commonSettingsResponse: CommonSettingsResponse = await this.getOrganizationsList().first().toPromise();
		this._organizations = commonSettingsResponse.list;
	}

	private getOrganizationsList(environmentId?: number): Observable<any> {
		if (!environmentId) {
			environmentId = 0;
		}

		return this.httpClient.get(this.buildUrl(`settings/getOrganizationList/${environmentId}`));
	}



	private setOrganizationsList(organizations: string[], environmentId?: number): Observable<any> {
		if (!environmentId) {
			environmentId = 0;
		}

		return this.httpClient.post(this.buildUrl(`settings/setOrganizationList/${environmentId}`), organizations);
	}

	private buildUrl(path: string): string {
		return environment.apiUrl + path;
	}

}
