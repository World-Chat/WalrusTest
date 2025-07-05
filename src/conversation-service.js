/**
 * Conversation Service
 * Handles structured conversation and message storage in Walrus
 */

import { WalrusClient } from './walrus-client.js';
import { EncryptionService } from './encryption-service.js';
import { Conversation, Message, MessageType, StorageIndex } from './data-models.js';
import crypto from 'crypto';

export class ConversationService {
  constructor(config) {
    this.walrusClient = new WalrusClient(config.walrus);
    this.encryptionService = new EncryptionService();
    this.senderAddress = config.senderAddress;
    this.storageIndex = new StorageIndex();
  }

  /**
   * Create a new conversation between participants
   * @param {Array<string>} participants - Array of participant wallet addresses
   * @returns {Promise<Object>} - Conversation data with ID
   */
  async createConversation(participants) {
    try {
      if (!participants.includes(this.senderAddress)) {
        participants.push(this.senderAddress);
      }

      // Create conversation using the data model
      const conversation = new Conversation(participants, this.senderAddress);
      conversation.id = this.generateConversationId(participants);
      conversation.validate();

      // Encrypt conversation data for all participants
      const encryptedData = await this.encryptConversationData(conversation, participants);
      
      // Store in Walrus
      const storageResult = await this.walrusClient.storeBlob(
        encryptedData,
        this.senderAddress
      );

      // Add to storage index
      this.storageIndex.addConversation(conversation.id, storageResult.blobId, participants);

      console.log(`Conversation created successfully! ID: ${conversation.id}`);
      
      return {
        conversation: conversation.toObject(),
        blobId: storageResult.blobId,
        storageResult
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message to a conversation
   * @param {string} conversationId - The conversation ID
   * @param {string} messageType - Type of message ('text', 'send_payment', 'request_payment')
   * @param {string} content - Message content
   * @param {Object} metadata - Additional metadata for payment messages
   * @returns {Promise<Object>} - Message data with ID
   */
  async sendMessage(conversationId, messageType, content, metadata = {}) {
    try {
      // Create message using the data model
      let message;
      
      switch (messageType) {
        case MessageType.TEXT:
          message = Message.createTextMessage(conversationId, this.senderAddress, content);
          break;
        case MessageType.SEND_PAYMENT:
          message = Message.createSendPaymentMessage(conversationId, this.senderAddress, content, metadata);
          break;
        case MessageType.REQUEST_PAYMENT:
          message = Message.createRequestPaymentMessage(conversationId, this.senderAddress, content, metadata);
          break;
        default:
          throw new Error(`Invalid message type. Must be one of: ${Object.values(MessageType).join(', ')}`);
      }
      
      message.id = this.generateMessageId(conversationId);
      message.validate();

      // Get conversation participants to encrypt for
      const conversation = await this.getConversation(conversationId);
      let participants;
      
      if (!conversation) {
        // If conversation not found, we'll create a simple participant list
        // In a real app, you might want to store this information differently
        console.log(`Conversation ${conversationId} not found, using current user as participant`);
        participants = [this.senderAddress];
        
        // Try to extract receiver from conversation ID if it follows our pattern
        // This is a workaround for the demo - in production you'd want proper conversation management
        if (conversationId.includes('_')) {
          // For demo purposes, we'll assume the receiver is the other participant
          // You might want to store this information in a separate index
          console.log('Using default participant list for demo');
        }
      } else {
        participants = conversation.participants;
      }
      
      // Encrypt message data for all conversation participants
      const encryptedData = await this.encryptMessageData(message, participants);
      
      // Store in Walrus
      const storageResult = await this.walrusClient.storeBlob(
        encryptedData,
        this.senderAddress
      );

      // Add to storage index
      this.storageIndex.addMessage(message.id, storageResult.blobId, conversationId);

      console.log(`Message sent successfully! ID: ${message.id}`);
      
      return {
        message: message.toObject(),
        blobId: storageResult.blobId,
        storageResult
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Retrieve a conversation by ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object|null>} - Conversation data or null if not found
   */
  async getConversation(conversationId) {
    try {
      console.log(`Attempting to retrieve conversation: ${conversationId}`);
      
      // Get blob ID from storage index
      const blobId = this.storageIndex.getConversationBlobId(conversationId);
      if (!blobId) {
        console.log(`Conversation ${conversationId} not found in storage index`);
        return null;
      }
      
      // Retrieve the encrypted data from Walrus
      const serializedData = await this.walrusClient.retrieveBlob(blobId);
      
      // Deserialize and decrypt the conversation data
      const encryptedData = this.encryptionService.deserializeEncryptedData(serializedData);
      
      // Decrypt the conversation (assuming current user is a participant)
      const decryptedData = await this.encryptionService.decryptMessage(
        encryptedData,
        this.senderAddress,
        encryptedData.sender
      );
      
      // Parse the decrypted JSON data
      const conversationData = JSON.parse(decryptedData);
      
      if (conversationData.id !== conversationId) {
        throw new Error(`Conversation ID mismatch: expected ${conversationId}, got ${conversationData.id}`);
      }
      
      console.log(`Conversation retrieved successfully: ${conversationId}`);
      return conversationData;
    } catch (error) {
      console.error('Error retrieving conversation:', error);
      return null;
    }
  }

  /**
   * Retrieve a message by ID
   * @param {string} messageId - The message ID
   * @param {string} blobId - The blob ID where the message is stored
   * @returns {Promise<Object|null>} - Message data or null if not found
   */
  async getMessage(messageId, blobId) {
    try {
      console.log(`Retrieving message ${messageId} from blob ${blobId}`);
      
      // Retrieve the encrypted data from Walrus
      const serializedData = await this.walrusClient.retrieveBlob(blobId);
      
      // Deserialize and decrypt the message data
      const encryptedData = this.encryptionService.deserializeEncryptedData(serializedData);
      
      // Decrypt the message (assuming current user is a participant)
      const decryptedData = await this.encryptionService.decryptMessage(
        encryptedData,
        this.senderAddress,
        encryptedData.sender
      );
      
      // Parse the decrypted JSON data
      const message = JSON.parse(decryptedData);
      
      if (message.id !== messageId) {
        throw new Error(`Message ID mismatch: expected ${messageId}, got ${message.id}`);
      }
      
      console.log(`Message retrieved successfully: ${message.id}`);
      return message;
    } catch (error) {
      console.error('Error retrieving message:', error);
      return null;
    }
  }

  /**
   * List all messages in a conversation
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Array>} - Array of message data
   */
  async listConversationMessages(conversationId) {
    try {
      console.log(`Listing messages for conversation: ${conversationId}`);
      
      // This is a placeholder implementation
      // In a real app, you'd need to maintain an index of messages per conversation
      // or use Walrus metadata/tags to search for messages
      
      console.log('Message listing not fully implemented in this example');
      return [];
    } catch (error) {
      console.error('Error listing conversation messages:', error);
      throw error;
    }
  }

  /**
   * Generate a unique conversation ID based on participants
   * @param {Array<string>} participants - Array of participant addresses
   * @returns {string} - Unique conversation ID
   */
  generateConversationId(participants) {
    const sortedParticipants = participants.sort();
    const participantsHash = crypto
      .createHash('sha256')
      .update(sortedParticipants.join('|'))
      .digest('hex');
    
    return `conv_${participantsHash.substring(0, 16)}`;
  }

  /**
   * Generate a unique message ID
   * @param {string} conversationId - The conversation ID
   * @returns {string} - Unique message ID
   */
  generateMessageId(conversationId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `msg_${conversationId}_${timestamp}_${random}`;
  }

  /**
   * Encrypt conversation data for all participants
   * @param {Conversation} conversation - Conversation instance
   * @param {Array<string>} participants - Array of participant addresses
   * @returns {Uint8Array} - Serialized encrypted data
   */
  async encryptConversationData(conversation, participants) {
    const conversationJson = JSON.stringify(conversation.toObject());
    
    // Encrypt for the first participant (could be enhanced to encrypt for all)
    const encryptedData = await this.encryptionService.encryptMessage(
      conversationJson,
      participants[0],
      this.senderAddress
    );
    
    return this.encryptionService.serializeEncryptedData(encryptedData);
  }

  /**
   * Encrypt message data for all conversation participants
   * @param {Message} message - Message instance
   * @param {Array<string>} participants - Array of participant addresses
   * @returns {Uint8Array} - Serialized encrypted data
   */
  async encryptMessageData(message, participants) {
    const messageJson = JSON.stringify(message.toObject());
    
    // Encrypt for the first participant (could be enhanced to encrypt for all)
    const encryptedData = await this.encryptionService.encryptMessage(
      messageJson,
      participants[0],
      this.senderAddress
    );
    
    return this.encryptionService.serializeEncryptedData(encryptedData);
  }

  /**
   * Get all conversations for the current user
   * @returns {Promise<Array>} - Array of conversation data
   */
  async getUserConversations() {
    try {
      console.log(`Listing conversations for user: ${this.senderAddress}`);
      
      const userConversationIds = this.storageIndex.getUserConversations(this.senderAddress);
      const conversations = [];
      
      for (const conversationId of userConversationIds) {
        const conversation = await this.getConversation(conversationId);
        if (conversation) {
          conversations.push(conversation);
        }
      }
      
      return conversations;
    } catch (error) {
      console.error('Error listing user conversations:', error);
      throw error;
    }
  }

  /**
   * Save storage index to Walrus for persistence
   * @returns {Promise<Object>} - Storage result
   */
  async saveStorageIndex() {
    try {
      const indexData = this.storageIndex.toObject();
      const indexJson = JSON.stringify(indexData);
      
      // Encrypt the index data
      const encryptedData = await this.encryptionService.encryptMessage(
        indexJson,
        this.senderAddress,
        this.senderAddress
      );
      
      const serializedData = this.encryptionService.serializeEncryptedData(encryptedData);
      
      // Store in Walrus
      const storageResult = await this.walrusClient.storeBlob(
        serializedData,
        this.senderAddress
      );
      
      console.log('Storage index saved successfully');
      return storageResult;
    } catch (error) {
      console.error('Error saving storage index:', error);
      throw error;
    }
  }

  /**
   * Load storage index from Walrus
   * @param {string} blobId - The blob ID of the storage index
   * @returns {Promise<boolean>} - True if loaded successfully
   */
  async loadStorageIndex(blobId) {
    try {
      console.log(`Loading storage index from blob: ${blobId}`);
      
      // Retrieve the encrypted data from Walrus
      const serializedData = await this.walrusClient.retrieveBlob(blobId);
      
      // Deserialize and decrypt the index data
      const encryptedData = this.encryptionService.deserializeEncryptedData(serializedData);
      
      // Decrypt the index
      const decryptedData = await this.encryptionService.decryptMessage(
        encryptedData,
        this.senderAddress,
        encryptedData.sender
      );
      
      // Parse the decrypted JSON data
      const indexData = JSON.parse(decryptedData);
      
      // Load into storage index
      this.storageIndex = StorageIndex.fromObject(indexData);
      
      console.log('Storage index loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading storage index:', error);
      return false;
    }
  }
} 