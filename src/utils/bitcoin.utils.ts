import * as bitcoin from 'bitcoinjs-lib';
import { NetworkType } from '../types';
import { BitcoinError } from './errors';

/**
 * Bitcoin utility functions
 */
export class BitcoinUtils {
  /**
   * Converts network type to bitcoinjs-lib network object
   */
  static getNetwork(networkType: NetworkType): bitcoin.networks.Network {
    switch (networkType) {
      case 'mainnet':
        return bitcoin.networks.bitcoin;
      case 'testnet':
        return bitcoin.networks.testnet;
      default:
        throw new BitcoinError(`Unsupported network type: ${networkType}`);
    }
  }

  /**
   * Validates a Bitcoin address
   */
  static validateAddress(address: string, networkType: NetworkType): boolean {
    try {
      const network = this.getNetwork(networkType);
      bitcoin.address.toOutputScript(address, network);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Converts satoshis to BTC
   */
  static satoshisToBTC(satoshis: number): number {
    return satoshis / 100000000;
  }

  /**
   * Converts BTC to satoshis
   */
  static btcToSatoshis(btc: number): number {
    return Math.round(btc * 100000000);
  }

  /**
   * Formats satoshis as BTC string
   */
  static formatBTC(satoshis: number): string {
    return (satoshis / 100000000).toFixed(8);
  }

  /**
   * Calculates transaction size in bytes
   */
  static calculateTransactionSize(inputCount: number, outputCount: number): number {
    // Rough estimation
    const inputSize = inputCount * 68;
    const outputSize = outputCount * 31;
    const overhead = 10;
    return inputSize + outputSize + overhead;
  }

  /**
   * Calculates transaction fee
   */
  static calculateFee(inputCount: number, outputCount: number, feeRate: number): number {
    const size = this.calculateTransactionSize(inputCount, outputCount);
    return size * feeRate;
  }
} 