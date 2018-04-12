import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { TagService } from '../services/tag.service';


class Tag {
	public display: string;
	public value: string;
	constructor(name) {
		this.display = name;
		this.value = name;
	}
}

@Component({
	selector: 'opc-set-tags',
	templateUrl: 'set-tags.component.html',
	styleUrls: ['set-tags.component.scss']
})
export class SetTagsComponent implements OnInit {
	@Input() public allowCreate = false;
	@Input() public initialTags: string[] = [];
	@Output() public tagsChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

	public ready = false;
	public selectedTags: Tag[] = [];
	public tags: string[];

	constructor(
		private $cdr: ChangeDetectorRef,
		private $tag: TagService,
	) {
		this.$tag.getTagNames().then(_tags => this.tags = _tags);
	}

	public toggleTag(tag: Tag[]): void {
		this.tagsChanged.emit(this.selectedTags.map(item => item.value));
	}

	public ngOnInit() {
		const id = setInterval(() => {
			if (this.initialTags) {
				this.selectedTags = this.initialTags.map(tag => new Tag(tag));
				this.ready = true;
				clearInterval(id);
			}
		}, 100);
	}
}
