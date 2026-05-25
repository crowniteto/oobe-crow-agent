/**
 * Crow Agent - OOBE Protocol Autonomous Agent
 * 
 * This agent:
 * 1. Registers on SAP mainnet
 * 2. Discovers tools and services
 * 3. Executes automated workflows
 * 4. Uses x402 for payments
 * 5. Integrates with Ace Data Cloud AI services
 */

const { SynapseClient, createSynapse, Pubkey } = require('@oobe-protocol-labs/synapse-client-sdk');
const { SapClient, createSapClient, Pdas, Accounts, Instructions, Utils, ENDPOINTS, PROGRAM_ID } = require('@oobe-protocol-labs/synapse-sap-sdk');
const { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Load agent keypair
const keypairData = JSON.parse(fs.readFileSync('agent-keypair.json', 'utf-8'));
const secretKey = Buffer.from(keypairData.secretKey, 'base64');
const agentKeypair = Keypair.fromSecretKey(secretKey);
const agentPublicKey = agentKeypair.publicKey.toString();

console.log('=== Crow Agent - OOBE Protocol ===');
console.log('Agent Public Key:', agentPublicKey);
console.log('');

// Configuration
const CONFIG = {
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  synapseEndpoint: 'https://us-1-mainnet.oobeprotocol.ai/rpc',
  aceDataCloudUrl: 'https://platform.acedata.cloud',
  agentName: 'Crow-Agent',
  agentDescription: 'Autonomous market intelligence agent that combines Jupiter price feeds with AI analysis to discover opportunities on Solana.',
  skills: ['market-analysis', 'price-monitoring', 'defi-intelligence', 'prediction-markets'],
  endpoints: ['https://crow-agent.oobeprotocol.ai/x402'],
};

async function main() {
  console.log('Step 1: Connecting to Solana mainnet...');
  const connection = new Connection(CONFIG.rpcEndpoint, 'confirmed');
  
  try {
    const balance = await connection.getBalance(new PublicKey(agentPublicKey));
    console.log(`Agent balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance === 0) {
      console.log('WARNING: Agent has no SOL. Need to fund the wallet first.');
      console.log(`Fund this address: ${agentPublicKey}`);
      console.log('');
    }
  } catch (e) {
    console.log('Could not check balance:', e.message);
  }

  console.log('');
  console.log('Step 2: Creating Synapse Client...');
  try {
    const synapseClient = createSynapse({
      endpoint: CONFIG.synapseEndpoint,
    });
    console.log('Synapse Client created successfully');
    
    // Check connection
    const slot = await synapseClient.rpc.getSlot();
    console.log('Current slot:', slot);
  } catch (e) {
    console.log('Synapse Client error:', e.message);
  }

  console.log('');
  console.log('Step 3: Creating SAP Client...');
  try {
    const sapClient = createSapClient({
      rpcEndpoint: CONFIG.rpcEndpoint,
      programId: PROGRAM_ID,
    });
    console.log('SAP Client created successfully');
    console.log('SAP Program ID:', PROGRAM_ID.toString());
  } catch (e) {
    console.log('SAP Client error:', e.message);
  }

  console.log('');
  console.log('Step 4: PDA Derivation for Agent Registration...');
  try {
    const agentPda = Pdas.agent(new PublicKey(agentPublicKey));
    console.log('Agent PDA:', agentPda.toString());
    
    const escrowPda = Pdas.escrow(new PublicKey(agentPublicKey), new PublicKey(agentPublicKey));
    console.log('Escrow PDA:', escrowPda.toString());
  } catch (e) {
    console.log('PDA derivation error:', e.message);
  }

  console.log('');
  console.log('Step 5: Checking if agent is already registered...');
  try {
    const connection = new Connection(CONFIG.rpcEndpoint, 'confirmed');
    const agentPda = Pdas.agent(new PublicKey(agentPublicKey));
    
    const accountInfo = await connection.getAccountInfo(agentPda);
    if (accountInfo) {
      console.log('Agent IS registered on SAP!');
      console.log('Account data length:', accountInfo.data.length);
    } else {
      console.log('Agent NOT yet registered on SAP. Need to register.');
      console.log('Registration requires a transaction with SOL for rent exemption.');
    }
  } catch (e) {
    console.log('Agent check error:', e.message);
  }

  console.log('');
  console.log('=== Agent Setup Summary ===');
  console.log('Agent PublicKey:', agentPublicKey);
  console.log('Status: Wallet created, SDK loaded');
  console.log('Next: Fund wallet with SOL, then register on SAP');
  console.log('');
  console.log('For the bounty submission, we need:');
  console.log('1. SOL to fund transactions (~0.01 SOL minimum)');
  console.log('2. Agent registration transaction on SAP');
  console.log('3. An automated workflow that:');
  console.log('   a. Discovers tools via SAP');
  console.log('   b. Makes x402 paid API calls');
  console.log('   c. Uses escrow for payments');
  console.log('   d. Incorporates AI capabilities');
  console.log('   e. Uses Synapse Sentinel');
}

main().catch(console.error);
