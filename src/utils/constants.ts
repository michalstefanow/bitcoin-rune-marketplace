/**
 * Bitcoin network constants
 */
export const BITCOIN_CONSTANTS = {
  // Dust limit in satoshis
  DUST_LIMIT: 546,
  
  // Standard transaction fee rates (sat/vB)
  FEE_RATES: {
    LOW: 1,
    MEDIUM: 10,
    HIGH: 50,
    URGENT: 100,
  },
  
  // UTXO management constants
  UTXO: {
    MIN_SPLIT_SIZE: 1000,
    MAX_SPLIT_COUNT: 100,
    DEFAULT_CHANGE_SIZE: 546,
  },
  
  // Transaction constants
  TRANSACTION: {
    MAX_INPUTS: 1000,
    MAX_OUTPUTS: 1000,
    MAX_SIZE: 1000000, // 1MB
  },
  
  // Rune constants
  RUNE: {
    MIN_NAME_LENGTH: 1,
    MAX_NAME_LENGTH: 28,
    DEFAULT_SUPPLY: 1000000,
    DEFAULT_DECIMALS: 0,
  },
  
  // Ordinal constants
  ORDINAL: {
    MIN_INSCRIPTION_SIZE: 1,
    MAX_INSCRIPTION_SIZE: 400000, // 400KB
    DEFAULT_FEE: 1000,
  },
} as const;

/**
 * Network-specific constants
 */
export const NETWORK_CONSTANTS = {
  testnet: {
    EXPLORER_BASE_URL: 'https://mempool.space/testnet',
    DEFAULT_FEE_RATE: 20,
    CONFIRMATION_BLOCKS: 1,
  },
  mainnet: {
    EXPLORER_BASE_URL: 'https://mempool.space',
    DEFAULT_FEE_RATE: 10,
    CONFIRMATION_BLOCKS: 6,
  },
} as const;

/**
 * API constants
 */
export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RATE_LIMIT_DELAY: 100, // 100ms between requests
} as const;

/**
 * Wallet constants
 */
export const WALLET_CONSTANTS = {
  HD_PATH: "m/86'/0'/0'/0/0", // Taproot derivation path
  MNEMONIC_LENGTH: 12, // 12 words for 128-bit entropy
  PRIVATE_KEY_LENGTH: 64, // 32 bytes in hex
} as const;

/**
 * File and content type constants
 */
export const CONTENT_TYPES = {
  TEXT: 'text/plain;charset=utf-8',
  HTML: 'text/html;charset=utf-8',
  JSON: 'application/json',
  IMAGE_PNG: 'image/png',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp',
} as const;

/**
 * Error retry patterns
 */
export const RETRY_PATTERNS = {
  MEMPOOL_CHAIN_ERROR: 'too-long-mempool-chain',
  NETWORK_ERROR: 'ENOTFOUND',
  TIMEOUT_ERROR: 'ETIMEDOUT',
} as const; 