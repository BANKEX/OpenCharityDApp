import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Tag, TagsBitmaskService} from '../services/tags-bitmask.service';

@Component({
	selector: 'opc-set-bitmask-tags',
	templateUrl: 'set-bitmask-tags.component.html',
	styleUrls: ['set-bitmask-tags.component.scss']
})
export class SetBitmaskTagsComponent implements OnInit {
	@Input() public bitmask: number;
	@Input() public chosenTags: Array<Tag> = [];
	@Output() public bitmaskChanged: EventEmitter<number> = new EventEmitter<number>();

	public readonly tags = this.tagsBitmaskService.tags;

	constructor(private tagsBitmaskService: TagsBitmaskService) {

	}

	public ngOnInit() {}

	public toggleTag(tagValue: number): void {
		this.bitmask = this.tagsBitmaskService.toggleTag(this.bitmask, tagValue);
		this.bitmaskChanged.emit(this.bitmask);
	}

	public isSelectedTag(tagValue: number): boolean {
		return this.tagsBitmaskService.isSelectedTag(this.bitmask, tagValue);
	}
}
