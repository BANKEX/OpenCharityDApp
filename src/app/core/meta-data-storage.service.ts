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

	public convertArrayBufferToBase64(arrayBuffer: ArrayBuffer, type: string) {
		let binary = '';
		const bytes = new Uint8Array(arrayBuffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return `data:${type};base64,` + window.btoa(binary);
	}

	public convertArrayBufferToFile(arrayBuffer: ArrayBuffer, type: string, name: string): File {
		return new File([new Blob([arrayBuffer], {type: type})], name);
	}

	public compressImage(arrayBuffer: ArrayBuffer, type: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let image = new Image();

			image.onload = () => {
				resolve(this.jicCompress(image, type));
			};

			image.onerror = (err: ErrorEvent) => {
				reject(err);
			};

			image.src = this.convertArrayBufferToBase64(arrayBuffer, type);
		});
	}

	private jicCompress(sourceImgObj, mimeType): string {
		let quality = 100;

		let maxHeight = 500;
		let maxWidth = 500;

		let height = sourceImgObj.height;
		let width = sourceImgObj.width;

		// calculate the width and height, constraining the proportions
		if (width > height) {
			if (width > maxWidth) {
				height = Math.round(height *= maxWidth / width);
				width = maxWidth;
			}
		} else {
			if (height > maxHeight) {
				width = Math.round(width *= maxHeight / height);
				height = maxHeight;
			}
		}

		let cvs = document.createElement('canvas');
		cvs.width = width;
		cvs.height = height;

		let ctx = cvs.getContext('2d').drawImage(sourceImgObj, 0, 0, width, height);
		let newImageData = cvs.toDataURL(mimeType, quality);
		let resultImageObj = new Image();
		resultImageObj.src = newImageData;

		return resultImageObj.src;
	}

	private buildUrl(url: string): string {
		return environment.apiUrl + 'meta/' + url;
	}

}
