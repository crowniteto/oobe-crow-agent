/**
 * Crow SAP Agent - OOBE Protocol x Ace Data Cloud Bounty
 *
 * Autonomous Solana data analytics agent demonstrating the full
 * Synapse Agent Protocol (SAP) lifecycle with Ace Data Cloud
 * x402 pay-per-use RPC integration.
 *
 * Steps demonstrated:
 * 1. Initialize SAP client with keypair
 * 2. Register agent identity on-chain via registerAgent instruction
 * 3. Open x402 escrow for Ace Data Cloud payment
 * 4. Make x402-paid RPC calls to Ace Data Cloud
 * 5. Settle escrow payments on-chain
 * 6. Open session + write to SAP vault for memory
 * 7. Generate audit trail report
 */
interface AgentConfig {
    rpcUrl: string;
    cluster: "mainnet-beta" | "devnet" | "localnet";
    keypairPath?: string;
    agentName: string;
    agentDescription: string;
    aceDataCloudEndpoint: string;
    maxEscrowDeposit: number;
    pricePerCall: number;
}
export declare class CrowSapAgent {
    private client;
    private keypair;
    private config;
    private state;
    constructor(config?: Partial<AgentConfig>);
    initialize(): Promise<void>;
    register(): Promise<void>;
    openEscrow(): Promise<void>;
    queryBalance(address: string): Promise<number>;
    queryAccountInfo(address: string): Promise<Record<string, unknown> | null>;
    settlePayments(): Promise<void>;
    storeMemory(): Promise<void>;
    generateReport(): AgentReport;
    runFullWorkflow(targetAddresses?: string[]): Promise<AgentReport>;
    private remember;
}
export interface AgentReport {
    agent: string;
    wallet: string;
    cluster: string;
    registered: boolean;
    escrowOpened: boolean;
    callsMade: number;
    totalSpentLamports: number;
    totalSpentSol: number;
    memoriesStored: number;
    elapsedSeconds: number;
    aceDataCloudEndpoint: string;
    capabilities: string[];
    protocols: string[];
    status: string;
    memories: string[];
}
export {};
