# 🐦 Crow SAP Agent — OOBE Protocol × Ace Data Cloud

Autonomous on-chain DeFi market intelligence agent built on the **Synapse Agent Protocol (SAP)** with **Ace Data Cloud x402 payment facilitation**.

**Bounty**: [Autonomous Agent Bounty: OOBE × Ace Data Cloud](https://earn.superteam.fun) — $2,400 USDC

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                   Crow SAP Agent                       │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ SAP Client   │  │ x402 Payment │  │ Ace Data     │ │
│  │ (on-chain)   │  │ Facilitator  │  │ Cloud x402   │ │
│  │              │  │              │  │              │ │
│  │ • Register   │  │ • Escrow     │  │ • Image AI   │ │
│  │ • Stake      │  │ • Headers    │  │ • Text Gen   │ │
│  │ • Tools      │  │ • Settle     │  │ • Web Search │ │
│  │ • Discovery  │  │ • Batch      │  │ • Enrichment │ │
│  │ • Session    │  │ • Verify     │  │ • Sentiment  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
└─────────┼─────────────────┼──────────────────┼─────────┘
          │                 │                  │
          ▼                 ▼                  ▼
    ┌───────────┐    ┌──────────────┐   ┌─────────────┐
    │  Solana   │    │  SAP x402    │   │  Ace Data   │
    │  Devnet/  │    │  Escrow      │   │  Cloud API  │
    │  Mainnet  │    │  Program     │   │  (x402 pay) │
    └───────────┘    └──────────────┘   └─────────────┘
```

## Bounty Categories Addressed

### Category 1: General Payment Volume on SAP (On-chain Escrow + Settlement)
- Agent registration with x402 pricing tiers (standard + premium with volume curves)
- Staking for merchant status
- x402 escrow creation and funding
- Settlement (single + batch) with on-chain receipts
- Payment volume tracking via `reportCalls` and reputation updates

### Category 2: Ace Data Cloud Usage (x402 Facilitator Integration)
- Price discovery for Ace Data Cloud services via SAP x402 registry
- Escrow-funded micropayments to Ace Data Cloud APIs
- x402 HTTP header generation for authenticated service calls
- Settlement verification after service delivery
- Support for 6 Ace Data Cloud services: image analysis, text generation, web search, data enrichment, AI inference, sentiment analysis

## Quick Start

```bash
# 1. Clone and setup
cd oobe-agent
chmod +x setup.sh && ./setup.sh

# 2. Configure environment
cp .env.example .env
# Edit .env with your RPC URL, API keys, etc.

# 3. Run the full workflow
npx ts-node src/crow-sap-agent.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SYNAPSE_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `SYNAPSE_API_KEY` | OOBE managed RPC API key | — |
| `SYNAPSE_CLUSTER` | Solana cluster | `devnet` |
| `ACE_DATA_CLOUD_ENDPOINT` | Ace Data Cloud API endpoint | `https://platform.acedata.cloud` |
| `ACE_DATA_CLOUD_API_KEY` | Ace Data Cloud API key | — |
| `AGENT_KEYPAIR_PATH` | Path to agent keypair JSON | Auto-generated |

## Project Structure

```
oobe-agent/
├── src/
│   ├── crow-sap-agent.ts          # Main agent (11-step workflow)
│   └── ace-data-cloud-x402.ts     # x402 facilitator integration
├── dist/                          # Compiled JS output
├── synapse-sap-sdk/               # Local SAP SDK (v0.18.0 with registries)
├── synapse-client-sdk/            # OOBE client SDK (reference)
├── results/                       # Workflow execution results
├── .keys/                         # Auto-generated agent keypairs
├── setup.sh                       # Dev setup script
├── build.sh                       # Build script
├── package.json
└── tsconfig.json
```

## Workflow Steps

The `CrowSapAgent.runFullWorkflow()` executes:

1. **Init** — Connect to SAP, load/generate wallet
2. **Register** — Register agent on SAP with capabilities, pricing tiers, and tools
3. **Stake** — Stake SOL for merchant status
4. **Discover** — Query SAP network for agents, tools, profiles
5. **Open Escrow** — Create x402 payment escrow (Category 1)
6. **x402 to Ace** — Call Ace Data Cloud services via x402 payments (Category 2)
7. **Execute Workflow** — Run autonomous market intelligence workflow
8. **Settle** — Settle x402 payments on-chain
9. **Batch Settle** — Batch settle multiple service payments
10. **Session Log** — Write results to SAP session memory (vault + ring buffer + archive)
11. **Report Metrics** — Report call counts and reputation metrics

## SAP SDK v0.18.0 Features Used

| Feature | Module | Usage |
|---------|--------|-------|
| `SapConnection.fromKeypair()` | Core | One-liner connection + client |
| `client.builder` | AgentBuilder | Fluent registration with tools |
| `client.discovery` | DiscoveryRegistry | Network-wide agent/tool discovery |
| `client.x402` | X402Registry | Full payment lifecycle |
| `client.session` | SessionManager | Memory persistence |
| `client.agent` | AgentModule | Metrics & reputation |
| `client.staking` | StakingModule | Stake management |
| `client.tools` | ToolsModule | Tool publication |
| `client.vault` | VaultModule | Data vault |

## x402 Payment Flow

```
┌──────────┐                    ┌──────────┐
│  Client   │ ──── HTTP 402 ──→ │  Agent   │
│  (Crow)   │                    │  (API)   │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  1. Create escrow on SAP      │
     │  2. Fund with SOL             │
     │  3. Build x402 headers        │
     │  4. Call with headers ──────→ │
     │                               │  5. Serve request
     │                               │  6. Settle on-chain
     │  ← PaymentSettledEvent ←──── │
     │  7. Verify receipt            │
     └───────────────────────────────┘
```

## License

MIT
