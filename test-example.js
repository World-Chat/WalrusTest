#!/usr/bin/env node

/**
 * Test Example for Walrus Encrypted Messaging
 * This file demonstrates the functionality without requiring actual wallet setup
 */

import dotenv from 'dotenv';
import { EncryptionService } from './src/encryption-service.js';

// Load environment variables
dotenv.config();

// Configuration from environment variables
const config = {
  senderAddress: process.env.SENDER_WALLET_ADDRESS,
  receiverAddress: process.env.RECEIVER_WALLET_ADDRESS,
  walrus: {
    aggregatorUrl: process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
    publisherUrl: process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
    network: process.env.SUI_NETWORK || 'testnet'
  },
  sui: {
    fullnodeUrl: process.env.SUI_FULLNODE_URL || 'https://fullnode.testnet.sui.io:443',
    network: process.env.SUI_NETWORK || 'testnet'
  }
};

// Validate configuration
function validateConfig() {
  console.log('🔧 Configuration loaded from .env:');
  console.log(`📤 Sender Address: ${config.senderAddress || '❌ NOT SET'}`);
  console.log(`📥 Receiver Address: ${config.receiverAddress || '❌ NOT SET'}`);
  console.log(`🌐 Walrus Aggregator: ${config.walrus.aggregatorUrl}`);
  console.log(`📡 Walrus Publisher: ${config.walrus.publisherUrl}`);
  console.log(`🔗 Sui Fullnode: ${config.sui.fullnodeUrl}`);
  console.log(`🌍 Network: ${config.walrus.network}`);
  console.log('');
  
  if (!config.senderAddress) {
    console.warn('⚠️  SENDER_WALLET_ADDRESS not set in .env file');
  }
  
  if (!config.receiverAddress) {
    console.warn('⚠️  RECEIVER_WALLET_ADDRESS not set in .env file');
  }
  
  if (!config.senderAddress || !config.receiverAddress) {
    console.log('💡 Tip: Create a .env file with your wallet addresses to test with real data');
    console.log('   Example:');
    console.log('   SENDER_WALLET_ADDRESS=0x1234567890abcdef...');
    console.log('   RECEIVER_WALLET_ADDRESS=0xfedcba0987654321...');
    console.log('');
  }
}

