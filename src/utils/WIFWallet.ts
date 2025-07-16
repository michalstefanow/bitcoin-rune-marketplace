import * as bitcoin from "bitcoinjs-lib";
import { initEccLib, networks } from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import ECPairFactory, { type ECPairInterface } from "ecpair";
import dotenv from "dotenv";
import { IWIFWalletConfig, NetworkType } from '../types';
import { WalletError } from './errors';

dotenv.config();
initEccLib(ecc);

const ECPair = ECPairFactory(ecc);

/**
 * Bitcoin wallet implementation using WIF (Wallet Import Format) private key
 */
export class WIFWallet {
  private readonly network: bitcoin.networks.Network;
  public readonly ecPair: ECPairInterface;
  public readonly address: string;
  public readonly output: Buffer;
  public readonly publicKey: string;

  constructor(config: IWIFWalletConfig) {
    this.network = this.getNetwork(config.networkType);
    
    if (!config.privateKey) {
      throw new WalletError('Private key is required for WIFWallet');
    }

    try {
      this.ecPair = ECPair.fromWIF(config.privateKey, this.network);

      const { address, output } = bitcoin.payments.p2tr({
        internalPubkey: this.ecPair.publicKey.subarray(1, 33),
        network: this.network,
      });

      if (!address || !output) {
        throw new WalletError('Failed to generate Taproot address');
      }

      this.address = address;
      this.output = output;
      this.publicKey = this.ecPair.publicKey.toString("hex");
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      throw new WalletError(`Failed to initialize WIF wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Signs a PSBT (Partially Signed Bitcoin Transaction)
   */
  signPsbt(psbt: bitcoin.Psbt, ecPair: ECPairInterface): bitcoin.Psbt {
    try {
      const tweakedChildNode = ecPair.tweak(
        bitcoin.crypto.taggedHash("TapTweak", ecPair.publicKey.subarray(1, 33))
      );

      for (let i = 0; i < psbt.inputCount; i++) {
        psbt.signInput(i, tweakedChildNode);
        psbt.validateSignaturesOfInput(i, () => true);
        psbt.finalizeInput(i);
      }

      return psbt;
    } catch (error) {
      throw new WalletError(`Failed to sign PSBT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the wallet's public key as a Buffer
   */
  getPublicKeyBuffer(): Buffer {
    return this.ecPair.publicKey;
  }

  /**
   * Gets the wallet's private key as a hex string
   */
  getPrivateKeyHex(): string {
    return this.ecPair.privateKey?.toString('hex') || '';
  }

  /**
   * Gets the wallet's private key in WIF format
   */
  getPrivateKeyWIF(): string {
    return this.ecPair.toWIF();
  }

  /**
   * Validates if the wallet has a private key
   */
  hasPrivateKey(): boolean {
    return !!this.ecPair.privateKey;
  }

  /**
   * Gets the network configuration for the wallet
   */
  getNetworkConfig(): bitcoin.networks.Network {
    return this.network;
  }

  /**
   * Converts network type to bitcoinjs-lib network object
   */
  private getNetwork(networkType: NetworkType): bitcoin.networks.Network {
    switch (networkType) {
      case 'mainnet':
        return networks.bitcoin;
      case 'testnet':
        return networks.testnet;
      default:
        throw new WalletError(`Unsupported network type: ${networkType}`);
    }
  }
} 