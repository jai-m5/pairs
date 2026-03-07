# Solana Liquidity DEX 🌊

A decentralized exchange (DEX) for managing liquidity pools on the Solana blockchain.

## Features

- 💰 Create liquidity pools with any two tokens
- 💧 Add/remove liquidity from existing pools
- 🪙 Real token search (by symbol or contract address)
- 👛 Phantom wallet integration
- ✅ Payment validation before pool creation
- 🔄 Real Solana devnet integration

## Tech Stack

- **Solana Web3.js** - Blockchain interaction
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management

## Getting Started

### Prerequisites
- Node.js 16+
- Phantom Wallet installed
- SOL on Solana Devnet

### Installation

```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

Deployed on Vercel at: https://pairs-ajc5.vercel.app

## How It Works

1. **Connect Wallet** - Click "Connect Phantom" to link your wallet
2. **Create Pool** - Click "+ Create Pool" to create new liquidity pool
3. **Search Tokens** - Search by token symbol (USDC, USDT, SOL) or contract address
4. **Validate Payment** - System checks you have enough balance before allowing pool creation
5. **Add Liquidity** - Use "💧 Add Liquidity" button to deposit more assets into the pool

## Architecture

```
frontend/src/
├── components/
│   ├── ConnectWallet.tsx    # Wallet connection UI
│   ├── CreatePoolModal.tsx  # Pool creation dialog
│   ├── PoolInfo.tsx         # Display pools
│   ├── AddLiquidityModal.tsx # Liquidity management
│   └── DexScreen.tsx        # Swap interface
├── utils/
│   └── solana.ts            # Web3 utilities
├── styles/                  # Component styles
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## License

MIT
