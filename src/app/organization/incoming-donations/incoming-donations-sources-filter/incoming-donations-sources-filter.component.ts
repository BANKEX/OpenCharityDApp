import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OrganizationContractService} from '../../../core/contracts-services/organization-contract.service';

@Component({
	selector: 'opc-incoming-donations-sources-filter',
	templateUrl: 'incoming-donations-sources-filter.component.html',
	styleUrls: ['incoming-donations-sources-filter.component.scss']
})
export class IncomingDonationsSourcesFilterComponent implements OnInit {
	@Input('organizationAddress') organizationAddress: string;
	@Output('sourceChanged') sourceChanged: EventEmitter<number> = new EventEmitter<number>();

	public selectedSource: number = -1;
	public sourcesNamesList: string[] = [];
	public newSourceFormVisible: boolean = false;

	constructor(
		private organizationContractService: OrganizationContractService
	) {

	}

	ngOnInit() {
		this.updateListOfSources();

	}

	public async updateListOfSources(): Promise<void>  {
		const sourceIds: number = parseInt(await this.organizationContractService.getIncomingDonationsSourcesIds(this.organizationAddress));

		for (let i = 0; i < sourceIds; i++) {
			this.sourcesNamesList[i] = await this.organizationContractService.getIncomingDonationSourceName(this.organizationAddress, i);
		}
	}

	public changeSourceTab(sourceId: number) {
		this.selectedSource = sourceId;
		this.sourceChanged.emit(sourceId);
	}

	public async showNewSourceForm() {
		this.newSourceFormVisible = true;
	}

	public async submitNewSourceForm(newSourceName: string): Promise<void> {
		if (!newSourceName) {return;}
		await this.organizationContractService.addNewIncomingDonationsSource(this.organizationAddress, newSourceName);
		this.newSourceFormVisible = false;
	}

	public cancelNewSourceForm() {
		this.newSourceFormVisible = false;
	}
}
