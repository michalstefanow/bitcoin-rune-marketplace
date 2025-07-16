import * as bitcoin from 'bitcoinjs-lib';
import { IUtxo, NetworkType } from '../types';
import { UTXOError, BitcoinError } from '../utils/errors';
import { BITCOIN_CONSTANTS } from '../utils/constants';
import { utxoService } from '../services/utxo.service';

/**
 * Controller for UTXO operations
 */
export class UTXOController {
  private readonly network: bitcoin.networks.Network;

  constructor(networkType: NetworkType = 'testnet') {
    this.network = this.getNetwork(networkType);
  }

  /**
   * Creates a PSBT for redeeming UTXOs
   */
  createRedeemPsbt(wallet: any, utxo: IUtxo): bitcoin.Psbt {
    try {
      const psbt = new bitcoin.Psbt({ network: this.network });

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          value: utxo.value,
          script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
      });

      psbt.addOutput({
        address: wallet.address,
        value: utxo.value - BITCOIN_CONSTANTS.UTXO.DEFAULT_CHANGE_SIZE,
      });

      return psbt;
    } catch (error) {
      throw new UTXOError(`Failed to create redeem PSBT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a PSBT for sending UTXOs
   */
  createSendPsbt(wallet: any, utxo: IUtxo, fee: number, recipientAddress: string): bitcoin.Psbt {
    try {
      const psbt = new bitcoin.Psbt({ network: this.network });

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          value: utxo.value,
          script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
      });

      psbt.addOutput({
        address: recipientAddress,
        value: utxo.value - fee,
      });

      return psbt;
    } catch (error) {
      throw new UTXOError(`Failed to create send PSBT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a PSBT for merging UTXOs
   */
  createMergePsbt(wallet: any, utxos: IUtxo[], changeAddress: string): bitcoin.Psbt {
    try {
      const psbt = new bitcoin.Psbt({ network: this.network });
      const totalValue = utxos.reduce((sum, utxo) => sum + utxo.value, 0);

      // Add all UTXOs as inputs
      for (const utxo of utxos) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: utxo.value,
            script: wallet.output,
          },
          tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
      }

      // Add single output for merged UTXO
      psbt.addOutput({
        address: changeAddress,
        value: totalValue - BITCOIN_CONSTANTS.UTXO.DEFAULT_CHANGE_SIZE,
      });

      return psbt;
    } catch (error) {
      throw new UTXOError(`Failed to create merge PSBT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a PSBT for splitting UTXOs
   */
  createSplitPsbt(wallet: any, utxo: IUtxo, splitCount: number, changeAddress: string): bitcoin.Psbt {
    try {
      if (splitCount <= 0 || splitCount > BITCOIN_CONSTANTS.UTXO.MAX_SPLIT_COUNT) {
        throw new UTXOError(`Invalid split count: ${splitCount}`);
      }

      const psbt = new bitcoin.Psbt({ network: this.network });
      const splitValue = Math.floor(utxo.value / splitCount);
      const fee = BITCOIN_CONSTANTS.UTXO.DEFAULT_CHANGE_SIZE;

      if (splitValue < BITCOIN_CONSTANTS.DUST_LIMIT) {
        throw new UTXOError(`Split value ${splitValue} is below dust limit ${BITCOIN_CONSTANTS.DUST_LIMIT}`);
      }

      // Add input
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          value: utxo.value,
          script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
      });

      // Add split outputs
      for (let i = 0; i < splitCount; i++) {
        psbt.addOutput({
          address: changeAddress,
          value: splitValue,
        });
      }

      // Add change output if needed
      const remainingValue = utxo.value - (splitValue * splitCount) - fee;
      if (remainingValue >= BITCOIN_CONSTANTS.DUST_LIMIT) {
        psbt.addOutput({
          address: changeAddress,
          value: remainingValue,
        });
      }

      return psbt;
    } catch (error) {
      throw new UTXOError(`Failed to create split PSBT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
export const utxoController = new UTXOController(); 