import * as bitcoin from "bitcoinjs-lib";
import { initEccLib, networks } from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import * as bip39 from "bip39";
import BIP32Factory, { type BIP32Interface } from "bip32";
import ECPairFactory, { type ECPairInterface } from "ecpair";
import dotenv from "dotenv";
import { ISeedWalletConfig, NetworkType } from '../types';
import { WalletError } from './errors';
import { WALLET_CONSTANTS } from './constants';

dotenv.config();
initEccLib(ecc);

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

/**
 * Bitcoin wallet implementation using BIP39 mnemonic seed
 */
export class SeedWallet {
  private readonly hdPath: string;
  private readonly network: bitcoin.networks.Network;
  public readonly ecPair: ECPairInterface;
  public readonly address: string;
  public readonly output: Buffer;
  public readonly publicKey: string;
  private readonly bip32: BIP32Interface;

  constructor(config: ISeedWalletConfig) {
    this.hdPath = WALLET_CONSTANTS.HD_PATH;
    this.network = this.getNetwork(config.networkType);
    
    if (!config.seed) {
      throw new WalletError('Seed is required for SeedWallet');
    }

    if (!bip39.validateMnemonic(config.seed)) {
      throw new WalletError('Invalid mnemonic phrase provided');
    }

    try {
      this.bip32 = bip32.fromSeed(
        bip39.mnemonicToSeedSync(config.seed),
        this.network
      );

      const derivedNode = this.bip32.derivePath(this.hdPath);
      if (!derivedNode.privateKey) {
        throw new WalletError('Failed to derive private key from seed');
      }

      this.ecPair = ECPair.fromPrivateKey(derivedNode.privateKey, {
        network: this.network,
      });

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
      throw new WalletError(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Gets the derivation path used by this wallet
   */
  getDerivationPath(): string {
    return this.hdPath;
  }

  /**
   * Creates a new wallet instance with a different derivation path
   */
  deriveWallet(derivationPath: string): SeedWallet {
    // This would require access to the original seed, which we don't store
    // For security reasons, we don't store the seed in the class
    throw new WalletError('Cannot derive new wallet without original seed');
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