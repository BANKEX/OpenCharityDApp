export enum PendingTransactionSourceType {
  CE,
  ID,
  COMMON
}

export enum PendingTransactionState {
  PENDING,
  CONFIRMED,
  FAILED
}

export interface PendingTransaction {
  id: number;
  title: string;
  text: string;
  state: PendingTransactionState;
  source: PendingTransactionSourceType;
}
