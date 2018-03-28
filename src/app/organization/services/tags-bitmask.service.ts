import {Injectable} from '@angular/core';
import {filter} from 'lodash';


export interface Tag {
	name: string;
	value: number;
}

@Injectable()
export class TagsBitmaskService {

	public tags: Tag[] = [
		{
			name: 'животные',
			value: 1 << 0
		},
		{
			name: 'дети',
			value: 1 << 1
		},
		{
			name: 'Москва',
			value: 1 << 2
		},
		{
			name: 'Санкт-Петербург',
			value: 1 << 3
		},
		{
			name: 'лекарства',
			value: 1 << 4
		},
		{
			name: 'игрушки',
			value: 1 << 5
		}
	];

	// format hex value to add leading zeros. otherwise web3 returns "bytes has an invalid length" error;
	public convertToHexWithLeadingZeros(value: number) {
		return ('0' + value.toString(16)).substr(-2);
	}

	public parseBitmaskIntoTags(bitmask: number): Tag[] {
		return filter(this.tags, ((tag: Tag) => {
			if (this.isSelectedTag(bitmask, tag.value)) {
				return tag;
			}
		}));
	}


	public addTag(bitmask: number, tagValue: number): number {
		return bitmask | tagValue;
	}

	public isSelectedTag(bitmask: number, tagValue: number): boolean {
		return (bitmask & tagValue) > 0;
	}

	public removeTag(bitmask: number, tagValue: number): number {
		return bitmask & (~tagValue);

	}

	public toggleTag(bitmask: number, tagValue: number): number {
		return (this.isSelectedTag(bitmask, tagValue)) ? this.removeTag(bitmask, tagValue) : this.addTag(bitmask, tagValue);
	}

	// compares 2 bitmasks
	// returns true if they have at least one same tag
	public containSimilarTags(bitmask1: number, bitmask2: number): boolean {
		if (bitmask1 === 0 || bitmask2 === 0) { return true;}
		return (bitmask1 & bitmask2) > 0;
	}

}
