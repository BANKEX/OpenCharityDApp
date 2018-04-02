import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subscribable} from 'rxjs/Observable';
import {MetaStorageData, MetaStorageFile} from '../open-charity-types';

@Injectable()
export class MetaDataStorageService {

	constructor(private httpClient: HttpClient) {

	}

	// 'text' as 'text' source:
	// https://github.com/angular/angular/issues/18586
	/* tslint:disable-next-line */
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

		// data.data = new Blob([JSON.stringify(data.data)]);

		return this.httpClient.post(this.buildUrl('postData'), data, httpOptions);
	}

	/* tslint:disable-next-line */
	public getData(hash: string): Observable<any> {
		return this.httpClient.get(this.buildUrl('getData/' + hash));
	}

	public getImage(hash: string): Observable<ArrayBuffer> {
		const httpOptions = {
			headers: new HttpHeaders({
				'X-Content-Type-Options': 'nosniff'
			}),
			responseType: 'arraybuffer' as 'arraybuffer'
		};

		return this.httpClient.get(this.buildUrl('getData/' + hash), httpOptions);
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

	public convertArrayBufferToFile(arrayBuffer: ArrayBuffer, type: string, name: string): File {
		return new File([new Blob( [ arrayBuffer ], { type: type } )], name);
	}

	private buildUrl(url: string): string {
		return environment.apiUrl+'meta/' + url;
	}

}
