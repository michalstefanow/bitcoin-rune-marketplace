# Migration Guide: v1.0.0 to v2.0.0

This guide helps you migrate from the old project structure to the new optimized v2.0.0 structure.

## 🚀 Major Changes

### 1. Project Structure Reorganization

**Old Structure:**
```
/
├── UTXO_send.ts
├── UTXO_split.ts
├── UTXO_merge.ts
├── RUNE_etching.ts
├── utils/
│   ├── mempool.ts
│   ├── SeedWallet.ts
│   └── WIFWallet.ts
├── controller/
│   └── utxo.*.controller.ts
└── config/
    └── network.config.ts
```

**New Structure:**
```
src/
├── scripts/              # Executable scripts
│   ├── UTXO_send.ts
│   ├── UTXO_split.ts
│   ├── UTXO_merge.ts
│   └── RUNE_etching.ts
├── utils/                # Utility functions
│   ├── mempool.ts
│   ├── SeedWallet.ts
│   ├── WIFWallet.ts
│   ├── errors.ts         # NEW: Error handling
│   ├── constants.ts      # NEW: Constants
│   ├── bitcoin.utils.ts  # NEW: Bitcoin utilities
│   └── validation.utils.ts # NEW: Validation
├── services/             # NEW: Service layer
│   ├── utxo.service.ts
│   ├── rune.service.ts
│   └── ordinal.service.ts
├── controllers/          # Business logic
│   └── utxo.controller.ts
├── types/                # NEW: Type definitions
│   └── index.ts
├── config/               # Configuration
│   └── network.config.ts
└── index.ts              # NEW: Main entry point
```

### 2. Import Path Changes

**Old imports:**
```typescript
import networkConfig from "config/network.config";
import { getUtxos, pushBTCpmt } from "./utils/mempool";
import { SeedWallet } from "utils/SeedWallet";
```

**New imports:**
```typescript
import { networkConfig } from "rune-ordinals-toolbox";
import { mempoolClient } from "rune-ordinals-toolbox";
import { SeedWallet } from "rune-ordinals-toolbox";
```

### 3. API Changes

#### Mempool API

**Old:**
```typescript
const utxos = await getUtxos(address, networkType);
const txId = await pushBTCpmt(rawTx, networkType);
```

**New:**
```typescript
const utxos = await mempoolClient.getUtxos(address);
const txId = await mempoolClient.pushTransaction(rawTx);
```

#### Network Configuration

**Old:**
```typescript
const networkType: string = networkConfig.networkType;
```

**New:**
```typescript
const networkType = networkConfig.getCurrentNetwork();
const feeRate = networkConfig.getFeeRate();
```

#### Error Handling

**Old:**
```typescript
if (utxo === undefined) throw new Error("No btcs");
```

**New:**
```typescript
import { UTXOError } from "rune-ordinals-toolbox";

if (!utxo) {
  throw new UTXOError("No UTXOs found with sufficient balance");
}
```

## 📝 Migration Steps

### Step 1: Update Dependencies

```bash
# Remove old dependencies
npm uninstall ts-node

# Install new dependencies
npm install tsx rimraf @types/bip32 @types/bip39 @types/cbor
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser jest ts-jest
```

### Step 2: Update Scripts

**Old package.json scripts:**
```json
{
  "scripts": {
    "merge": "npx tsx UTXO_merge",
    "send": "npx tsx UTXO_send",
    "split": "npx tsx UTXO_split"
  }
}
```

**New package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "clean": "rimraf dist",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "test": "jest",
    "utxo:merge": "tsx src/scripts/UTXO_merge.ts",
    "utxo:send": "tsx src/scripts/UTXO_send.ts",
    "utxo:split": "tsx src/scripts/UTXO_split.ts"
  }
}
```

### Step 3: Move Files

```bash
# Create new directory structure
mkdir -p src/{scripts,utils,services,controllers,types,config}

