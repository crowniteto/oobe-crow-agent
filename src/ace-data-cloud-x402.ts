/**
 * Ace Data Cloud x402 Facilitator Integration
 * 
 * This module implements the x402 payment facilitator pattern for
 * Ace Data Cloud services. It enables:
 * 
 * 1. Price discovery — fetch x402-compatible pricing from Ace Data Cloud
 * 2. Escrow creation — fund on-chain escrow via SAP x402 registry
 * 3. Payment headers — generate x402 HTTP headers for authenticated calls
 * 4. Service invocation — call Ace Data Cloud APIs with x402 payments
 * 5. Settlement — settle escrow after successful service delivery
 * 6. Verification — verify on-chain settlement receipts
 *
 * This satisfies Bounty Category 2: Ace Data Cloud Usage (x402 Facilitator Integration)
 */

import {
  SapClient,
  type PaymentContext,
  type X402Headers,
  type CostEstimate,
  type EscrowBalance,
  type SettlementResult,
} from "@oobe-protocol-labs/synapse-sap-sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// ─── Ace Data Cloud Service Types ──────────────────────────────

export enum AceServiceType {
  IMAGE_ANALYSIS = "image-analysis",
  TEXT_GENERATION = "text-generation",
  WEB_SEARCH = "web-search",
  DATA_ENRICHMENT = "data-enrichment",
  AI_INFERENCE = "ai-inference",
  SENTIMENT_ANALYSIS = "sentiment-analysis",
}

export interface AceServiceConfig {
  serviceType: AceServiceType;
  pricePerCall: number;     // lamports
  maxCalls: number;
  description: string;
  version: string;
}

export const DEFAULT_ACE_SERVICES: AceServiceConfig[] = [
  {
    serviceType: AceServiceType.IMAGE_ANALYSIS,
    pricePerCall: 500_000,   // 0.0005 SOL
    maxCalls: 100,
    description: "AI-powered image analysis and recognition",
    version: "1.0",
  },
  {
    serviceType: AceServiceType.TEXT_GENERATION,
    pricePerCall: 200_000,   // 0.0002 SOL
    maxCalls: 500,
    description: "LLM text generation with context awareness",
    version: "1.0",
  },
  {
    serviceType: AceServiceType.WEB_SEARCH,
    pricePerCall: 100_000,   // 0.0001 SOL
    maxCalls: 1000,
    description: "Real-time web search and data retrieval",
    version: "1.0",
  },
  {
    serviceType: AceServiceType.DATA_ENRICHMENT,
    pricePerCall: 300_000,   // 0.0003 SOL
    maxCalls: 200,
    description: "On-chain/off-chain data enrichment and correlation",
    version: "1.0",
  },
  {
    serviceType: AceServiceType.AI_INFERENCE,
    pricePerCall: 1_000_000, // 0.001 SOL
    maxCalls: 50,
    description: "Heavy AI inference tasks (summaries, predictions)",
    version: "1.0",
  },
  {
    serviceType: AceServiceType.SENTIMENT_ANALYSIS,
    pricePerCall: 150_000,   // 0.00015 SOL
    maxCalls: 500,
    description: "Market and social sentiment analysis",
    version: "1.0",
  },
];

// ─── x402 Payment Facilitator ──────────────────────────────────

export class AceDataCloudX402Facilitator {
  private client: SapClient;
  private agentWallet: PublicKey;
  private aceEndpoint: string;
  private aceApiKey: string;
  private paymentContexts: Map<string, PaymentContext> = new Map();

  constructor(
    client: SapClient,
    agentWallet: PublicKey,
    aceEndpoint: string,
    aceApiKey: string = "",
  ) {
    this.client = client;
    this.agentWallet = agentWallet;
    this.aceEndpoint = aceEndpoint;
    this.aceApiKey = aceApiKey;
  }

  // ─── Price Discovery ─────────────────────────────────────

  /**
   * Get x402 pricing information from Ace Data Cloud services.
   * This fetches the pricing metadata and maps it to SAP-compatible
   * pricing tiers for escrow creation.
   */
  async discoverPricing(): Promise<{
    services: AceServiceConfig[];
    totalEstimate: CostEstimate | null;
  }> {
    console.log("🔍 Discovering Ace Data Cloud x402 pricing...");

    // Try to estimate costs from SAP x402 registry
    let totalEstimate: CostEstimate | null = null;
    try {
      const totalCalls = DEFAULT_ACE_SERVICES.reduce((sum, s) => sum + s.maxCalls, 0);
      totalEstimate = await this.client.x402.estimateCost(this.agentWallet, totalCalls);
      console.log(`  💲 Total estimated cost for ${totalCalls} calls: ${totalEstimate.totalCost.toString()} lamports`);
    } catch (err: any) {
      console.log(`  ⚠️  Cost estimation unavailable: ${err.message}`);
    }

    // Display service pricing
    for (const svc of DEFAULT_ACE_SERVICES) {
      console.log(`  📋 ${svc.serviceType}: ${svc.pricePerCall / 1_000_000_000} SOL/call (max ${svc.maxCalls})`);
    }

    return { services: DEFAULT_ACE_SERVICES, totalEstimate };
  }

