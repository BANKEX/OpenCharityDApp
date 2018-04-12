import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TagService {
	constructor(
		private $http: HttpClient
	) {
	}

	public async getTagNames(ids?: number[]): Promise<string[]> {
		if (ids) {
			return <Promise<string[]>>this.$http.post(this.buildUrl('find'), {tag: ids}).toPromise();
		} else {
			return <Promise<string[]>>this.$http.get(this.buildUrl('all')).toPromise();
		}
	}

	public async getTagIds(names: string[]): Promise<number[]> {
		return <Promise<number[]>>this.$http.post(this.buildUrl('add'),  {tag: names}).toPromise();
	}

	public intersect(arr1: number[] = [], arr2: number[] = []): boolean {
		return arr2.length === 0 && arr2.length === 0 ? true : this.intersection(arr1, arr2).length > 0;
	}

	public intersection(arr1: number[] = [], arr2: number[] = []): number[] {
		return arr1.filter((n) => arr2.indexOf(n) !== -1);
	}

	private buildUrl(path: string): string {
		return environment.apiUrl + 'tag/' + path;
	}
}
