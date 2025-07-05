/**
 * Data Models for Walrus Storage
 * Defines the structure for conversations and messages
 */

import crypto from 'crypto';

/**
 * Conversation Model
 * Represents an open conversation between participants
 */
export class Conversation {
  constructor(participants, createdBy) {
    this.id = null; // Will be generated
    this.participants = participants.sort(); // Array of wallet addresses
    this.createdBy = createdBy; // Wallet address of creator
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.messageCount = 0;
  }

  /**
   * Validate conversation data
   * @returns {boolean} - True if valid
   */
  validate() {
    if (!this.participants || !Array.isArray(this.participants) || this.participants.length < 2) {
      throw new Error('Conversation must have at least 2 participants');
    }
    
    if (!this.createdBy) {
      throw new Error('Conversation must have a creator');
    }
    
    if (!this.participants.includes(this.createdBy)) {
      throw new Error('Creator must be a participant');
    }
    
    return true;
  }

  /**
   * Convert to plain object
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      participants: this.participants,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      messageCount: this.messageCount
    };
  }

  /**
   * Create from plain object
   * @param {Object} data - Plain object data
   * @returns {Conversation} - Conversation instance
   */
  static fromObject(data) {
    const conversation = new Conversation(data.participants, data.createdBy);
    conversation.id = data.id;
    conversation.createdAt = data.createdAt;
    conversation.updatedAt = data.updatedAt;
    conversation.messageCount = data.messageCount;
    return conversation;
  }
}

/**
 * Message Types Enum
 */
export const MessageType = {
  TEXT: 'text',
  SEND_PAYMENT: 'send_payment',
  REQUEST_PAYMENT: 'request_payment'
};

/**
 * Message Model
 * Represents an individual message in a conversation
 */
export class Message {
  constructor(conversationId, sender, type, content, metadata = {}) {
    this.id = null; // Will be generated
    this.type = type; // 'text', 'send_payment', 'request_payment'
    this.conversationId = conversationId;
    this.sender = sender; // Wallet address of sender
    this.content = content; // Message content
    this.metadata = metadata; // Additional data for payment messages
    this.timestamp = new Date().toISOString();
  }

  /**
   * Validate message data
   * @returns {boolean} - True if valid
   */
  validate() {
    if (!Object.values(MessageType).includes(this.type)) {
      throw new Error(`Invalid message type. Must be one of: ${Object.values(MessageType).join(', ')}`);
    }
    
    if (!this.conversationId) {
      throw new Error('Message must have a conversation ID');
    }
    
    if (!this.sender) {
      throw new Error('Message must have a sender');
    }
    
    if (!this.content) {
      throw new Error('Message must have content');
    }
    
    // Validate payment message metadata
    if (this.type === MessageType.SEND_PAYMENT || this.type === MessageType.REQUEST_PAYMENT) {
      this.validatePaymentMetadata();
    }
    
    return true;
  }

