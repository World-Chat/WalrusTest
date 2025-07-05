#!/usr/bin/env node

/**
 * Walrus Structured Conversation Example
 * Demonstrates typed conversation and message storage using Walrus
 */

import dotenv from 'dotenv';
import { ConversationService } from './src/conversation-service.js';
import { MessageType } from './src/data-models.js';
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

// Create a new conversation
async function createConversation(conversationService) {
  console.log('\n💬 Create a New Conversation');
  console.log('===========================');
  
  try {
    const participants = [config.receiverAddress];
    
    console.log('⏳ Creating conversation...');
    const result = await conversationService.createConversation(participants);
    
    console.log('✅ Conversation created successfully!');
    console.log(`🆔 Conversation ID: ${result.conversation.id}`);
    console.log(`👥 Participants: ${result.conversation.participants.join(', ')}`);
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Created: ${result.conversation.createdAt}`);
    
    return result.conversation.id;
  } catch (error) {
    console.error('❌ Failed to create conversation:', error.message);
    return null;
  }
}

// Send a text message
async function sendTextMessage(conversationId, conversationService) {
  console.log('\n📝 Send a Text Message');
  console.log('======================');
  
  try {
    // Get message content from user
    const content = await new Promise((resolve) => {
      rl.question('💬 Enter your message: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!content) {
      console.log('❌ Message cannot be empty');
      return null;
    }
    
    console.log('⏳ Sending text message...');
    
    const result = await conversationService.sendMessage(
      conversationId,
      MessageType.TEXT,
      content
    );
    
    console.log('✅ Text message sent successfully!');
    console.log(`🆔 Message ID: ${result.message.id}`);
    console.log(`💬 Content: "${result.message.content}"`);
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.message.timestamp}`);
    
    return result.message.id;
  } catch (error) {
    console.error('❌ Failed to send text message:', error.message);
    return null;
  }
}

// Send a payment message
async function sendPaymentMessage(conversationId, conversationService) {
  console.log('\n💰 Send a Payment Message');
  console.log('=========================');
  
  try {
    // Get payment details from user
    const amount = await new Promise((resolve) => {
      rl.question('💰 Enter amount: ', (input) => {
        resolve(input.trim());
      });
    });
    
    const currency = await new Promise((resolve) => {
      rl.question('💱 Enter currency (e.g., USD, SUI): ', (input) => {
        resolve(input.trim());
      });
    });
    
    const description = await new Promise((resolve) => {
      rl.question('📝 Enter payment description: ', (input) => {
        resolve(input.trim());
      });
    });
    
    const transactionId = await new Promise((resolve) => {
      rl.question('🔗 Enter transaction ID (optional): ', (input) => {
        resolve(input.trim() || null);
      });
    });
    
    if (!amount || !currency || !description) {
      console.log('❌ Amount, currency, and description are required');
      return null;
    }
    
    const metadata = {
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      recipient: config.receiverAddress,
      transactionId: transactionId
    };
    
    console.log('⏳ Sending payment message...');
    
    const result = await conversationService.sendMessage(
      conversationId,
      MessageType.SEND_PAYMENT,
      description,
      metadata
    );
    
    console.log('✅ Payment message sent successfully!');
    console.log(`🆔 Message ID: ${result.message.id}`);
    console.log(`💰 Amount: ${result.message.metadata.amount} ${result.message.metadata.currency}`);
    console.log(`📝 Description: "${result.message.content}"`);
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.message.timestamp}`);
    
    return result.message.id;
  } catch (error) {
    console.error('❌ Failed to send payment message:', error.message);
    return null;
  }
}

// Send a payment request message
async function sendPaymentRequestMessage(conversationId, conversationService) {
  console.log('\n📋 Send a Payment Request');
  console.log('=========================');
  
  try {
    // Get payment request details from user
    const amount = await new Promise((resolve) => {
      rl.question('💰 Enter requested amount: ', (input) => {
        resolve(input.trim());
      });
    });
    
    const currency = await new Promise((resolve) => {
      rl.question('💱 Enter currency (e.g., USD, SUI): ', (input) => {
        resolve(input.trim());
      });
    });
    
    const description = await new Promise((resolve) => {
      rl.question('📝 Enter request description: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!amount || !currency || !description) {
      console.log('❌ Amount, currency, and description are required');
      return null;
    }
    
    const metadata = {
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('⏳ Sending payment request...');
    
    const result = await conversationService.sendMessage(
      conversationId,
      MessageType.REQUEST_PAYMENT,
      description,
      metadata
    );
    
    console.log('✅ Payment request sent successfully!');
    console.log(`🆔 Message ID: ${result.message.id}`);
    console.log(`💰 Requested Amount: ${result.message.metadata.amount} ${result.message.metadata.currency}`);
    console.log(`📝 Description: "${result.message.content}"`);
    console.log(`🆔 Request ID: ${result.message.metadata.requestId}`);
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.message.timestamp}`);
    
    return result.message.id;
  } catch (error) {
    console.error('❌ Failed to send payment request:', error.message);
    return null;
  }
}

