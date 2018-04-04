import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {
	CHARITY_EVENT_CONTRACT_ABI,
	INCOMING_DONATION_CONTRACT_ABI,
	OPEN_CHARITY_TOKEN_CONTRACT_ABI,
	ORGANIZATION_CONTRACT_ABI
} from '../contracts-abi';

type CommonSettingsContractsAbis = {
	CharityEvent: any,
	Organization: any,
	IncomingDonation: any,
	OpenCharityToken: any
};

interface CommonSettingsResponse {
	abis: CommonSettingsContractsAbis;
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

	public get abis(): CommonSettingsContractsAbis {
		return this._abis;
	}

	private _organizations: string[];
	private _abis: CommonSettingsContractsAbis;


	constructor(private httpClient: HttpClient) {

	}

	public async initSettings(): Promise<void> {
		const type = (ENV === 'development') ? -1 : 0;
		if (ENV === 'development') {
			this._organizations = environment.organizations;
			this._abis = {
				CharityEvent: CHARITY_EVENT_CONTRACT_ABI,
				Organization: ORGANIZATION_CONTRACT_ABI,
				IncomingDonation: INCOMING_DONATION_CONTRACT_ABI,
				OpenCharityToken: OPEN_CHARITY_TOKEN_CONTRACT_ABI
			};
		} else {
			const commonSettingsResponse: CommonSettingsResponse = await this.getOrganizationsList(type).first().toPromise();
			this._organizations = commonSettingsResponse.list;
			this._abis = commonSettingsResponse.abis;
		}
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
