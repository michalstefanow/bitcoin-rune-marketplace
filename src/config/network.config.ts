import { INetworkConfig, NetworkType } from '../types';

const NETWORK_CONFIGS: Record<NetworkType, INetworkConfig> = {
  mainnet: {
    networkType: 'mainnet',
    mempoolBaseUrl: 'https://mempool.space/api',
    feeRate: 10, // sat/vB
  },
  testnet: {
    networkType: 'testnet',
    mempoolBaseUrl: 'https://mempool.space/testnet/api',
    feeRate: 20, // sat/vB
  },
};

// Default to testnet for safety
const DEFAULT_NETWORK: NetworkType = 'testnet';

class NetworkConfigManager {
  private currentNetwork: NetworkType = DEFAULT_NETWORK;

  getNetworkConfig(): INetworkConfig {
    return NETWORK_CONFIGS[this.currentNetwork];
  }

  setNetwork(networkType: NetworkType): void {
    if (!NETWORK_CONFIGS[networkType]) {
      throw new Error(`Unsupported network type: ${networkType}`);
    }
    this.currentNetwork = networkType;
  }

  getCurrentNetwork(): NetworkType {
    return this.currentNetwork;
  }

  getMempoolBaseUrl(): string {
    return this.getNetworkConfig().mempoolBaseUrl;
  }

  getFeeRate(): number {
    return this.getNetworkConfig().feeRate;
  }
}

// Export singleton instance
export const networkConfig = new NetworkConfigManager();

// Export for backward compatibility
export default networkConfig; 