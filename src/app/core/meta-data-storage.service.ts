import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subscribable} from 'rxjs/Observable';

@Injectable()
export class MetaDataStorageService {

	private metaStorageUrl: string = environment.metaStorageUrl;

	constructor(private httpClient: HttpClient) {

	}

	// 'text' as 'text' source:
	// https://github.com/angular/angular/issues/18586

	public storeData(data: any, convertToBlob?: boolean): Observable<any> {
		const httpOptions = {
			headers: new HttpHeaders({
				'X-Content-Type-Options': 'nosniff'
			}),
			responseType: 'text' as 'text'
		};

		if (convertToBlob) {
			data = new Blob([JSON.stringify(data)]);
		}

		return this.httpClient.post(this.buildUrl('postData'), data, httpOptions);
	}

	public getData(hash: string): Observable<any> {
		return this.httpClient.get(this.buildUrl('getData/'+hash));
	}

	public getImage(hash: string): Observable<any> {
		const httpOptions = {
			headers: new HttpHeaders({
				'X-Content-Type-Options': 'nosniff'
			}),
			responseType: 'arraybuffer' as 'arraybuffer'
		};

		return this.httpClient.get(this.buildUrl('getData/'+hash), httpOptions);
	}

	public convertArrayBufferToBase64(arrayBuffer: ArrayBuffer) {
		let binary = '';
		const bytes = new Uint8Array( arrayBuffer );
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	private buildUrl(url: string): string {
		return this.metaStorageUrl+url;
	}

}
