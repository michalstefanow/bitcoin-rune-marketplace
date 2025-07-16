import * as bitcoin from 'bitcoinjs-lib';
import { IUtxo, ITransactionConfig, NetworkType } from '../types';
import { UTXOError, BitcoinError } from '../utils/errors';
import { BITCOIN_CONSTANTS } from '../utils/constants';
import { mempoolClient } from '../utils/mempool';
import { networkConfig } from '../config/network.config';

/**
 * Service for managing Bitcoin UTXOs
 */
export class UTXOService {
  private readonly network: bitcoin.networks.Network;
  private readonly networkType: NetworkType;

  constructor(networkType: NetworkType = 'testnet') {
    this.networkType = networkType;
    this.network = this.getNetwork(networkType);
  }

  /**
   * Gets all UTXOs for a given address
   */
  async getUtxos(address: string): Promise<IUtxo[]> {
    try {
      return await mempoolClient.getUtxos(address);
    } catch (error) {
      throw new UTXOError(`Failed to get UTXOs for address ${address}`, { originalError: error });
    }
  }

  /**
   * Finds UTXOs with sufficient balance for a transaction
   */
  async findUtxosForAmount(address: string, amount: number, feeRate: number = BITCOIN_CONSTANTS.FEE_RATES.MEDIUM): Promise<{
    utxos: IUtxo[];
    totalValue: number;
    estimatedFee: number;
  }> {
    const utxos = await this.getUtxos(address);
    
    if (utxos.length === 0) {
      throw new UTXOError(`No UTXOs found for address ${address}`);
    }

    // Sort UTXOs by value (largest first for efficiency)
    const sortedUtxos = utxos.sort((a, b) => b.value - a.value);
    
    let totalValue = 0;
    const selectedUtxos: IUtxo[] = [];
    
    for (const utxo of sortedUtxos) {
      selectedUtxos.push(utxo);
      totalValue += utxo.value;
      
      // Estimate fee for current selection
      const estimatedFee = this.estimateTransactionFee(selectedUtxos, 2, feeRate); // 2 outputs: recipient + change
      
      if (totalValue >= amount + estimatedFee) {
        return {
          utxos: selectedUtxos,
          totalValue,
          estimatedFee,
        };
      }
    }
    
    throw new UTXOError(`Insufficient funds. Required: ${amount}, Available: ${totalValue}`);
  }

  /**
   * Estimates transaction fee based on UTXOs and outputs
   */
  estimateTransactionFee(utxos: IUtxo[], outputCount: number, feeRate: number): number {
    // Rough estimation: 1 input = ~68 bytes, 1 output = ~31 bytes
    const inputSize = utxos.length * 68;
    const outputSize = outputCount * 31;
    const overhead = 10; // Transaction overhead
    
    const totalSize = inputSize + outputSize + overhead;
    return totalSize * feeRate;
  }

  /**
   * Validates UTXO data
   */
  validateUtxo(utxo: IUtxo): boolean {
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
   * Filters UTXOs by minimum value
   */
  filterUtxosByMinValue(utxos: IUtxo[], minValue: number): IUtxo[] {
    return utxos.filter(utxo => utxo.value >= minValue);
  }

  /**
   * Groups UTXOs by value ranges
   */
  groupUtxosByValue(utxos: IUtxo[]): {
    small: IUtxo[];
    medium: IUtxo[];
    large: IUtxo[];
  } {
    const small: IUtxo[] = [];
    const medium: IUtxo[] = [];
    const large: IUtxo[] = [];
    
    const smallThreshold = 1000; // 1000 sats
    const largeThreshold = 100000; // 100,000 sats
    
    for (const utxo of utxos) {
      if (utxo.value < smallThreshold) {
        small.push(utxo);
      } else if (utxo.value < largeThreshold) {
        medium.push(utxo);
      } else {
        large.push(utxo);
      }
    }
    
    return { small, medium, large };
  }

  /**
   * Calculates total balance from UTXOs
   */
  calculateTotalBalance(utxos: IUtxo[]): number {
    return utxos.reduce((total, utxo) => total + utxo.value, 0);
  }

  /**
   * Gets confirmed UTXOs only
   */
  getConfirmedUtxos(utxos: IUtxo[]): IUtxo[] {
    return utxos.filter(utxo => utxo.status?.confirmed === true);
  }

  /**
   * Gets unconfirmed UTXOs only
   */
  getUnconfirmedUtxos(utxos: IUtxo[]): IUtxo[] {
    return utxos.filter(utxo => !utxo.status?.confirmed);
  }

  /**
   * Converts network type to bitcoinjs-lib network object
   */
  private getNetwork(networkType: NetworkType): bitcoin.networks.Network {
    switch (networkType) {
      case 'mainnet':
        return bitcoin.networks.bitcoin;
      case 'testnet':
        return bitcoin.networks.testnet;
      default:
        throw new BitcoinError(`Unsupported network type: ${networkType}`);
    }
  }
}

// Export singleton instance
export const utxoService = new UTXOService(); 