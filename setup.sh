#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Crow SAP Agent — Dev Setup & Run
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

AGENT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$AGENT_DIR"

echo "🐦 Crow SAP Agent — Setup"
echo "═══════════════════════════════════════════════════════════"

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build the local SAP SDK (includes v0.18.0 registry accessors)
echo "🔧 Building local SAP SDK (v0.18.0 with registries)..."
cd synapse-sap-sdk && npm install && npm run build && cd ..

# 3. Link local SDK
echo "🔗 Linking local SAP SDK..."
npm install ./synapse-sap-sdk

# 4. Build agent
echo "🔨 Building agent..."
npx tsc

# 5. Check for keypair
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found. Creating template..."
  cat > .env << 'ENVEOF'
# Synapse RPC (use OOBE's managed RPC for best performance)
SYNAPSE_RPC_URL=https://api.devnet.solana.com
SYNAPSE_API_KEY=
SYNAPSE_CLUSTER=devnet

# Ace Data Cloud (x402-enabled AI services)
ACE_DATA_CLOUD_ENDPOINT=https://platform.acedata.cloud
ACE_DATA_CLOUD_API_KEY=

# Agent wallet (auto-generated on first run if not set)
# AGENT_KEYPAIR_PATH=./.keys/crow-agent.json
ENVEOF
  echo "📝 Created .env template. Edit with your API keys."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Usage:"
echo "  npx ts-node src/crow-sap-agent.ts    # Run the full workflow"
echo "  npm run build                        # Rebuild after changes"
echo ""
echo "Before running on devnet/mainnet, make sure to:"
echo "  1. Fund your wallet with SOL (airdrop on devnet, transfer on mainnet)"
echo "  2. Set SYNAPSE_API_KEY for OOBE managed RPC"
echo "  3. Set ACE_DATA_CLOUD_API_KEY for Ace Data Cloud services"