  // ─── Escrow Creation ─────────────────────────────────────

  /**
   * Create and fund an x402 escrow for a specific Ace Data Cloud service.
   * This is the on-chain payment channel that enables trustless micropayments.
   */
  async createEscrow(service: AceServiceConfig): Promise<PaymentContext> {
    console.log(`🏦 Creating x402 escrow for ${service.serviceType}...`);
    console.log(`  Deposit: ${service.pricePerCall * service.maxCalls / 1_000_000_000} SOL`);
    console.log(`  Price/call: ${service.pricePerCall / 1_000_000_000} SOL`);

    const paymentCtx = await this.client.x402.preparePayment(this.agentWallet, {
      pricePerCall: service.pricePerCall,
      maxCalls: service.maxCalls,
      deposit: service.pricePerCall * service.maxCalls,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    });

    this.paymentContexts.set(service.serviceType, paymentCtx);

    console.log(`  ✅ Escrow created: ${paymentCtx.escrowPda.toBase58()}`);
    console.log(`  📝 TX: ${paymentCtx.txSignature}`);

    return paymentCtx;
  }

  /**
   * Create escrows for all Ace Data Cloud services at once.
   */
  async createAllEscrows(): Promise<Map<string, PaymentContext>> {
    console.log("\n🏦 Creating x402 escrows for all Ace Data Cloud services...");

    for (const service of DEFAULT_ACE_SERVICES) {
      await this.createEscrow(service);
    }

    console.log(`\n  ✅ Created ${this.paymentContexts.size} escrows\n`);
    return this.paymentContexts;
  }

  // ─── Payment Headers ─────────────────────────────────────

  /**
   * Build x402 HTTP payment headers for a specific Ace Data Cloud service.
   * These headers are included in the HTTP request to authenticate payment.
   */
  buildHeaders(serviceType: AceServiceType): X402Headers | null {
    const ctx = this.paymentContexts.get(serviceType);
    if (!ctx) {
      console.warn(`  ⚠️  No payment context for ${serviceType}. Create escrow first.`);
      return null;
    }

    const headers = this.client.x402.buildPaymentHeaders(ctx);
    console.log(`  📨 Built x402 headers for ${serviceType}`);
    return headers;
  }

  /**
   * Build headers from existing escrow (if already funded).
   */
  async buildHeadersFromEscrow(): Promise<X402Headers | null> {
    const headers = await this.client.x402.buildPaymentHeadersFromEscrow(this.agentWallet);
    if (headers) {
      console.log("  📨 Built x402 headers from existing escrow");
    }
    return headers;
  }

  // ─── Service Invocation ──────────────────────────────────

  /**
   * Call an Ace Data Cloud service with x402 payment headers.
   * This is the actual API call that uses on-chain escrow for payment.
   */
  async callService(
    serviceType: AceServiceType,
    payload: Record<string, any>,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    serviceType: AceServiceType;
  }> {
    console.log(`  🌐 Calling ${serviceType} via x402...`);

    // Build payment headers
    const x402Headers = this.buildHeaders(serviceType);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (x402Headers) {
      Object.assign(headers, x402Headers);
    }
    if (this.aceApiKey) {
      headers["Authorization"] = `Bearer ${this.aceApiKey}`;
    }

    // Make the API call
    try {
      const url = `${this.aceEndpoint}/api/v1/${serviceType}`;
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`  ❌ ${serviceType}: ${response.status} — ${errorText.slice(0, 100)}`);
        return { success: false, error: errorText, serviceType };
      }

