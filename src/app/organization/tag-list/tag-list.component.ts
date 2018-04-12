import {Component, Input, OnInit} from '@angular/core';
import {TagService} from '../services/tag.service';

@Component({
	selector: 'opc-tag-list',
	templateUrl: 'tag-list.component.html',
	styleUrls: ['tag-list.component.scss']
})

export class TagListComponent implements OnInit {
	@Input('tags')
	public tags: number[] = [];
	public tagNames: string[] = [];

	constructor(private tagService: TagService) {}

	public async ngOnInit() {
		this.tagNames = await this.tagService.getTagNames(this.tags);
	}
}
