# Walrus Structured Conversation App

This application demonstrates how to store structured conversation and message data in Walrus decentralized storage with proper typing and validation.

## Overview

The application implements a typed approach for storing conversations and messages in Walrus, with the following data structures:

### Conversation Model
```javascript
{
  id: string,                    // Unique conversation identifier
  participants: string[],        // Array of wallet addresses
  createdBy: string,            // Creator's wallet address
  createdAt: string,            // ISO timestamp
  updatedAt: string,            // ISO timestamp
  messageCount: number          // Number of messages in conversation
}
```

### Message Model
```javascript
{
  id: string,                   // Unique message identifier
  type: string,                 // 'text', 'send_payment', 'request_payment'
  conversationId: string,       // Reference to conversation
  sender: string,               // Sender's wallet address
  content: string,              // Message content
  metadata: object,             // Additional data (for payment messages)
  timestamp: string             // ISO timestamp
}
```

## Message Types

### 1. Text Messages
- **Type**: `'text'`
- **Content**: Plain text message
- **Metadata**: None required

### 2. Send Payment Messages
- **Type**: `'send_payment'`
- **Content**: Payment description
- **Metadata**: 
  - `amount`: Payment amount
  - `currency`: Currency code (e.g., 'USD', 'SUI')
  - `recipient`: Recipient wallet address
  - `transactionId`: Transaction identifier

### 3. Request Payment Messages
- **Type**: `'request_payment'`
- **Content**: Payment request description
- **Metadata**:
  - `amount`: Requested amount
  - `currency`: Currency code
  - `requestId`: Unique request identifier

## Features

- ✅ **Structured Data Models**: Type-safe conversation and message structures
- ✅ **Data Validation**: Built-in validation for all data models
- ✅ **Encryption**: End-to-end encryption for all stored data
- ✅ **Multiple Message Types**: Support for text, payment, and payment request messages
- ✅ **Conversation Management**: Create and manage conversations between participants
- ✅ **Metadata Support**: Rich metadata for payment-related messages
- ✅ **Interactive CLI**: User-friendly command-line interface

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file:
   ```bash
   cp env.example .env
   ```
4. Configure your environment variables in `.env`

## Configuration

Set the following environment variables in your `.env` file:

```bash
# Required
SENDER_WALLET_ADDRESS=0x123...    # Your Sui wallet address
RECEIVER_WALLET_ADDRESS=0x456...  # Recipient's wallet address

# Optional (defaults to testnet)
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
SUI_NETWORK=testnet
```

## Usage

### Run the Structured Conversation App

```bash
node conversation-example.js
```

### Available Commands

1. **Create a new conversation** - Start a conversation with participants
2. **Send a text message** - Send plain text messages
3. **Send a payment message** - Send payment notifications with metadata
4. **Send a payment request** - Request payments from participants
5. **Retrieve a message** - Decrypt and retrieve stored messages
6. **Run full demo** - Complete workflow demonstration

### Example Workflow

1. **Create Conversation**:
   ```bash
   # Creates a conversation between sender and receiver
   Conversation ID: conv_a1b2c3d4e5f6g7h8
   Participants: 0x123..., 0x456...
   ```

2. **Send Text Message**:
   ```bash
   Message ID: msg_conv_a1b2c3d4e5f6g7h8_1703123456789_abc123
   Content: "Hello! How are you?"
   Type: text
   ```

3. **Send Payment Message**:
   ```bash
   Message ID: msg_conv_a1b2c3d4e5f6g7h8_1703123456790_def456
   Content: "Payment for services"
   Type: send_payment
   Metadata: {
     amount: 100,
     currency: "USD",
     recipient: "0x456...",
     transactionId: "tx_123456"
   }
   ```

4. **Send Payment Request**:
   ```bash
   Message ID: msg_conv_a1b2c3d4e5f6g7h8_1703123456791_ghi789
   Content: "Please pay for the project"
   Type: request_payment
   Metadata: {
     amount: 500,
     currency: "SUI",
     requestId: "req_1703123456791_xyz789"
   }
   ```

## Data Models

### Conversation Class
```javascript
import { Conversation } from './src/data-models.js';

const conversation = new Conversation(participants, createdBy);
conversation.id = generateId();
conversation.validate(); // Validates the conversation data
```

### Message Class
```javascript
import { Message, MessageType } from './src/data-models.js';

// Text message
const textMessage = Message.createTextMessage(conversationId, sender, content);

// Payment message
const paymentMessage = Message.createSendPaymentMessage(
  conversationId, 
  sender, 
  description, 
  paymentData
);

// Payment request
const requestMessage = Message.createRequestPaymentMessage(
  conversationId, 
  sender, 
  description, 
  paymentData
);
```

## Storage Index

The application includes a `StorageIndex` class for maintaining references to stored conversations and messages:

```javascript
import { StorageIndex } from './src/data-models.js';

const index = new StorageIndex();

// Add conversation to index
index.addConversation(conversationId, blobId, participants);

// Add message to index
index.addMessage(messageId, blobId, conversationId);

// Get references
const blobId = index.getConversationBlobId(conversationId);
const messageIds = index.getConversationMessages(conversationId);
```

## Security Features

- **End-to-End Encryption**: All data is encrypted before storage
- **Participant-Based Encryption**: Messages are encrypted for conversation participants
- **Data Validation**: All data models include validation rules
- **Secure ID Generation**: Cryptographically secure ID generation

## API Reference

### ConversationService

```javascript
import { ConversationService } from './src/conversation-service.js';

const service = new ConversationService(config);

// Create conversation
const result = await service.createConversation(participants);

// Send message
const result = await service.sendMessage(conversationId, messageType, content, metadata);

// Retrieve message
const message = await service.getMessage(messageId, blobId);

// List messages
const messages = await service.listConversationMessages(conversationId);
```

### Data Models

```javascript
import { 
  Conversation, 
  Message, 
  MessageType, 
  StorageIndex 
} from './src/data-models.js';

// Create instances
const conversation = new Conversation(participants, createdBy);
const message = new Message(conversationId, sender, type, content, metadata);
const index = new StorageIndex();

// Validate data
conversation.validate();
message.validate();

// Convert to/from objects
const obj = conversation.toObject();
const instance = Conversation.fromObject(obj);
```

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: Data model validation failures
- **Network Errors**: Walrus network connectivity issues
- **Encryption Errors**: Encryption/decryption failures
- **Storage Errors**: Blob storage and retrieval issues

## Troubleshooting

### Common Issues

1. **Configuration Errors**:
   - Ensure wallet addresses are correct
   - Verify environment variables are set

2. **Network Issues**:
   - Check internet connectivity
   - Verify Walrus network accessibility
   - Ensure sufficient SUI and WAL tokens

3. **Encryption Issues**:
   - Verify wallet addresses match encryption keys
   - Check that sender is a conversation participant

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=true node conversation-example.js
```

## Development

### Project Structure

```
src/
├── conversation-service.js    # Main conversation service
├── data-models.js            # Data models and validation
├── walrus-client.js          # Walrus network client
├── encryption-service.js     # Encryption utilities
└── messaging-service.js      # Legacy messaging service

conversation-example.js       # Interactive CLI application
index.js                      # Legacy simple messaging app
```

### Adding New Message Types

1. Add the new type to `MessageType` enum in `data-models.js`
2. Create a factory method in the `Message` class
3. Add validation rules if needed
4. Update the conversation service to handle the new type

### Extending Data Models

1. Add new properties to the model classes
2. Update validation methods
3. Modify `toObject()` and `fromObject()` methods
4. Update the conversation service accordingly

## License

This project is licensed under the MIT License. 