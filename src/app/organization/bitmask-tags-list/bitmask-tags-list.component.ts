import {Component, Input, OnInit} from '@angular/core';
import {Tag, TagsBitmaskService} from '../services/tags-bitmask.service';

@Component({
	selector: 'opc-bitmask-tags-list',
	templateUrl: 'bitmask-tags-list.component.html',
	styleUrls: ['bitmask-tags-list.component.scss']
})

export class BitmaskTagsListComponent implements OnInit {
	public parsedTags: Tag[] = [];
	private _tags: string;

	constructor(private tagsBitmaskService: TagsBitmaskService) {

	}

	get tags(): string {
		return this._tags;
	}

	@Input('tags')
	set tags(value: string) {
		this._tags = value;
		this.parsedTags = this.parseBitmaskIntoTags(this._tags);

	}

	public ngOnInit(): void {
	}

	public parseBitmaskIntoTags(tags: string): Tag[] {
		const bitmask = parseInt(tags, 16);
		return this.tagsBitmaskService.parseBitmaskIntoTags(bitmask);
	}

}
