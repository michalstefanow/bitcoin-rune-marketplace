import axios, { type AxiosError, type AxiosResponse } from "axios";
import { IUtxo, IMempoolResponse } from '../types';
import { APIError, APIError as NetworkError } from './errors';
import { API_CONSTANTS, RETRY_PATTERNS } from './constants';
import { networkConfig } from '../config/network.config';

/**
 * Mempool API client for Bitcoin network interactions
 */
export class MempoolClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = networkConfig.getMempoolBaseUrl();
    this.timeout = API_CONSTANTS.TIMEOUT;
  }

  /**
   * Fetches the script pubkey for a specific transaction output
   */
  async getScriptPubkey(txid: string, address: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/tx/${txid}`;
      const response: AxiosResponse = await axios.get(url, { timeout: this.timeout });
      
      const output = response.data.vout.find((output: any) => 
        output.scriptpubkey_address === address
      );
      
      if (!output) {
        throw new APIError(`Script pubkey not found for address ${address} in transaction ${txid}`);
      }
      
      return output.scriptpubkey;
    } catch (error) {
      this.handleApiError(error, 'getScriptPubkey');
    }
  }

  /**
   * Retrieves all UTXOs for a given Bitcoin address
   */
  async getUtxos(address: string): Promise<IUtxo[]> {
    try {
      const url = `${this.baseUrl}/address/${address}/utxo`;
      const response: AxiosResponse = await axios.get(url, { timeout: this.timeout });
      
      return response.data.map((utxoData: any): IUtxo => ({
        txid: utxoData.txid,
        vout: utxoData.vout,
        value: utxoData.value,
        status: utxoData.status,
      }));
    } catch (error) {
      this.handleApiError(error, 'getUtxos');
    }
  }

  /**
   * Broadcasts a raw transaction to the Bitcoin network
   */
  async pushTransaction(rawTx: string): Promise<string> {
    try {
      const txid = await this.postData(`${this.baseUrl}/tx`, rawTx);
      if (!txid) {
        throw new APIError('Failed to broadcast transaction');
      }
      return txid;
    } catch (error) {
      this.handleApiError(error, 'pushTransaction');
    }
  }

  /**
   * Gets transaction details by transaction ID
   */
  async getTransaction(txid: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/tx/${txid}`;
      const response: AxiosResponse = await axios.get(url, { timeout: this.timeout });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'getTransaction');
    }
  }

  /**
   * Gets transaction hex by transaction ID
   */
  async getTransactionHex(txid: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/tx/${txid}/hex`;
      const response: AxiosResponse = await axios.get(url, { timeout: this.timeout });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'getTransactionHex');
    }
  }

  /**
   * Waits for UTXOs to appear at a given address
   */
  async waitForUtxos(address: string, timeoutMs: number = 300000): Promise<IUtxo[]> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const utxos = await this.getUtxos(address);
        if (utxos.length > 0) {
          return utxos;
        }
      } catch (error) {
        // Continue waiting on error
      }
      
      await this.delay(5000); // Wait 5 seconds before next check
    }
    
    throw new APIError(`Timeout waiting for UTXOs at address ${address}`);
  }

  /**
   * Internal method to handle POST requests with retry logic
   */
  private async postData(
    url: string,
    data: any,
    contentType: string = "text/plain",
    apiKey?: string
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= API_CONSTANTS.MAX_RETRIES; attempt++) {
      try {
        const headers: Record<string, string> = {};
        if (contentType) headers["Content-Type"] = contentType;
        if (apiKey) headers["X-Api-Key"] = apiKey;

        const response: AxiosResponse = await axios.post(url, data, {
          headers,
          timeout: this.timeout,
        });

        return response.data as string;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;
        
        // Check if this is a retryable error
        if (this.isRetryableError(axiosError)) {
          if (attempt < API_CONSTANTS.MAX_RETRIES) {
            await this.delay(API_CONSTANTS.RETRY_DELAY * attempt);
            continue;
          }
        }
        
        // If not retryable or max retries reached, throw immediately
        break;
      }
    }
    
    throw new APIError(
      `Failed to post data after ${API_CONSTANTS.MAX_RETRIES} attempts`,
      { originalError: lastError }
    );
  }

  /**
   * Determines if an error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    const errorMessage = error.response?.data as string || error.message;
    
    // Retry on mempool chain errors
    if (errorMessage.includes(RETRY_PATTERNS.MEMPOOL_CHAIN_ERROR)) {
      return true;
    }
    
    // Retry on network errors
    if (error.code === RETRY_PATTERNS.NETWORK_ERROR || 
        error.code === RETRY_PATTERNS.TIMEOUT_ERROR) {
      return true;
    }
    
    // Retry on 5xx server errors
    if (error.response?.status && error.response.status >= 500) {
      return true;
    }
    
    return false;
  }

  /**
   * Handles API errors with proper error wrapping
   */
  private handleApiError(error: any, operation: string): never {
    if (error instanceof APIError) {
      throw error;
    }
    
    const axiosError = error as AxiosError;
    const message = `API operation '${operation}' failed`;
    const details = {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      originalError: axiosError,
    };
    
    throw new APIError(message, details);
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mempoolClient = new MempoolClient();

// Export legacy functions for backward compatibility
export const getScriptPubkey = (tx: string, address: string, networkType: string): Promise<string> => {
  return mempoolClient.getScriptPubkey(tx, address);
};

export const getUtxos = (address: string, networkType: string): Promise<IUtxo[]> => {
  return mempoolClient.getUtxos(address);
};

export const pushBTCpmt = (rawtx: string, networkType: string): Promise<string> => {
  return mempoolClient.pushTransaction(rawtx);
}; 