// Retrieve a message
async function retrieveMessage(conversationService) {
  console.log('\n📥 Retrieve a Message');
  console.log('====================');
  
  try {
    // Get message details from user
    const messageId = await new Promise((resolve) => {
      rl.question('🆔 Enter the Message ID: ', (input) => {
        resolve(input.trim());
      });
    });
    
    const blobId = await new Promise((resolve) => {
      rl.question('📋 Enter the Blob ID: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!messageId || !blobId) {
      console.log('❌ Message ID and Blob ID are required');
      return null;
    }
    
    console.log('⏳ Retrieving message...');
    
    const message = await conversationService.getMessage(messageId, blobId);
    
    if (!message) {
      console.log('❌ Message not found or could not be decrypted');
      return null;
    }
    
    console.log('✅ Message retrieved successfully!');
    console.log(`🆔 Message ID: ${message.id}`);
    console.log(`💬 Type: ${message.type}`);
    console.log(`💬 Content: "${message.content}"`);
    console.log(`👤 Sender: ${message.sender}`);
    console.log(`📅 Timestamp: ${message.timestamp}`);
    
    if (message.metadata && Object.keys(message.metadata).length > 0) {
      console.log('📊 Metadata:');
      Object.entries(message.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    return message;
  } catch (error) {
    console.error('❌ Failed to retrieve message:', error.message);
    return null;
  }
}

// Save storage index
async function saveStorageIndex(conversationService) {
  console.log('\n💾 Save Storage Index');
  console.log('=====================');
  
  try {
    console.log('⏳ Saving storage index...');
    
    const result = await conversationService.saveStorageIndex();
    
    console.log('✅ Storage index saved successfully!');
    console.log(`📋 Blob ID: ${result.blobId}`);
    console.log(`📅 Timestamp: ${result.timestamp}`);
    console.log(`📏 Size: ${result.size} bytes`);
    
    return result.blobId;
  } catch (error) {
    console.error('❌ Failed to save storage index:', error.message);
    return null;
  }
}

// Load storage index
async function loadStorageIndex(conversationService) {
  console.log('\n📂 Load Storage Index');
  console.log('=====================');
  
  try {
    // Get blob ID from user
    const blobId = await new Promise((resolve) => {
      rl.question('📋 Enter the Storage Index Blob ID: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!blobId) {
      console.log('❌ Blob ID cannot be empty');
      return null;
    }
    
    console.log('⏳ Loading storage index...');
    
    const success = await conversationService.loadStorageIndex(blobId);
    
    if (success) {
      console.log('✅ Storage index loaded successfully!');
      console.log(`📋 Blob ID: ${blobId}`);
      
      // Show loaded conversations
      const conversations = await conversationService.getUserConversations();
      console.log(`📊 Loaded ${conversations.length} conversations`);
      
      return blobId;
    } else {
      console.log('❌ Failed to load storage index');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to load storage index:', error.message);
    return null;
  }
}

// Display all messages in a conversation
async function displayConversationMessages(conversationId, conversationService) {
  console.log('\n📋 Displaying All Messages in Conversation');
  console.log('==========================================');
  
  try {
    console.log(`🆔 Conversation ID: ${conversationId}`);
    
    // Get all message IDs for this conversation from the storage index
    const messageIds = conversationService.storageIndex.getConversationMessages(conversationId);
    
    if (messageIds.length === 0) {
      console.log('📭 No messages found in this conversation');
      return;
    }
    
    console.log(`📊 Found ${messageIds.length} messages in conversation`);
    console.log('📋 Retrieving and displaying messages...\n');
    
    // Retrieve and display each message
    for (let i = 0; i < messageIds.length; i++) {
      const messageId = messageIds[i];
      const blobId = conversationService.storageIndex.getMessageBlobId(messageId);
      
      if (!blobId) {
        console.log(`⚠️  Message ${messageId} not found in storage index`);
        continue;
      }
      
      console.log(`📨 Message ${i + 1}/${messageIds.length}:`);
      console.log('─'.repeat(50));
      
      try {
        const message = await conversationService.getMessage(messageId, blobId);
        
        if (message) {
          console.log(`🆔 Message ID: ${message.id}`);
          console.log(`💬 Type: ${message.type}`);
          console.log(`💬 Content: "${message.content}"`);
          console.log(`👤 Sender: ${message.sender}`);
          console.log(`📅 Timestamp: ${message.timestamp}`);
          
          if (message.metadata && Object.keys(message.metadata).length > 0) {
            console.log('📊 Metadata:');
            Object.entries(message.metadata).forEach(([key, value]) => {
              console.log(`   ${key}: ${value}`);
            });
          }
        } else {
          console.log(`❌ Failed to retrieve message ${messageId}`);
        }
      } catch (error) {
        console.log(`❌ Error retrieving message ${messageId}: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('✅ All messages displayed successfully!');
    
  } catch (error) {
    console.error('❌ Error displaying conversation messages:', error.message);
  }
}

// Display conversation messages (interactive version)
async function displayConversationMessagesInteractive(conversationService) {
  console.log('\n📋 Display Conversation Messages');
  console.log('===============================');
  
  try {
    // Get conversation ID from user
    const conversationId = await new Promise((resolve) => {
      rl.question('🆔 Enter the Conversation ID: ', (input) => {
        resolve(input.trim());
      });
    });
    
    if (!conversationId) {
      console.log('❌ Conversation ID cannot be empty');
      return;
    }
    
    await displayConversationMessages(conversationId, conversationService);
    
  } catch (error) {
    console.error('❌ Error displaying conversation messages:', error.message);
  }
}

// Demo function that creates conversation and sends different types of messages
async function runDemo(conversationService) {
  console.log('\n🎬 Conversation Demo');
  console.log('===================');
  
  try {
    // Step 1: Create conversation
    console.log('Step 1: Creating conversation...');
    const conversationId = await createConversation(conversationService);
    if (!conversationId) {
      console.log('❌ Demo failed at conversation creation');
      return;
    }
    
    // Wait a moment for blob processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Send text message
    console.log('\nStep 2: Sending text message...');
    const textMessageId = await sendTextMessage(conversationId, conversationService);
    if (!textMessageId) {
      console.log('❌ Demo failed at text message');
      return;
    }
    
    // Wait a moment for blob processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Send payment message
    console.log('\nStep 3: Sending payment message...');
    const paymentMessageId = await sendPaymentMessage(conversationId, conversationService);
    if (!paymentMessageId) {
      console.log('❌ Demo failed at payment message');
      return;
    }
    
    // Wait a moment for blob processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Send payment request
    console.log('\nStep 4: Sending payment request...');
    const requestMessageId = await sendPaymentRequestMessage(conversationId, conversationService);
    if (!requestMessageId) {
      console.log('❌ Demo failed at payment request');
      return;
    }
    
    // Wait a moment for blob processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Display all messages in the conversation
    console.log('\nStep 5: Displaying all messages in the conversation...');
    await displayConversationMessages(conversationId, conversationService);
    
    console.log('\n🎉 Demo completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Conversation ID: ${conversationId}`);
    console.log(`   Text Message ID: ${textMessageId}`);
    console.log(`   Payment Message ID: ${paymentMessageId}`);
    console.log(`   Payment Request ID: ${requestMessageId}`);
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Interactive menu function
async function showMenu() {
  console.log('\n🔐 Walrus Structured Conversation App');
  console.log('=====================================');
  console.log('1. 💬 Create a new conversation');
  console.log('2. 📝 Send a text message');
  console.log('3. 💰 Send a payment message');
  console.log('4. 📋 Send a payment request');
  console.log('5. 📥 Retrieve a message');
  console.log('6. 📋 Display conversation messages');
  console.log('7. 💾 Save storage index');
  console.log('8. 📂 Load storage index');
  console.log('9. 🎬 Run full demo');
  console.log('10. ❌ Exit');
  
  const choice = await new Promise((resolve) => {
    rl.question('\nSelect an option (1-10): ', (input) => {
      resolve(input.trim());
    });
  });
  
  return choice;
}

// Main interactive application flow
async function main() {
  console.log('🚀 Walrus Structured Conversation App Example');
  console.log('=============================================');
  
  // Validate configuration
  validateConfig();
  
  // Create a single conversation service instance to maintain storage index
  const conversationService = new ConversationService(config);
  let currentConversationId = null;
  
  try {
    while (true) {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          currentConversationId = await createConversation(conversationService);
          break;
        case '2':
          if (!currentConversationId) {
            console.log('❌ Please create a conversation first (option 1)');
          } else {
            await sendTextMessage(currentConversationId, conversationService);
          }
          break;
        case '3':
          if (!currentConversationId) {
            console.log('❌ Please create a conversation first (option 1)');
          } else {
            await sendPaymentMessage(currentConversationId, conversationService);
          }
          break;
        case '4':
          if (!currentConversationId) {
            console.log('❌ Please create a conversation first (option 1)');
          } else {
            await sendPaymentRequestMessage(currentConversationId, conversationService);
          }
          break;
        case '5':
          await retrieveMessage(conversationService);
          break;
        case '6':
          await displayConversationMessagesInteractive(conversationService);
          break;
        case '7':
          await saveStorageIndex(conversationService);
          break;
        case '8':
          await loadStorageIndex(conversationService);
          break;
        case '9':
          await runDemo(conversationService);
          break;
        case '10':
          console.log('\n👋 Goodbye!');
          rl.close();
          process.exit(0);
          break;
        default:
          console.log('❌ Invalid option. Please select 1-10.');
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
  console.log(`\nWalrus Structured Conversation App Example\n\nUsage:\n  node conversation-example.js                    # Run the interactive app\n  node conversation-example.js --help            # Show this help message\n\nEnvironment Variables:\n  SENDER_WALLET_ADDRESS          # Your Sui wallet address (required)\n  RECEIVER_WALLET_ADDRESS        # Recipient's wallet address (required)\n  WALRUS_AGGREGATOR_URL          # Walrus aggregator URL (optional, default: https://aggregator.walrus-testnet.walrus.space)\n  WALRUS_PUBLISHER_URL           # Walrus publisher URL (optional, default: https://publisher.walrus-testnet.walrus.space)\n  SUI_NETWORK                    # Sui network (optional, default: testnet)\n\nFeatures:\n  - Create conversations between participants\n  - Send text messages\n  - Send payment messages with metadata\n  - Send payment request messages\n  - Retrieve and decrypt messages\n  - Display all messages in a conversation\n  - Save and load storage index for persistence\n  - Structured data models with validation\n  - Full demo with message display\n\nExample:\n  SENDER_WALLET_ADDRESS=0x123... RECEIVER_WALLET_ADDRESS=0x456... node conversation-example.js\n`);
  process.exit(0);
}

// Run the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ConversationService, config }; 