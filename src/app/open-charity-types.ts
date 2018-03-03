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
	description: string;
	image: string;
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
