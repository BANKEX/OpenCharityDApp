export enum ConfirmationStatusState {
	PENDING,
	CONFIRMED,
	FAILED,
	ERROR
}

export interface ContractCharityEvent {
	name: string;
	address: string;
	target: string;
	payed: string;
	tags: string;
}


export interface AppCharityEvent extends ContractCharityEvent{
	raised?: string;
	confirmation: ConfirmationStatusState;
}

export interface ContractIncomingDonation {
	realWorldsIdentifier: string;
	address?: string;
	amount: string;
	note: string;
	tags: string;
}

export interface AppIncomingDonation extends ContractIncomingDonation {
	confirmation: ConfirmationStatusState;
}