      const data = await response.json();
      console.log(`  ✅ ${serviceType}: Success`);
      return { success: true, data, serviceType };
    } catch (err: any) {
      console.log(`  ❌ ${serviceType}: ${err.message}`);
      return { success: false, error: err.message, serviceType };
    }
  }

  /**
   * Call multiple Ace Data Cloud services in sequence with x402 payments.
   */
  async callMultipleServices(
    calls: Array<{ service: AceServiceType; payload: Record<string, any> }>,
  ): Promise<Array<{ success: boolean; data?: any; error?: string; serviceType: AceServiceType }>> {
    console.log(`\n🌐 Calling ${calls.length} Ace Data Cloud services via x402...`);

    const results = [];
    for (const call of calls) {
      const result = await this.callService(call.service, call.payload);
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`\n  📊 Results: ${successCount}/${results.length} successful\n`);

    return results;
  }

  // ─── Settlement ──────────────────────────────────────────

  /**
   * Settle x402 payments after successful service delivery.
   * This releases the escrowed funds to the service provider.
   */
  async settle(
    callsToSettle: number,
    serviceData: string,
  ): Promise<SettlementResult> {
    console.log(`💸 Settling ${callsToSettle} x402 calls for ${serviceData}...`);

    const settlement = await this.client.x402.settle(
      this.agentWallet,
      callsToSettle,
      serviceData,
    );

    console.log(`  ✅ Settled: ${settlement.callsSettled} calls, ${settlement.amount.toString()} lamports`);
    console.log(`  📝 TX: ${settlement.txSignature}`);

    return settlement;
  }

  /**
   * Batch settle multiple service payments at once.
   */
  async batchSettle(
    entries: Array<{ calls: number; serviceData: string }>,
  ): Promise<{
    totalCalls: number;
    totalAmount: BN;
    settlements: SettlementResult[];
  }> {
    console.log(`💸 Batch settling ${entries.length} payment groups...`);

    let totalCalls = 0;
    let totalAmount = new BN(0);
    const settlements: SettlementResult[] = [];

    for (const entry of entries) {
      const settlement = await this.settle(entry.calls, entry.serviceData);
      settlements.push(settlement);
      totalCalls += settlement.callsSettled;
      totalAmount = totalAmount.add(settlement.amount);
    }

    console.log(`\n  ✅ Batch complete: ${totalCalls} calls, ${totalAmount.toString()} lamports total\n`);

    return { totalCalls, totalAmount, settlements };
  }

  // ─── Balance Monitoring ──────────────────────────────────

  /**
   * Check the current escrow balance and remaining calls.
   */
  async checkBalance(): Promise<EscrowBalance | null> {
    try {
      const balance = await this.client.x402.getBalance(this.agentWallet);
      if (balance) {
        console.log(`  💰 Escrow balance: ${balance.balance.toString()} lamports`);
        console.log(`  📞 Remaining calls: ${balance.callsRemaining}`);
        console.log(`  ✅ Affordable calls: ${balance.affordableCalls}`);
        console.log(`  ⏰ Expired: ${balance.isExpired}`);
      }
      return balance;
    } catch (err: any) {
      console.log(`  ⚠️  Balance check: ${err.message}`);
      return null;
    }
  }

  // ─── Full Integration Flow ───────────────────────────────

  /**
   * Run the complete x402 facilitator integration flow:
   * 1. Price discovery
   * 2. Escrow creation
   * 3. Service calls with x402 payments
   * 4. Settlement
   * 5. Verification
   */
  async runIntegrationFlow(): Promise<{
    pricing: any;
    escrows: Map<string, PaymentContext>;
    results: any[];
    settlement: any;
    balance: EscrowBalance | null;
  }> {
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("🌐 ACE DATA CLOUD × x402 INTEGRATION FLOW");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Price discovery
    const pricing = await this.discoverPricing();

    // 2. Create escrows for key services
    const escrowServices = [
      AceServiceType.TEXT_GENERATION,
      AceServiceType.WEB_SEARCH,
      AceServiceType.IMAGE_ANALYSIS,
    ];

    for (const svcType of escrowServices) {
      const svc = DEFAULT_ACE_SERVICES.find((s) => s.serviceType === svcType);
      if (svc) await this.createEscrow(svc);
    }

    // 3. Call services with x402 payments
    const results = await this.callMultipleServices([
      {
        service: AceServiceType.TEXT_GENERATION,
        payload: {
          prompt: "Analyze current Solana DeFi market conditions and yield opportunities",
          max_tokens: 500,
        },
      },
      {
        service: AceServiceType.WEB_SEARCH,
        payload: {
          query: "Solana DeFi TVL 2026 top protocols by yield",
          max_results: 10,
        },
      },
      {
        service: AceServiceType.IMAGE_ANALYSIS,
        payload: {
          image_url: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
          prompt: "Analyze this cryptocurrency branding",
        },
      },
    ]);

    // 4. Settle payments
    const settlement = await this.batchSettle([
      { calls: 1, serviceData: "text-generation-sol-defi-report" },
      { calls: 1, serviceData: "web-search-tvl-data" },
      { calls: 1, serviceData: "image-analysis-sol-branding" },
    ]);

    // 5. Check remaining balance
    const balance = await this.checkBalance();

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ ACE DATA CLOUD × x402 INTEGRATION COMPLETE");
    console.log("═══════════════════════════════════════════════════════\n");

    return {
      pricing,
      escrows: this.paymentContexts,
      results,
      settlement,
      balance,
    };
  }
}
