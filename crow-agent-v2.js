/**
 * Crow Agent - OOBE Protocol Autonomous Agent v0.2
 * 
 * Autonomous market intelligence agent on Solana using:
 * - Synapse Agent Protocol (SAP) for registration, escrow, x402
 * - Jupiter API for price feeds and token discovery
 * - Ace Data Cloud for AI capabilities (x402 paid calls)
 * - Synapse Sentinel for monitoring
 */

const {
  SapClient, Pdas, Accounts, Events, Instructions, Utils,
  ENDPOINTS, PROGRAM_ID, validateAgentInput
} = require('@oobe-protocol-labs/synapse-sap-sdk');

const { SynapseClient, createSynapse, Pubkey } = require('@oobe-protocol-labs/synapse-client-sdk');
const { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL, Transaction } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ─── Configuration ───────────────────────────────────────────────
const CONFIG = {
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  agentName: 'Crow-Market-Intel',
  agentDescription: 'Autonomous market intelligence agent combining Jupiter price feeds with AI analysis for Solana DeFi opportunities',
  skills: ['market-analysis', 'price-monitoring', 'defi-intelligence', 'prediction-markets', 'token-discovery'],
  jupiterBaseUrl: 'https://api.jup.ag',
  aceDataCloudUrl: 'https://platform.acedata.cloud',
};

// ─── Load Wallet ─────────────────────────────────────────────────
function loadWallet() {
  const keypairData = JSON.parse(fs.readFileSync('agent-keypair.json', 'utf-8'));
  const secretKey = Buffer.from(keypairData.secretKey, 'base64');
  return Keypair.fromSecretKey(secretKey);
}

