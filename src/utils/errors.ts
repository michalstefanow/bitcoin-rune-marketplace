import { IAppError } from '../types';

/**
 * Base application error class
 */
export class AppError extends Error implements IAppError {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Bitcoin network related errors
 */
export class BitcoinError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'BITCOIN_ERROR', details);
    this.name = 'BitcoinError';
  }
}

/**
 * Wallet related errors
 */
export class WalletError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'WALLET_ERROR', details);
    this.name = 'WalletError';
  }
}

/**
 * UTXO related errors
 */
export class UTXOError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'UTXO_ERROR', details);
    this.name = 'UTXOError';
  }
}

/**
 * API related errors
 */
export class APIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

/**
 * Configuration related errors
 */
export class ConfigError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

/**
 * Rune/Ordinal related errors
 */
export class RuneError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'RUNE_ERROR', details);
    this.name = 'RuneError';
  }
}

/**
 * Error codes enumeration
 */
export const ErrorCodes = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_PRIVATE_KEY: 'INVALID_PRIVATE_KEY',
  INVALID_MNEMONIC: 'INVALID_MNEMONIC',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  UTXO_NOT_FOUND: 'UTXO_NOT_FOUND',
  INVALID_FEE_RATE: 'INVALID_FEE_RATE',
  CONFIG_MISSING: 'CONFIG_MISSING',
  UNSUPPORTED_NETWORK: 'UNSUPPORTED_NETWORK',
} as const;

/**
 * Error message templates
 */
export const ErrorMessages = {
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds for transaction',
  [ErrorCodes.INVALID_ADDRESS]: 'Invalid Bitcoin address provided',
  [ErrorCodes.INVALID_PRIVATE_KEY]: 'Invalid private key format',
  [ErrorCodes.INVALID_MNEMONIC]: 'Invalid mnemonic phrase',
  [ErrorCodes.NETWORK_ERROR]: 'Network request failed',
  [ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed to broadcast',
  [ErrorCodes.UTXO_NOT_FOUND]: 'UTXO not found for address',
  [ErrorCodes.INVALID_FEE_RATE]: 'Invalid fee rate provided',
  [ErrorCodes.CONFIG_MISSING]: 'Required configuration missing',
  [ErrorCodes.UNSUPPORTED_NETWORK]: 'Unsupported network type',
} as const; 