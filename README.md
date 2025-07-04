# Walrus Encrypted Messaging App Example

A complete example of a secure messaging application that uses **Walrus decentralized storage** and **@mysten/seal encryption** to store encrypted messages that only the intended recipient can decrypt.

## 🚀 Features

- **End-to-end encryption** using `@mysten/seal`
- **Decentralized storage** on Walrus network (Testnet)
- **Recipient-specific encryption** - only the intended recipient can decrypt
- **Message integrity verification**
- **Metadata retrieval** without decryption
- **Complete example workflow** from sending to receiving

## 📋 Prerequisites

Before running this example, you need:

1. **Sui Testnet Wallet** with SUI tokens for gas fees
2. **WAL tokens** for Walrus storage costs (Testnet)
3. **Node.js** (version 18 or higher)
4. **Two wallet addresses** (sender and receiver)

## 🛠️ Installation

1. **Clone or download this example**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your wallet addresses:
   ```env
   SENDER_WALLET_ADDRESS=0x1234567890abcdef...
   RECEIVER_WALLET_ADDRESS=0xfedcba0987654321...
   ```

## 🔧 Configuration

### Required Environment Variables

- `SENDER_WALLET_ADDRESS` - Your Sui Testnet wallet address (the sender)
- `RECEIVER_WALLET_ADDRESS` - The recipient's wallet address

### Optional Environment Variables

- `WALRUS_AGGREGATOR_URL` - Walrus aggregator endpoint (default: testnet)
- `WALRUS_PUBLISHER_URL` - Walrus publisher endpoint (default: testnet)
- `SUI_NETWORK` - Sui network (default: testnet)

## 🚀 Usage

### Run the Complete Example

```bash
node index.js
```

This will:
1. Send an encrypted message to the receiver
2. Retrieve and decrypt the message
3. Verify message integrity
4. Display metadata

### Get Help

```bash
node index.js --help
```

## 📚 How It Works

### 1. Message Encryption (`src/encryption-service.js`)

```javascript
// Encrypt a message for a specific recipient
const encryptedData = await encryptionService.encryptMessage(
  "Hello, secret message!",
  recipientAddress,
  senderAddress
);
```

The encryption process:
- Generates a random AES-GCM encryption key
- Encrypts the message with the key
- Uses `@mysten/seal` to encrypt the key for the recipient
- Only the recipient can decrypt the key and access the message

### 2. Walrus Storage (`src/walrus-client.js`)

```javascript
// Store encrypted data on Walrus
const result = await walrusClient.storeBlob(
  serializedEncryptedData,
  senderAddress
);
```

The storage process:
- Serializes the encrypted message data
- Stores it on Walrus decentralized storage (Testnet)
- Returns a blob ID for later retrieval

### 3. Message Retrieval (`src/messaging-service.js`)

```javascript
// Retrieve and decrypt a message
const message = await messagingService.retrieveMessage(
  blobId,
  recipientAddress,
  senderAddress
);
```

The retrieval process:
- Downloads the encrypted data from Walrus
- Verifies sender and recipient addresses
- Decrypts the message using the recipient's private key
- Returns the original message

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Sender App    │    │  Walrus Testnet  │    │ Receiver App    │
│                 │    │                  │    │                 │
│ 1. Encrypt      │───▶│ 2. Store Blob    │───▶│ 3. Retrieve     │
│    Message      │    │                  │    │    Blob         │
│                 │    │                  │    │                 │
│ 4. Get Blob ID  │◀───│ 5. Return ID     │◀───│ 6. Decrypt      │
│                 │    │                  │    │    Message      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔐 Security Features

- **End-to-end encryption** - Messages are encrypted before storage
- **Recipient-specific keys** - Only the intended recipient can decrypt
- **Address verification** - Sender and recipient addresses are verified
- **Integrity checks** - Message ownership and integrity are verified
- **Decentralized storage** - No single point of failure (Testnet)

## 📖 API Reference

### MessagingService

```javascript
const messagingService = new MessagingService(config);

// Send an encrypted message
await messagingService.sendMessage(message, recipientAddress);

// Retrieve and decrypt a message
await messagingService.retrieveMessage(blobId, recipientAddress, senderAddress);

// Get message metadata
await messagingService.getMessageMetadata(blobId);

// Verify message integrity
await messagingService.verifyMessage(blobId, expectedOwner);
```

### EncryptionService

```javascript
const encryptionService = new EncryptionService();

// Encrypt a message
await encryptionService.encryptMessage(message, recipientAddress, senderAddress);

// Decrypt a message
await encryptionService.decryptMessage(encryptedData, recipientAddress, senderAddress);
```

### WalrusClient

```javascript
const walrusClient = new WalrusClient(config);

// Store data on Walrus
await walrusClient.storeBlob(data, owner);

// Retrieve data from Walrus
await walrusClient.retrieveBlob(blobId);

// Get blob metadata
await walrusClient.getBlobMetadata(blobId);
```

## 🧪 Testing

To test the application:

1. **Set up two different wallet addresses** in your `.env` file (Testnet)
2. **Ensure both wallets have SUI and WAL tokens (Testnet)**
3. **Run the example:**
   ```bash
   node index.js
   ```

## 🔧 Troubleshooting

### Common Issues

1. **"SENDER_WALLET_ADDRESS is required"**
   - Make sure you've set the environment variables in `.env`

2. **"Failed to store blob"**
   - Check your internet connection
   - Ensure you have WAL tokens for storage costs (Testnet)
   - Verify Walrus Testnet network is accessible

3. **"Failed to retrieve message"**
   - Check if the blob ID is correct
   - Verify sender and recipient addresses match

4. **"Message verification failed"**
   - The blob may not be owned by the expected address
   - Check if the blob ID is correct

### Getting Help

- Check the [Walrus documentation](https://docs.wal.app)
- Review the [@mysten/seal documentation](https://docs.sui.io/build/zk_login)
- Ensure you have the latest dependencies

## 📄 License

This example is provided as-is for educational purposes. See the LICENSE file for details.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note:** This is an example implementation for Walrus Testnet. For production use, consider additional security measures, error handling, and proper key management. 