import { IUtxo, NetworkType } from '../types';
import { BitcoinUtils } from './bitcoin.utils';

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Validates UTXO data
   */
  static validateUtxo(utxo: IUtxo): boolean {
    if (!utxo.txid || typeof utxo.txid !== 'string') {
      return false;
    }
    
    if (typeof utxo.vout !== 'number' || utxo.vout < 0) {
      return false;
    }
    
    if (typeof utxo.value !== 'number' || utxo.value <= 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Validates Bitcoin address
   */
  static validateBitcoinAddress(address: string, networkType: NetworkType): boolean {
    return BitcoinUtils.validateAddress(address, networkType);
  }

  /**
   * Validates amount in satoshis
   */
  static validateAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0 && Number.isInteger(amount);
  }

  /**
   * Validates fee rate
   */
  static validateFeeRate(feeRate: number): boolean {
    return typeof feeRate === 'number' && feeRate > 0;
  }

  /**
   * Validates network type
   */
  static validateNetworkType(networkType: string): networkType is NetworkType {
    return networkType === 'mainnet' || networkType === 'testnet';
  }

  /**
   * Validates mnemonic phrase
   */
  static validateMnemonic(mnemonic: string): boolean {
    if (!mnemonic || typeof mnemonic !== 'string') {
      return false;
    }
    
    const words = mnemonic.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  }

  /**
   * Validates private key format
   */
  static validatePrivateKey(privateKey: string): boolean {
    if (!privateKey || typeof privateKey !== 'string') {
      return false;
    }
    
    // Check if it's a hex private key (64 characters)
    if (/^[0-9a-fA-F]{64}$/.test(privateKey)) {
      return true;
    }
    
    // Check if it's a WIF private key
    if (/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(privateKey)) {
      return true;
    }
    
    return false;
  }
} 