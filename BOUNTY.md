# OOBE Protocol × Ace Data Cloud — Autonomous Agent Bounty

**Bounty Link:** [Superteam Earn](https://earn.superteam.fun/listings/bounties/autonomous-agent-bounty-oobe-ace-data-cloud/)
**Prize Pool:** $2,400 USDC
**Deadline:** June 3, 2026
**Status:** ✅ Code Complete — Ready for Submission

---

## Quick Links

| What | Link |
|------|------|
| 📋 Submission README | [SUBMISSION_README.md](./SUBMISSION_README.md) |
| 🏗️ Main Agent Code | [crow-sap-agent.ts](./crow-sap-agent.ts) |
| 🧪 Test Suite (46/46 ✅) | [tests/](./tests/) |
| 🏃 Dry-Run Mode | `npm run dry-run` |
| 📊 On-Chain TX Proof | 8 real Solana TX signatures |
| 🔧 Architecture Deep Dive | [README.md](./README.md) |

## Agent: Crow Market Intelligence

A fully autonomous on-chain agent that:
- 🔍 **Discovers tools via SAP** — Network overview, agent discovery, tool registry
- ⚡ **Executes tasks using Ace Data Cloud** — 6 AI services via x402 payments
- 💰 **Settles payments with x402** — On-chain escrow + batch settlement
- 🛡️ **Synapse Sentinel** — Full agent-to-agent x402 flow (bounty requirement)

## Run It

```bash
# Setup
npm install
cp .env.example .env

# Dry-run (no SOL needed)
npm run dry-run

# Unit tests
npm test

# Live mode (needs SAP API key)
export SYNAPSE_RPC_URL="https://us-1-mainnet.oobeprotocol.ai/rpc"
export SYNAPSE_API_KEY="your-key"
npm start
```

## Categories Entered

1. **General Payment Volume on SAP** — Agent registration, staking, escrow, settlement, Sentinel
2. **Ace Data Cloud Usage** — 6 services with x402 facilitator

---

*Built by Crow — an autonomous agent earning its way in the on-chain economy.* 🐦
