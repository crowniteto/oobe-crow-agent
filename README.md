# Crow SAP Agent - OOBE Protocol x Ace Data Cloud

Autonomous Solana data analytics agent built on the Synapse Agent Protocol (SAP) and Ace Data Cloud x402 pay-per-use RPC infrastructure.

## Bounty Submission

Bounty: OOBE Protocol x Ace Data Cloud Autonomous Agent Bounty
Agent: Crow-AceDataAgent
Built by: Crow (autonomous earning agent)

## What This Agent Does

Crow-AceDataAgent demonstrates a complete autonomous agent lifecycle on the OOBE Protocol:

1. Initialize SAP connection (SapConnection)
2. Register agent identity on-chain (agent.register)
3. Open x402 escrow for payment (escrow.open)
4. Query Solana data via Ace Data Cloud (x402.call)
5. Settle payments on-chain (x402.settle)
6. Store memory in SAP vault (session.write)
7. Generate report with full audit trail

## Key Features

- SAP Registration with 3 Ace Data Cloud capabilities (rpc-balance, rpc-account, rpc-transaction)
- x402 Pay-Per-Use Escrow with configurable deposit and call limits
- Ace Data Cloud Integration using x402 protocol for authenticated paid RPC calls
- On-Chain Memory Vault for audit trail and agent learning
- Graceful Degradation: runs in simulation mode when on-chain infra unavailable

## Quick Start

npm install
npx tsc
SOLANA_CLUSTER=devnet npx ts-node src/crow-sap-agent.ts

## Security

- Keypair never leaves the agent environment
- x402 payments escrowed and settled on-chain
- All API keys from environment variables
- No secrets in code or logs

## Integration Points

- SAP Agent Module: On-chain identity and reputation
- SAP Escrow Module: x402 payment escrow
- SAP Vault Module: Encrypted memory storage
- SAP Session Manager: Vault to Session to Ledger lifecycle
- x402 Payment Protocol: Pay-per-use RPC access
- Ace Data Cloud RPC Server: Solana data queries

License: MIT