  /**
   * Validate payment message metadata
   */
  validatePaymentMetadata() {
    const requiredFields = ['amount', 'currency'];
    const missingFields = requiredFields.filter(field => !this.metadata[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Payment message missing required metadata: ${missingFields.join(', ')}`);
    }
    
    // Transaction ID is optional for send_payment messages
    // In a real app, you might want to make it required, but for demo purposes it's optional
    if (this.type === MessageType.SEND_PAYMENT && this.metadata.transactionId === undefined) {
      // Set a default transaction ID if none provided
      this.metadata.transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Convert to plain object
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      type: this.type,
      conversationId: this.conversationId,
      sender: this.sender,
      content: this.content,
      metadata: this.metadata,
      timestamp: this.timestamp
    };
  }

  /**
   * Create from plain object
   * @param {Object} data - Plain object data
   * @returns {Message} - Message instance
   */
  static fromObject(data) {
    const message = new Message(
      data.conversationId,
      data.sender,
      data.type,
      data.content,
      data.metadata
    );
    message.id = data.id;
    message.timestamp = data.timestamp;
    return message;
  }

  /**
   * Create a text message
   * @param {string} conversationId - Conversation ID
   * @param {string} sender - Sender wallet address
   * @param {string} content - Message text
   * @returns {Message} - Text message instance
   */
  static createTextMessage(conversationId, sender, content) {
    return new Message(conversationId, sender, MessageType.TEXT, content);
  }

  /**
   * Create a send payment message
   * @param {string} conversationId - Conversation ID
   * @param {string} sender - Sender wallet address
   * @param {string} content - Payment description
   * @param {Object} paymentData - Payment metadata
   * @returns {Message} - Send payment message instance
   */
  static createSendPaymentMessage(conversationId, sender, content, paymentData) {
    const metadata = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      transactionId: paymentData.transactionId,
      recipient: paymentData.recipient,
      ...paymentData
    };
    
    return new Message(conversationId, sender, MessageType.SEND_PAYMENT, content, metadata);
  }

  /**
   * Create a request payment message
   * @param {string} conversationId - Conversation ID
   * @param {string} sender - Sender wallet address
   * @param {string} content - Payment request description
   * @param {Object} paymentData - Payment metadata
   * @returns {Message} - Request payment message instance
   */
  static createRequestPaymentMessage(conversationId, sender, content, paymentData) {
    const metadata = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      requestId: paymentData.requestId || crypto.randomUUID(),
      ...paymentData
    };
    
    return new Message(conversationId, sender, MessageType.REQUEST_PAYMENT, content, metadata);
  }
}

/**
 * Storage Index Model
 * Used to maintain references to stored conversations and messages
 */
export class StorageIndex {
  constructor() {
    this.conversations = new Map(); // conversationId -> blobId
    this.messages = new Map(); // messageId -> blobId
    this.userConversations = new Map(); // userId -> [conversationId]
    this.conversationMessages = new Map(); // conversationId -> [messageId]
  }

  /**
   * Add conversation to index
   * @param {string} conversationId - Conversation ID
   * @param {string} blobId - Walrus blob ID
   * @param {Array<string>} participants - Participant addresses
   */
  addConversation(conversationId, blobId, participants) {
    this.conversations.set(conversationId, blobId);
    
    // Add to user conversations index
    participants.forEach(participant => {
      if (!this.userConversations.has(participant)) {
        this.userConversations.set(participant, []);
      }
      const userConvs = this.userConversations.get(participant);
      if (!userConvs.includes(conversationId)) {
        userConvs.push(conversationId);
      }
    });
  }

  /**
   * Add message to index
   * @param {string} messageId - Message ID
   * @param {string} blobId - Walrus blob ID
   * @param {string} conversationId - Conversation ID
   */
  addMessage(messageId, blobId, conversationId) {
    this.messages.set(messageId, blobId);
    
    // Add to conversation messages index
    if (!this.conversationMessages.has(conversationId)) {
      this.conversationMessages.set(conversationId, []);
    }
    const convMessages = this.conversationMessages.get(conversationId);
    if (!convMessages.includes(messageId)) {
      convMessages.push(messageId);
    }
  }

  /**
   * Get blob ID for conversation
   * @param {string} conversationId - Conversation ID
   * @returns {string|null} - Blob ID or null if not found
   */
  getConversationBlobId(conversationId) {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get blob ID for message
   * @param {string} messageId - Message ID
   * @returns {string|null} - Blob ID or null if not found
   */
  getMessageBlobId(messageId) {
    return this.messages.get(messageId) || null;
  }

  /**
   * Get conversations for user
   * @param {string} userId - User wallet address
   * @returns {Array<string>} - Array of conversation IDs
   */
  getUserConversations(userId) {
    return this.userConversations.get(userId) || [];
  }

  /**
   * Get messages for conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Array<string>} - Array of message IDs
   */
  getConversationMessages(conversationId) {
    return this.conversationMessages.get(conversationId) || [];
  }

  /**
   * Convert to plain object for storage
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      conversations: Object.fromEntries(this.conversations),
      messages: Object.fromEntries(this.messages),
      userConversations: Object.fromEntries(this.userConversations),
      conversationMessages: Object.fromEntries(this.conversationMessages)
    };
  }

  /**
   * Create from plain object
   * @param {Object} data - Plain object data
   * @returns {StorageIndex} - StorageIndex instance
   */
  static fromObject(data) {
    const index = new StorageIndex();
    
    if (data.conversations) {
      index.conversations = new Map(Object.entries(data.conversations));
    }
    if (data.messages) {
      index.messages = new Map(Object.entries(data.messages));
    }
    if (data.userConversations) {
      index.userConversations = new Map(Object.entries(data.userConversations));
    }
    if (data.conversationMessages) {
      index.conversationMessages = new Map(Object.entries(data.conversationMessages));
    }
    
    return index;
  }
} 