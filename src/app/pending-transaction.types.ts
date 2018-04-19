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

export type PendingTransaction = {
  internalId: string;
  time: string;
  title: string;
  text: string;
  state: PendingTransactionState;
  source: PendingTransactionSourceType;
};
