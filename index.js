#!/usr/bin/env node

/**
 * Walrus Encrypted Messaging App Example
 * Demonstrates secure messaging using Walrus decentralized storage and @mysten/seal encryption
 */

import dotenv from 'dotenv';
import { MessagingService } from './src/messaging-service.js';
import readline from 'readline';

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Interactive message sending function
async function sendInteractiveMessage() {
  console.log('\n📤 Send a Message');
  console.log('================');
  
  const messagingService = new MessagingService(config);
  
  try {
    // Get message from user
    const message = await new Promise((resolve) => {
      rl.question('💬 Enter your message: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!message) {
      console.log('❌ Message cannot be empty');
      return null;
    }
    
    console.log('⏳ Sending message...');
    
    const result = await messagingService.sendMessage(message, config.receiverAddress);
    
    console.log('✅ Message sent successfully!');
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.timestamp}`);
    console.log(`📏 Size: ${result.size} bytes`);
    
    return result.blobId;
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    return null;
  }
}

// Interactive message retrieval function
async function retrieveInteractiveMessage() {
  console.log('\n📥 Retrieve a Message');
  console.log('===================');
  
  const messagingService = new MessagingService(config);
  
  try {
    // Get blob ID from user
    const blobId = await new Promise((resolve) => {
      rl.question('📋 Enter the Blob ID to retrieve: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!blobId) {
      console.log('❌ Blob ID cannot be empty');
      return null;
    }
    
    console.log('⏳ Retrieving message...');
    
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
    return null;
  }
}

// Interactive menu function
async function showMenu() {
  console.log('\n🔐 Walrus Encrypted Messaging App');
  console.log('================================');
  console.log('1. 📤 Send a message');
  console.log('2. 📥 Retrieve a message');
  console.log('3. 🔄 Send and retrieve (demo)');
  console.log('4. ❌ Exit');
  
  const choice = await new Promise((resolve) => {
    rl.question('\nSelect an option (1-4): ', (input) => {
      resolve(input.trim());
    });
  });
  
  return choice;
}

// Demo function that sends and immediately retrieves
async function sendAndRetrieveDemo() {
  console.log('\n🔄 Send and Retrieve Demo');
  console.log('========================');
  
  const messagingService = new MessagingService(config);
  
  try {
    // Get message from user
    const message = await new Promise((resolve) => {
      rl.question('💬 Enter your message: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!message) {
      console.log('❌ Message cannot be empty');
      return;
    }
    
    console.log('⏳ Sending message...');
    
    const result = await messagingService.sendMessage(message, config.receiverAddress);
    
    console.log('✅ Message sent successfully!');
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.timestamp}`);
    console.log(`📏 Size: ${result.size} bytes`);
    
    // Wait for blob to be processed
    console.log('\n⏳ Waiting for blob to be processed and certified on Walrus network...');
    console.log('   This may take a few seconds as the blob needs to be distributed and certified.');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    // Retrieve the message
    console.log('\n⏳ Retrieving message...');
    
    const retrievedResult = await messagingService.retrieveMessage(
      result.blobId,
      config.receiverAddress,
      config.senderAddress
    );
    
    console.log('✅ Message retrieved and decrypted successfully!');
    console.log(`💬 Message: "${retrievedResult.message}"`);
    console.log(`📤 From: ${retrievedResult.sender}`);
    console.log(`📥 To: ${retrievedResult.recipient}`);
    console.log(`📅 Timestamp: ${retrievedResult.timestamp}`);
    
    console.log('\n🎉 Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Main interactive application flow
async function main() {
  console.log('🚀 Walrus Encrypted Messaging App Example');
  console.log('==========================================');
  
  // Validate configuration
  validateConfig();
  
  try {
    while (true) {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          await sendInteractiveMessage();
          break;
        case '2':
          await retrieveInteractiveMessage();
          break;
        case '3':
          await sendAndRetrieveDemo();
          break;
        case '4':
          console.log('\n👋 Goodbye!');
          rl.close();
          process.exit(0);
          break;
        default:
          console.log('❌ Invalid option. Please select 1-4.');
      }
      
      // Ask if user wants to continue
      const continueChoice = await new Promise((resolve) => {
        rl.question('\nPress Enter to continue or type "exit" to quit: ', (input) => {
          resolve(input.trim().toLowerCase());
        });
      });
      
      if (continueChoice === 'exit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        process.exit(0);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Application failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure you have SUI and WAL tokens in your wallet');
    console.log('- Verify your wallet addresses are correct');
    console.log('- Check your internet connection');
    console.log('- Ensure Walrus network is accessible');
    
    rl.close();
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`\nWalrus Encrypted Messaging App Example\n\nUsage:\n  node index.js                    # Run the interactive app\n  node index.js --help            # Show this help message\n\nEnvironment Variables:\n  SENDER_WALLET_ADDRESS          # Your Sui wallet address (required)\n  RECEIVER_WALLET_ADDRESS        # Recipient's wallet address (required)\n  WALRUS_AGGREGATOR_URL          # Walrus aggregator URL (optional, default: https://aggregator.walrus-testnet.walrus.space)\n  WALRUS_PUBLISHER_URL           # Walrus publisher URL (optional, default: https://publisher.walrus-testnet.walrus.space)\n  SUI_NETWORK                    # Sui network (optional, default: testnet)\n\nExample:\n  SENDER_WALLET_ADDRESS=0x123... RECEIVER_WALLET_ADDRESS=0x456... node index.js\n`);
  process.exit(0);
}

// Run the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MessagingService, config }; 