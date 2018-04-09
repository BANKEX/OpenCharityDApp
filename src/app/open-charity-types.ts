/* tslint:disable */

export enum ConfirmationStatusState {
	PENDING,
	CONFIRMED,
	FAILED,
	ERROR
}

export enum SortBy {
	NAME = 'name',
	DATE = 'date',
	RASED = 'raised',
}

export interface ConfirmationResponse { internalId: string; address: string; }

export interface ConfirmationResponseWithTxHash extends ConfirmationResponse {
	txHash: string; // hash address of running transaction
}

export interface ContractCharityEvent {
	address?: string;
	date?: Date;
	metaStorageHash?: string;
	name: string;
	payed: string;
	tags: string;
	target: string;
}


export interface AppCharityEvent extends ContractCharityEvent {

	attachments?: any[];
	confirmation: ConfirmationStatusState;
	description: string;
	image: any;
	internalId?: string;
	raised?: string | number;
}

export interface ContractIncomingDonation {
	address?: string;
	date?: Date;
	amount: string;
	movedFunds?: string
	note: string;
	realWorldsIdentifier: string;
	sourceId: string;
	sourceName?: string;
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
	data: CharityEventMetaStorageData;
}

export type MetaStorageFile = {
	name: string;
	size: number;
	type: string;
	storageHash: string;
};

export interface CharityEventMetaStorageData {
	title?: string,
	description: string;
	image?: MetaStorageFile;
	attachments?: MetaStorageFile[];
}

export interface SortParams {
	by?: SortBy,
	reverse?: boolean
}

export type AlertMessage = {
	title: string,
	message: string
};

export interface FundsMovedToCharityEvent {
	incomingDonation: string;
	charityEvent: string;
	sender: string;
	amount: string;
}

export interface IncomingDonationTransaction {
	date?: string;
	amount: string;
	transactionHash?: string;
	charityEvent: string;
	sender?: string;
	confirmation: ConfirmationStatusState;
}

export type loadingOverlayConfig = {
	showOverlay: boolean,
	transparent: boolean
};