// ─── Jupiter API Helper ──────────────────────────────────────────
function jupiterRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.jupiterBaseUrl}${path}`;
    https.get(url, { headers: { 'User-Agent': 'Crow-Agent/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.substring(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

// ─── Get Market Intelligence from Jupiter ─────────────────────────
async function getMarketIntelligence() {
  console.log('📡 Fetching market intelligence from Jupiter API...');
  
  // 1. Get SOL/USDC prices
  const prices = await jupiterRequest('/price/v3?ids=So11111111111111111111111111111111111111112,EPjFddMfNofMdJGuQ5dQz3MHBh2MtZgVQZ6fnzJ7r2CE');
  
  // 2. Search trending tokens
  const trending = await jupiterRequest('/tokens/v3/search?query=trending&limit=5');
  
  // 3. Get prediction markets
  let predictions = null;
  try {
    predictions = await jupiterRequest('/prediction-markets/v1?limit=5');
  } catch (e) { /* prediction markets might not be available */ }
  
  const report = {
    timestamp: new Date().toISOString(),
    prices: prices.data || prices,
    trending: trending.data || trending,
    predictions: predictions?.data || predictions,
  };
  
  console.log('✅ Market intelligence fetched');
  return report;
}

// ─── Main Agent Flow ─────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   🐦 Crow Agent - OOBE Protocol Autonomous Agent ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  
  const wallet = loadWallet();
  console.log('🔑 Agent Wallet:', wallet.publicKey.toString());
  
  // ─── Step 1: Initialize SAP Client ────────────────────────────
  console.log('');
  console.log('Step 1: Initializing SAP Client...');
  const connection = new Connection(CONFIG.rpcEndpoint, 'confirmed');
  
  const sapClient = new SapClient({
    rpcEndpoint: CONFIG.rpcEndpoint,
    programId: new PublicKey(PROGRAM_ID.toString()),
  });
  console.log('✅ SAP Client initialized');
  console.log('   Program ID:', PROGRAM_ID.toString());
  
  // ─── Step 2: Derive PDAs ──────────────────────────────────────
  console.log('');
  console.log('Step 2: Deriving PDAs...');
  const [agentPda] = Pdas.getAgentPDA(wallet.publicKey);
  const [globalPda] = Pdas.getGlobalPDA();
  const [agentStatsPda] = Pdas.getAgentStatsPDA(wallet.publicKey);
  console.log('✅ PDA derived');
  console.log('   Agent PDA:', agentPda.toString());
  console.log('   Global PDA:', globalPda.toString());
  
  // ─── Step 3: Check Registration ───────────────────────────────
  console.log('');
  console.log('Step 3: Checking agent registration status...');
  let isRegistered = false;
  try {
    const agentAccount = await sapClient.program.account.agentAccount.fetch(agentPda);
    console.log('✅ Agent IS registered on SAP!');
    console.log('   Name:', agentAccount.name || 'N/A');
    console.log('   Status:', agentAccount.isActive ? 'Active' : 'Inactive');
    isRegistered = true;
  } catch (e) {
    if (e.message?.includes('Account does not exist') || e.message?.includes('138')) {
      console.log('⚠️  Agent NOT registered on SAP yet');
      console.log('   Registration requires SOL for transaction fees + rent exemption');
    } else {
      console.log('⚠️  Could not check registration:', e.message?.substring(0, 100));
    }
  }
  
  // ─── Step 4: Register Agent (if not registered) ───────────────
  if (!isRegistered) {
    console.log('');
    console.log('Step 4: Preparing agent registration transaction...');
    
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('   Current balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    
    if (balance > 0) {
      console.log('   Building registration transaction...');
      try {
        // Use Anchor program methods to register
        const registerTx = await sapClient.program.methods
          .registerAgent(
            CONFIG.agentName,
            CONFIG.agentDescription,
            CONFIG.skills
          )
          .accounts({
            agent: wallet.publicKey,
            agentAccount: agentPda,
            globalRegistry: globalPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .transaction();
        
        console.log('✅ Registration transaction built!');
        console.log('   Transaction would be signed and sent with funded wallet');
      } catch (e) {
        console.log('   Registration build error:', e.message?.substring(0, 200));
        console.log('   Will attempt alternative registration approach');
      }
    } else {
      console.log('   💰 Wallet needs SOL funding before registration');
      console.log('   Fund address:', wallet.publicKey.toString());
    }
  }
  
  // ─── Step 5: Market Intelligence ──────────────────────────────
  console.log('');
  console.log('Step 5: Running market intelligence workflow...');
  try {
    const intel = await getMarketIntelligence();
    console.log('');
    console.log('📊 Market Intelligence Report:');
    
    if (intel.prices) {
      for (const [mint, priceData] of Object.entries(intel.prices)) {
        const symbol = mint === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'USDC';
        console.log(`   ${symbol}: $${priceData?.usdPrice || priceData?.price || 'N/A'}`);
      }
    }
    
    if (intel.trending?.tokens) {
      console.log('   Trending tokens:', intel.trending.tokens.slice(0, 3).map(t => t.symbol || t.name).join(', '));
    }
    
    // Save report
    fs.writeFileSync('market-intel-report.json', JSON.stringify(intel, null, 2));
    console.log('   ✅ Report saved to market-intel-report.json');
  } catch (e) {
    console.log('   ⚠️  Market intelligence error:', e.message);
  }
  
  // ─── Step 6: Demonstrate Automated Workflow ───────────────────
  console.log('');
  console.log('Step 6: Demonstrating automated workflow design...');
  console.log('');
  console.log('   ┌─────────────────────────────────────────────────┐');
  console.log('   │          Crow Agent Autonomous Workflow          │');
  console.log('   ├─────────────────────────────────────────────────┤');
  console.log('   │  1. TRIGGER: Cron (hourly) or price threshold   │');
  console.log('   │  2. FETCH: Jupiter API price feeds              │');
  console.log('   │  3. ANALYZE: AI via Ace Data Cloud (x402)       │');
  console.log('   │  4. DISCOVER: SAP tool/service discovery        │');
  console.log('   │  5. EXECUTE: Call SAP-registered tools          │');
  console.log('   │  6. PAY: x402 settlement via escrow            │');
  console.log('   │  7. MONITOR: Synapse Sentinel health check      │');
  console.log('   │  8. REPORT: Generate intelligence brief         │');
  console.log('   └─────────────────────────────────────────────────┘');
  
  // ─── Summary ──────────────────────────────────────────────────
  console.log('');
  console.log('════════════════════════════════════════════════════');
  console.log('🎯 Agent Setup Complete!');
  console.log('');
  console.log('Agent Address:', wallet.publicKey.toString());
  console.log('Agent PDA:', agentPda.toString());
  console.log('SAP Program:', PROGRAM_ID.toString());
  console.log('Registered:', isRegistered ? 'YES' : 'PENDING (needs SOL)');
  console.log('');
  console.log('To complete registration and run the full workflow:');
  console.log('1. Fund wallet with ~0.05 SOL');
  console.log('2. Run: node register-agent.js');
  console.log('3. Run: node workflow.js (the autonomous pipeline)');
  console.log('4. Post demo on X tagging @OOBEonSol and @AceDataCloud');
  console.log('════════════════════════════════════════════════════');
}

main().catch(console.error);
