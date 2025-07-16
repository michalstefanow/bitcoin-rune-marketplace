# Rune-Ordinals Toolbox

A comprehensive Bitcoin UTXO management and Rune/Ordinals toolbox built with `bitcoinjs-lib`.

## 🚀 Features

### UTXO Management
- **UTXO Merging**: Combine multiple small UTXOs into larger ones
- **UTXO Splitting**: Split large UTXOs into smaller denominations  
- **UTXO Sending**: Transfer UTXOs to specified addresses
- **UTXO Tracking**: Monitor and manage UTXO states

### Rune Operations
- **Rune Etching**: Create new Rune tokens with custom parameters
- **Rune Minting**: Mint existing Rune tokens
- **Rune Transfer**: Transfer Rune tokens between addresses
- **Recursive Runes**: Advanced Rune operations with recursion
- **Runestone Encoding/Decoding**: Work with Runestone data structures

### Ordinals & Inscriptions
- **Parent Inscriptions**: Create base Ordinal inscriptions
- **Child Inscriptions**: Create child inscriptions (Text, HTML, Image)
- **Reinscriptions**: Modify existing inscriptions
- **Delegate Inscriptions**: Create delegated inscription scripts
- **Taproot Integration**: Full Taproot support for inscriptions

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Business logic controllers
├── scripts/          # Executable scripts (15+ scripts)
├── services/         # Service layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main entry point
```

## 🛠️ Installation

```bash
git clone https://github.com/bitmapers/rune-ordinals-toolbox.git
cd rune-ordinals-toolbox
npm install
cp .env.example .env
npm run build
```

## ⚙️ Configuration

Create `.env` file:
```env
NETWORK_TYPE=testnet  # or mainnet
MNEMONIC=your 12 or 24 word mnemonic phrase
PRIVATE_KEY=your WIF private key
FEE_RATE=20
```

## 🚀 Usage

### Quick Start Scripts

```bash
# UTXO Operations
npm run utxo:merge    # Merge multiple UTXOs
npm run utxo:send     # Send UTXO to address
npm run utxo:split    # Split UTXO into smaller parts

# Rune Operations
npm run rune:etch     # Etch new Rune
npm run rune:mint     # Mint existing Rune
npm run rune:transfer # Transfer Rune tokens

# Ordinal Operations
npm run ordinal:inscribe  # Create parent inscription
npm run ordinal:child     # Create child inscription
npm run ordinal:reinscribe # Reinscribe existing ordinal
```

### Direct Script Execution

```bash
# UTXO Management
npx tsx src/scripts/UTXO_merge.ts
npx tsx src/scripts/UTXO_send.ts
npx tsx src/scripts/UTXO_split.ts

# Rune Operations
npx tsx src/scripts/RUNE_etching.ts
npx tsx src/scripts/RUNE_minting.ts
npx tsx src/scripts/RUNE_transfer.ts

# Ordinal Inscriptions
npx tsx src/scripts/Parent_Inscription.ts
npx tsx src/scripts/Text_Child_Inscription.ts
npx tsx src/scripts/HTML_Child_Inscription.ts
npx tsx src/scripts/Image_Child_Inscription.ts
npx tsx src/scripts/Reinscription.ts
npx tsx src/scripts/Delegate_inscription.ts

# Advanced Operations
npx tsx src/scripts/Recursive_Rune.ts
npx tsx src/scripts/Runestone.ts
npx tsx src/scripts/Encipher_Decipher_Runestone.ts
```

## 🔧 Development

```bash
npm run build          # Compile TypeScript
npm run dev            # Development server with hot reload
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run test           # Run tests
npm run test:coverage  # Run tests with coverage
```

## 🔐 Security

- Always use testnet for development
- Never commit private keys or mnemonics
- Use environment variables for sensitive data
- Regularly update dependencies

## 🌐 Network Support

- **Testnet**: Default for development
- **Mainnet**: Production Bitcoin network

## 📚 API Reference

### Core Classes

```typescript
// Seed Wallet
const wallet = new SeedWallet({ 
  networkType: 'testnet', 
  seed: 'your mnemonic phrase' 
});

// WIF Wallet
const wallet = new WIFWallet({ 
  networkType: 'testnet', 
  privateKey: 'your WIF private key' 
});

// UTXO Controller
import { utxoController } from './controllers/utxo.controller';
const psbt = utxoController.createSendPsbt(wallet, utxo, fee, address);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/bitmapers/rune-ordinals-toolbox/issues)
- **Migration**: See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

## ⚠️ Disclaimer

This software is for educational and development purposes. Always test thoroughly on testnet before using on mainnet.

---

**Built with ❤️ for the Bitcoin community** 