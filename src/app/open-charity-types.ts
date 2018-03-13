export enum ConfirmationStatusState {
	PENDING,
	CONFIRMED,
	FAILED,
	ERROR
}
export type ConfirmationResponse = { internalId: string; address: string; }

export interface ContractCharityEvent {
	metaStorageHash?: string;
	name: string;
	address?: string;
	target: string;
	payed: string;
	tags: string;
}


export interface AppCharityEvent extends ContractCharityEvent{
	internalId?: string;
	raised?: string;
	confirmation: ConfirmationStatusState;
	attachments?: any[],
	image: any;
	description: string;
}

export interface ContractIncomingDonation {
	realWorldsIdentifier: string;
	address?: string;
	amount: string;
	note: string;
	tags: string;
}

export interface AppIncomingDonation extends ContractIncomingDonation {
	internalId?: string;
	confirmation: ConfirmationStatusState;
}


export interface MetaStorageData {
	type: string;
	searchDescription: string;
	data: any;
}

export type MetaStorageFile = {
	name: string;
	size: number;
	storageHash: string;
}

export interface CharityEventMetaStorageData {
	description: string;
	image: MetaStorageFile;
	attachments: MetaStorageFile[]
}

