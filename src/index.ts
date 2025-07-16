/**
 * Rune Ordinals Toolbox - Bitcoin UTXO Management and Rune/Ordinals Toolbox
 * 
 * A comprehensive TypeScript library for managing Bitcoin UTXOs, creating Runes,
 * and working with Bitcoin Ordinals using bitcoinjs-lib.
 */

// Core exports
export * from './types';
export * from './utils/errors';
export * from './utils/constants';

// Wallet exports
export { SeedWallet } from './utils/SeedWallet';
export { WIFWallet } from './utils/WIFWallet';

// API exports
export { MempoolClient, mempoolClient } from './utils/mempool';

// Configuration exports
export { networkConfig } from './config/network.config';

// Service exports
export * from './services/utxo.service';
export * from './services/rune.service';
export * from './services/ordinal.service';

// Controller exports
export * from './controllers/utxo.controller';

// Utility exports
export * from './utils/bitcoin.utils';
export * from './utils/validation.utils';

// Version information
export const VERSION = '2.0.0';
export const LIBRARY_NAME = 'Rune Ordinals Toolbox';

/**
 * Library initialization function
 */
export function initializeLibrary(): void {
  console.log(`${LIBRARY_NAME} v${VERSION} initialized`);
}

// Auto-initialize when imported
initializeLibrary(); 