# Move existing files
mv UTXO_*.ts src/scripts/
mv RUNE_*.ts src/scripts/
mv *.ts src/scripts/ # Move other script files
mv utils/* src/utils/
mv controller/* src/controllers/
mv config/* src/config/
```

### Step 4: Update Import Paths

Update all import statements in your scripts to use the new structure:

```typescript
// Old
import networkConfig from "config/network.config";
import { getUtxos, pushBTCpmt } from "./utils/mempool";
import { SeedWallet } from "utils/SeedWallet";

// New
import { networkConfig, mempoolClient, SeedWallet } from "rune-ordinals-toolbox";
```

### Step 5: Update Error Handling

Replace generic error handling with typed errors:

```typescript
// Old
try {
  // Your code
} catch (error) {
  console.error("Error:", error.message);
}

// New
import { UTXOError, WalletError, APIError } from "rune-ordinals-toolbox";

try {
  // Your code
} catch (error) {
  if (error instanceof UTXOError) {
    console.error("UTXO Error:", error.message);
  } else if (error instanceof WalletError) {
    console.error("Wallet Error:", error.message);
  } else if (error instanceof APIError) {
    console.error("API Error:", error.message);
  } else {
    console.error("Unknown Error:", error);
  }
}
```

### Step 6: Update Configuration

**Old network.config.ts:**
```typescript
const networkConfig = {
  networkType: "testnet",
};

export default networkConfig;
```

**New network.config.ts:**
```typescript
import { INetworkConfig, NetworkType } from '../types';

const NETWORK_CONFIGS: Record<NetworkType, INetworkConfig> = {
  mainnet: {
    networkType: 'mainnet',
    mempoolBaseUrl: 'https://mempool.space/api',
    feeRate: 10,
  },
  testnet: {
    networkType: 'testnet',
    mempoolBaseUrl: 'https://mempool.space/testnet/api',
    feeRate: 20,
  },
};

class NetworkConfigManager {
  private currentNetwork: NetworkType = 'testnet';

  getNetworkConfig(): INetworkConfig {
    return NETWORK_CONFIGS[this.currentNetwork];
  }

  setNetwork(networkType: NetworkType): void {
    this.currentNetwork = networkType;
  }

  getCurrentNetwork(): NetworkType {
    return this.currentNetwork;
  }
}

export const networkConfig = new NetworkConfigManager();
export default networkConfig;
```

## 🔧 Configuration Updates

### TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': 'warn',
  },
  env: {
    node: true,
    es2020: true,
  },
};
```

## 🧪 Testing

### Add Test Setup

Create `src/test/setup.ts`:

```typescript
// Global test setup
process.env.NODE_ENV = 'test';
```

### Example Test

Create `src/utils/__tests__/mempool.test.ts`:

```typescript
import { MempoolClient } from '../mempool';

describe('MempoolClient', () => {
  let client: MempoolClient;

  beforeEach(() => {
    client = new MempoolClient();
  });

  test('should initialize correctly', () => {
    expect(client).toBeInstanceOf(MempoolClient);
  });
});
```

## 🚨 Breaking Changes

1. **Import paths**: All import paths have changed to use the new structure
2. **API methods**: Some method signatures have changed for better type safety
3. **Error handling**: Generic errors replaced with typed error classes
4. **Configuration**: Network configuration is now a class with methods
5. **Scripts**: Scripts moved to `src/scripts/` directory

## ✅ Migration Checklist

- [ ] Update dependencies in package.json
- [ ] Move files to new directory structure
- [ ] Update all import statements
- [ ] Replace error handling with typed errors
- [ ] Update configuration usage
- [ ] Update TypeScript configuration
- [ ] Add ESLint configuration
- [ ] Create test setup
- [ ] Update build scripts
- [ ] Test all functionality

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the [documentation](README.md)
2. Review the [test files](../src/**/*.test.ts) for usage examples
3. Create an issue on GitHub
4. Check the [changelog](CHANGELOG.md) for detailed changes 