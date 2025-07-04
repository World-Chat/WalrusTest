/**
 * Encryption Service using Web Crypto API
 * Handles message encryption and decryption for secure messaging
 * Note: This is a simplified implementation for demonstration purposes
 * In a real application, you would use @mysten/seal for recipient-specific encryption
 */

export class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  /**
   * Generate a random encryption key
   * @returns {Promise<CryptoKey>} - The generated encryption key
   */
  async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export a CryptoKey to raw bytes
   * @param {CryptoKey} key - The key to export
   * @returns {Promise<Uint8Array>} - The exported key bytes
   */
  async exportKey(key) {
    return new Uint8Array(await crypto.subtle.exportKey('raw', key));
  }

  /**
   * Import a key from raw bytes
   * @param {Uint8Array} keyBytes - The key bytes to import
   * @returns {Promise<CryptoKey>} - The imported key
   */
  async importKey(keyBytes) {
    return await crypto.subtle.importKey(
      'raw',
      keyBytes,
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a message using Web Crypto API
   * @param {string} message - The message to encrypt
   * @param {string} recipientAddress - The recipient's wallet address
   * @param {string} senderAddress - The sender's wallet address
   * @returns {Promise<Object>} - Encrypted message data
   */
  async encryptMessage(message, recipientAddress, senderAddress) {
    try {
      console.log(`Encrypting message for recipient: ${recipientAddress}`);
      
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message);
      
      // Generate a random encryption key
      const encryptionKey = await this.generateKey();
      const keyBytes = await this.exportKey(encryptionKey);
      
      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the message
      const encryptedMessage = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        encryptionKey,
        messageBytes
      );
      
      // In a real implementation with @mysten/seal, you would:
      // 1. Use the seal function to encrypt the key for the recipient
      // 2. Only the recipient could decrypt the key using their private key
      // 3. Then use the decrypted key to decrypt the message
      
      // For this demonstration, we'll simulate the sealed key
      // (In reality, this would be the result of seal(keyBytes, recipientAddress, senderAddress))
      const sealedKey = keyBytes; // This is just a simulation
      
      // Create the encrypted message structure
      const encryptedData = {
        encryptedMessage: new Uint8Array(encryptedMessage),
        sealedKey: sealedKey,
        iv: iv,
        sender: senderAddress,
        recipient: recipientAddress,
        timestamp: new Date().toISOString()
      };
      
      console.log('Message encrypted successfully');
      return encryptedData;
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  /**
   * Decrypt a message using Web Crypto API
   * @param {Object} encryptedData - The encrypted message data
   * @param {string} recipientAddress - The recipient's wallet address (for verification)
   * @param {string} senderAddress - The sender's wallet address (for verification)
   * @returns {Promise<string>} - The decrypted message
   */
  async decryptMessage(encryptedData, recipientAddress, senderAddress) {
    try {
      console.log(`Decrypting message from sender: ${senderAddress}`);
      
      // Verify the message is intended for this recipient
      if (encryptedData.recipient !== recipientAddress) {
        throw new Error('Message is not intended for this recipient');
      }
      
      if (encryptedData.sender !== senderAddress) {
        throw new Error('Message sender verification failed');
      }
      
      // In a real implementation with @mysten/seal, you would:
      // 1. Use the unseal function with the recipient's private key to get the encryption key
      // 2. Then use that key to decrypt the message
      
      // For this demonstration, we'll simulate the unsealing process
      const keyBytes = await this.unsealKey(encryptedData.sealedKey, recipientAddress);
      const encryptionKey = await this.importKey(keyBytes);
      
      // Decrypt the message
      const decryptedBytes = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: encryptedData.iv
        },
        encryptionKey,
        encryptedData.encryptedMessage
      );
      
      const decryptedMessage = new TextDecoder().decode(decryptedBytes);
      console.log('Message decrypted successfully');
      
      return decryptedMessage;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  /**
   * Unseal a key (simulated for this example)
   * In a real implementation, this would use the recipient's private key with @mysten/seal
   * @param {Uint8Array} sealedKey - The sealed key
   * @param {string} recipientAddress - The recipient's address
   * @returns {Promise<Uint8Array>} - The unsealed key bytes
   */
  async unsealKey(sealedKey, recipientAddress) {
    // This is a simplified simulation
    // In reality, you would use the recipient's private key to unseal
    console.log(`Unsealing key for recipient: ${recipientAddress}`);
    
    // For demonstration purposes, we'll return the sealed key as-is
    // In a real implementation, you would use the unseal function from @mysten/seal
    return sealedKey;
  }

  /**
   * Serialize encrypted data for storage
   * @param {Object} encryptedData - The encrypted message data
   * @returns {Uint8Array} - Serialized data
   */
  serializeEncryptedData(encryptedData) {
    const data = {
      encryptedMessage: Array.from(encryptedData.encryptedMessage),
      sealedKey: Array.from(encryptedData.sealedKey),
      iv: Array.from(encryptedData.iv),
      sender: encryptedData.sender,
      recipient: encryptedData.recipient,
      timestamp: encryptedData.timestamp
    };
    
    return new TextEncoder().encode(JSON.stringify(data));
  }

  /**
   * Deserialize encrypted data from storage
   * @param {Uint8Array} serializedData - The serialized data
   * @returns {Object} - The encrypted message data
   */
  deserializeEncryptedData(serializedData) {
    const jsonString = new TextDecoder().decode(serializedData);
    const data = JSON.parse(jsonString);
    
    return {
      encryptedMessage: new Uint8Array(data.encryptedMessage),
      sealedKey: new Uint8Array(data.sealedKey),
      iv: new Uint8Array(data.iv),
      sender: data.sender,
      recipient: data.recipient,
      timestamp: data.timestamp
    };
  }
} 