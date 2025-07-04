/**
 * Messaging Service
 * Combines Walrus storage with encryption for secure messaging
 */

import { WalrusClient } from './walrus-client.js';
import { EncryptionService } from './encryption-service.js';

export class MessagingService {
  constructor(config) {
    this.walrusClient = new WalrusClient(config.walrus);
    this.encryptionService = new EncryptionService();
    this.senderAddress = config.senderAddress;
  }

  /**
   * Send an encrypted message
   * @param {string} message - The message to send
   * @param {string} recipientAddress - The recipient's wallet address
   * @returns {Promise<Object>} - Message metadata including blob ID
   */
  async sendMessage(message, recipientAddress) {
    try {
      console.log(`Sending encrypted message to ${recipientAddress}`);
      
      // Encrypt the message
      const encryptedData = await this.encryptionService.encryptMessage(
        message,
        recipientAddress,
        this.senderAddress
      );
      
      // Serialize the encrypted data for storage
      const serializedData = this.encryptionService.serializeEncryptedData(encryptedData);
      
      // Store the encrypted message on Walrus
      const storageResult = await this.walrusClient.storeBlob(
        serializedData,
        this.senderAddress
      );
      
      console.log(`Message sent successfully! Blob ID: ${storageResult.blobId}`);
      
      return {
        blobId: storageResult.blobId,
        sender: this.senderAddress,
        recipient: recipientAddress,
        timestamp: storageResult.timestamp,
        size: storageResult.size
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt a message
   * @param {string} blobId - The blob ID of the message
   * @param {string} recipientAddress - The recipient's wallet address (for verification)
   * @param {string} senderAddress - The sender's wallet address (for verification)
   * @returns {Promise<Object>} - The decrypted message with metadata
   */
  async retrieveMessage(blobId, recipientAddress, senderAddress) {
    try {
      console.log(`Retrieving message with blob ID: ${blobId}`);
      
      // Retrieve the encrypted data from Walrus
      const serializedData = await this.walrusClient.retrieveBlob(blobId);
      
      // Deserialize the encrypted data
      const encryptedData = this.encryptionService.deserializeEncryptedData(serializedData);
      
      // Decrypt the message
      const decryptedMessage = await this.encryptionService.decryptMessage(
        encryptedData,
        recipientAddress,
        senderAddress
      );
      
      console.log(`Message retrieved and decrypted successfully`);
      
      return {
        message: decryptedMessage,
        sender: encryptedData.sender,
        recipient: encryptedData.recipient,
        timestamp: encryptedData.timestamp,
        blobId: blobId
      };
    } catch (error) {
      console.error('Error retrieving message:', error);
      throw error;
    }
  }

  /**
   * Get message metadata without decrypting
   * @param {string} blobId - The blob ID of the message
   * @returns {Promise<Object>} - Message metadata
   */
  async getMessageMetadata(blobId) {
    try {
      const metadata = await this.walrusClient.getBlobMetadata(blobId);
      return metadata;
    } catch (error) {
      console.error('Error getting message metadata:', error);
      throw error;
    }
  }

  /**
   * List messages for a specific address (sender or recipient)
   * Note: This is a simplified implementation. In a real app, you'd need
   * to maintain an index of messages or use Walrus metadata features
   * @param {string} address - The wallet address to search for
   * @returns {Promise<Array>} - List of message metadata
   */
  async listMessages(address) {
    try {
      console.log(`Listing messages for address: ${address}`);
      
      // This is a placeholder implementation
      // In a real application, you would need to:
      // 1. Maintain an index of messages per address
      // 2. Use Walrus metadata or tags to search for messages
      // 3. Implement pagination for large message lists
      
      console.log('Message listing not fully implemented in this example');
      return [];
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    }
  }

  /**
   * Verify message integrity and ownership
   * @param {string} blobId - The blob ID to verify
   * @param {string} expectedOwner - The expected owner address
   * @returns {Promise<boolean>} - True if verification passes
   */
  async verifyMessage(blobId, expectedOwner) {
    try {
      const metadata = await this.walrusClient.getBlobMetadata(blobId);
      return metadata.owner === expectedOwner;
    } catch (error) {
      console.error('Error verifying message:', error);
      return false;
    }
  }
} 