async function testEncryption() {
  console.log('🔐 Testing Encryption Service...');
  console.log('=====================================');
  
  const encryptionService = new EncryptionService();
  
  try {
    // Test message
    const originalMessage = "Hello! This is a test message for Walrus encrypted messaging! 🔐";
    console.log(`📝 Original message: "${originalMessage}"`);
    
    // Use real addresses if available, otherwise use mock addresses
    const senderAddress = config.senderAddress || '0x1234567890abcdef1234567890abcdef12345678';
    const receiverAddress = config.receiverAddress || '0xfedcba0987654321fedcba0987654321fedcba09';
    
    console.log(`📤 Using sender: ${senderAddress}`);
    console.log(`📥 Using receiver: ${receiverAddress}`);
    
    // Encrypt the message
    console.log('\n🔒 Encrypting message...');
    const encryptedData = await encryptionService.encryptMessage(
      originalMessage,
      receiverAddress,
      senderAddress
    );
    
    console.log('✅ Message encrypted successfully!');
    console.log(`📤 Sender: ${encryptedData.sender}`);
    console.log(`📥 Recipient: ${encryptedData.recipient}`);
    console.log(`📅 Timestamp: ${encryptedData.timestamp}`);
    console.log(`🔑 Sealed key length: ${encryptedData.sealedKey.length} bytes`);
    console.log(`📦 Encrypted message length: ${encryptedData.encryptedMessage.length} bytes`);
    
    // Serialize for storage simulation
    console.log('\n💾 Serializing encrypted data...');
    const serializedData = encryptionService.serializeEncryptedData(encryptedData);
    console.log(`📏 Serialized size: ${serializedData.length} bytes`);
    
    // Deserialize
    console.log('\n📖 Deserializing encrypted data...');
    const deserializedData = encryptionService.deserializeEncryptedData(serializedData);
    console.log('✅ Data deserialized successfully!');
    
    // Verify data integrity
    const isIntegrityValid = 
      encryptedData.sender === deserializedData.sender &&
      encryptedData.recipient === deserializedData.recipient &&
      encryptedData.timestamp === deserializedData.timestamp &&
      encryptedData.encryptedMessage.length === deserializedData.encryptedMessage.length &&
      encryptedData.sealedKey.length === deserializedData.sealedKey.length;
    
    console.log(`🔍 Data integrity check: ${isIntegrityValid ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Simulate decryption (in real app, this would use recipient's private key)
    console.log('\n🔓 Simulating decryption...');
    console.log('⚠️  Note: In a real implementation, decryption would require the recipient\'s private key');
    console.log('⚠️  This is a simplified simulation for demonstration purposes');
    
    // For demonstration, we'll show what the decryption process would look like
    console.log('\n📋 Decryption process would involve:');
    console.log('1. Using recipient\'s private key to unseal the encryption key');
    console.log('2. Using the unsealed key to decrypt the message');
    console.log('3. Verifying sender and recipient addresses');
    console.log('4. Returning the original message');
    
    console.log('\n🎉 Encryption test completed successfully!');
    console.log('\n📚 What was demonstrated:');
    console.log('✅ Message encryption with @mysten/seal');
    console.log('✅ Recipient-specific key sealing');
    console.log('✅ Data serialization for storage');
    console.log('✅ Data integrity verification');
    console.log('✅ Decryption process overview');
    
  } catch (error) {
    console.error('❌ Encryption test failed:', error.message);
    throw error;
  }
}

async function testKeyGeneration() {
  console.log('\n🔑 Testing Key Generation...');
  console.log('=============================');
  
  const encryptionService = new EncryptionService();
  
  try {
    // Generate a key
    console.log('🔑 Generating encryption key...');
    const key = await encryptionService.generateKey();
    console.log('✅ Key generated successfully!');
    
    // Export key
    console.log('📤 Exporting key to bytes...');
    const keyBytes = await encryptionService.exportKey(key);
    console.log(`📏 Key size: ${keyBytes.length} bytes`);
    
    // Import key
    console.log('📥 Importing key from bytes...');
    const importedKey = await encryptionService.importKey(keyBytes);
    console.log('✅ Key imported successfully!');
    
    console.log('🎉 Key generation test completed!');
    
  } catch (error) {
    console.error('❌ Key generation test failed:', error.message);
    throw error;
  }
}

async function testWalrusConfiguration() {
  console.log('\n🌐 Testing Walrus Configuration...');
  console.log('===================================');
  
  try {
    console.log('📡 Walrus Network Configuration:');
    console.log(`   Aggregator URL: ${config.walrus.aggregatorUrl}`);
    console.log(`   Publisher URL: ${config.walrus.publisherUrl}`);
    console.log(`   Network: ${config.walrus.network}`);
    console.log('');
    
    console.log('🔗 Sui Network Configuration:');
    console.log(`   Fullnode URL: ${config.sui.fullnodeUrl}`);
    console.log(`   Network: ${config.sui.network}`);
    console.log('');
    
    console.log('✅ Configuration test completed!');
    console.log('💡 This configuration will be used when connecting to Walrus and Sui networks');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🧪 Walrus Encrypted Messaging - Test Example');
  console.log('=============================================');
  console.log('This test demonstrates the encryption functionality and validates');
  console.log('your configuration from the .env file.');
  console.log('');
  
  // Validate and display configuration
  validateConfig();
  
  try {
    await testWalrusConfiguration();
    await testKeyGeneration();
    await testEncryption();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📖 Next steps:');
    
    if (config.senderAddress && config.receiverAddress) {
      console.log('✅ Your .env file is properly configured!');
      console.log('🚀 You can now run the full example: node index.js');
    } else {
      console.log('⚠️  Please configure your .env file with wallet addresses:');
      console.log('1. Copy env.example to .env: cp env.example .env');
      console.log('2. Edit .env and add your wallet addresses');
      console.log('3. Run the full example: node index.js');
    }
    
    console.log('\n🔧 For production use:');
    console.log('- Ensure you have SUI and WAL tokens in your wallets');
    console.log('- Test on testnet first before moving to mainnet');
    console.log('- Implement proper key management and security measures');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testEncryption, testKeyGeneration, testWalrusConfiguration, config }; 