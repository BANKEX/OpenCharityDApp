/* tslint:disable */

export enum ConfirmationStatusState {
	PENDING,
	CONFIRMED,
	FAILED,
	ERROR
}
export interface ConfirmationResponse { internalId: string; address: string; }

export interface ConfirmationResponseWithTxHash extends ConfirmationResponse {
	txHash: string; // hash address of running transaction
}

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
