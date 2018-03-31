export enum ConfirmationStatusState {
	PENDING,
	CONFIRMED,
	FAILED,
	ERROR
}
export type ConfirmationResponse = { internalId: string; address: string; };

export interface ContractCharityEvent {
	metaStorageHash?: string;
	name: string;
	address?: string;
	target: string;
	payed: string;
	tags: string;
}


export interface AppCharityEvent extends ContractCharityEvent {
	internalId?: string;
	raised?: string;
	confirmation: ConfirmationStatusState;
	attachments?: any[];
	image: any;
	description: string;
}

export interface ContractIncomingDonation {
	realWorldsIdentifier: string;
	address?: string;
	amount: string;
	note: string;
	sourceId: string;
	tags: string;
}

export interface AppIncomingDonation extends ContractIncomingDonation {
	internalId?: string;
	confirmation: ConfirmationStatusState;
}

export enum MetaStorageDataType {
	ORGANIZATION,
	CHARITY_EVENT,
	INCOMING_DONATION,
	FILE,
}

export interface MetaStorageData {
	type: MetaStorageDataType;
	searchDescription: string;
	data: any;
}

export type MetaStorageFile = {
	name: string;
	size: number;
	type: string;
	storageHash: string;
};

export interface CharityEventMetaStorageData {
	description: string;
	image: MetaStorageFile;
	attachments: MetaStorageFile[];
}

export type AlertMessage = {
	title: string,
	message: string
};

