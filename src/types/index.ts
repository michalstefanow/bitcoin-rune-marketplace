/// <reference types="node" />

// Core Bitcoin and UTXO types
export interface IUtxo {
  txid: string;
  vout: number;
  value: number;
  status?: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

// Wallet configuration types
export interface IWalletConfig {
  networkType: 'mainnet' | 'testnet';
  seed?: string;
  privateKey?: string;
}

export interface ISeedWalletConfig extends IWalletConfig {
  seed: string;
}

export interface IWIFWalletConfig extends IWalletConfig {
  privateKey: string;
}

// Network configuration
export interface INetworkConfig {
  networkType: 'mainnet' | 'testnet';
  mempoolBaseUrl: string;
  feeRate: number;
}

// Transaction types
export interface ITransactionConfig {
  feeRate: number;
  changeAddress: string;
  dustLimit: number;
}

// Rune and Ordinal types
export interface IRuneConfig {
  name: string;
  symbol: string;
  supply: number;
  terms?: {
    amount: number;
    cap: number;
    startHeight?: number;
    endHeight?: number;
  };
}

export interface IInscriptionConfig {
  contentType: string;
  content: Buffer | string;
  metadata?: Record<string, any>;
}

// API Response types
export interface IMempoolResponse<T> {
  data: T;
  status: number;
}

export interface ITransactionResponse {
  txid: string;
  status: 'success' | 'error';
  message?: string;
}

// Error types
export interface IAppError extends Error {
  code: string;
  details?: any;
}

// Utility types
export type NetworkType = 'mainnet' | 'testnet';
export type WalletType = 'seed' | 'wif'; 