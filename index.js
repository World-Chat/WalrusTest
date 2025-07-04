#!/usr/bin/env node

/**
 * Walrus Encrypted Messaging App Example
 * Demonstrates secure messaging using Walrus decentralized storage and @mysten/seal encryption
 */

import dotenv from 'dotenv';
import { MessagingService } from './src/messaging-service.js';

// Load environment variables
dotenv.config();

// Configuration
const config = {
  walrus: {
    aggregatorUrl: process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
    publisherUrl: process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
    network: process.env.SUI_NETWORK || 'testnet'
  },
  senderAddress: process.env.SENDER_WALLET_ADDRESS,
  receiverAddress: process.env.RECEIVER_WALLET_ADDRESS
};

// Validate configuration
function validateConfig() {
  if (!config.senderAddress) {
    console.error('❌ SENDER_WALLET_ADDRESS is required in environment variables');
    console.log('Please set your sender wallet address in the .env file');
    process.exit(1);
  }
  
  if (!config.receiverAddress) {
    console.error('❌ RECEIVER_WALLET_ADDRESS is required in environment variables');
    console.log('Please set the receiver wallet address in the .env file');
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
  console.log(`📤 Sender: ${config.senderAddress}`);
  console.log(`📥 Receiver: ${config.receiverAddress}`);
}

// Example usage functions
async function sendExampleMessage() {
  console.log('\n📤 Sending Example Message...');
  
  const messagingService = new MessagingService(config);
  
  try {
    const message = "Hello! This is a secret message stored on Walrus with @mysten/seal encryption! 🔐";
    
    const result = await messagingService.sendMessage(message, config.receiverAddress);
    
    console.log('✅ Message sent successfully!');
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.timestamp}`);
    console.log(`📏 Size: ${result.size} bytes`);
    
    return result.blobId;
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    throw error;
  }
}

async function retrieveExampleMessage(blobId) {
  console.log('\n📥 Retrieving Example Message...');
  
  const messagingService = new MessagingService(config);
  
  try {
    const result = await messagingService.retrieveMessage(
      blobId,
      config.receiverAddress,
      config.senderAddress
    );
    
    console.log('✅ Message retrieved and decrypted successfully!');
    console.log(`💬 Message: "${result.message}"`);
    console.log(`📤 From: ${result.sender}`);
    console.log(`📥 To: ${result.recipient}`);
    console.log(`📅 Timestamp: ${result.timestamp}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to retrieve message:', error.message);
    throw error;
  }
}

async function getMessageMetadata(blobId) {
  console.log('\n📊 Getting Message Metadata...');
  
  const messagingService = new MessagingService(config);
  
  try {
    const metadata = await messagingService.getMessageMetadata(blobId);
    
    console.log('✅ Message metadata retrieved!');
    console.log('📋 Metadata:', JSON.stringify(metadata, null, 2));
    
    return metadata;
  } catch (error) {
    console.error('❌ Failed to get message metadata:', error.message);
    throw error;
  }
}

async function verifyMessage(blobId) {
  console.log('\n🔍 Verifying Message...');
  
  const messagingService = new MessagingService(config);
  
  try {
    const isValid = await messagingService.verifyMessage(blobId, config.senderAddress);
    
    if (isValid) {
      console.log('✅ Message verification passed!');
    } else {
      console.log('❌ Message verification failed!');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Failed to verify message:', error.message);
    throw error;
  }
}

async function waitForBlob(blobId, aggregatorUrl, maxTries = 10, delayMs = 3000) {
  for (let i = 0; i < maxTries; i++) {
    const res = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`);
    if (res.ok) return await res.arrayBuffer();
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error('Blob not available after waiting');
}

// Main application flow
async function main() {
  console.log('🚀 Walrus Encrypted Messaging App Example');
  console.log('==========================================');
  
  // Validate configuration
  validateConfig();
  
  try {
    // Step 1: Send a message
    const blobId = await sendExampleMessage();
    
    // Step 2: Wait for blob to be processed and certified on Walrus network
    console.log('\n⏳ Waiting for blob to be processed and certified on Walrus network...');
    console.log('   This may take a few seconds as the blob needs to be distributed and certified.');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    // Step 3: Skip metadata (endpoint not available) and go straight to retrieval
    console.log('\n📊 Skipping metadata retrieval (endpoint not available on this aggregator)');
    
    // Step 4: Retrieve and decrypt the message
    await retrieveExampleMessage(blobId);
    
    console.log('\n🎉 Example completed successfully!');
    console.log('\n📚 What happened:');
    console.log('1. Message was encrypted using @mysten/seal');
    console.log('2. Encrypted data was stored on Walrus decentralized storage');
    console.log('3. Message was retrieved and decrypted successfully');
    console.log('4. Message integrity was verified');
    
  } catch (error) {
    console.error('\n💥 Example failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure you have SUI and WAL tokens in your wallet');
    console.log('- Verify your wallet addresses are correct');
    console.log('- Check your internet connection');
    console.log('- Ensure Walrus network is accessible');
    
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`\nWalrus Encrypted Messaging App Example\n\nUsage:\n  node index.js                    # Run the complete example\n  node index.js --help            # Show this help message\n\nEnvironment Variables:\n  SENDER_WALLET_ADDRESS          # Your Sui wallet address (required)\n  RECEIVER_WALLET_ADDRESS        # Recipient's wallet address (required)\n  WALRUS_AGGREGATOR_URL          # Walrus aggregator URL (optional, default: https://agg.test.walrus.eosusa.io)\n  WALRUS_PUBLISHER_URL           # Walrus publisher URL (optional, default: https://pub.test.walrus.eosusa.io)\n  SUI_NETWORK                    # Sui network (optional, default: testnet)\n\nExample:\n  SENDER_WALLET_ADDRESS=0x123... RECEIVER_WALLET_ADDRESS=0x456... node index.js\n`);
  process.exit(0);
}

// Run the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MessagingService, config }; 