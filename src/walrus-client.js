/**
 * Walrus Client for decentralized storage operations
 * Handles blob storage and retrieval using Walrus network
 */

import https from 'https';

export class WalrusClient {
  constructor(config) {
    this.aggregatorUrl = config.aggregatorUrl;
    this.publisherUrl = config.publisherUrl;
    this.network = config.network || 'mainnet';
    
    // Create HTTPS agent that ignores SSL certificate errors for testnet
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  /**
   * Store a blob on Walrus network
   * @param {Uint8Array} data - The data to store
   * @param {string} owner - The owner wallet address
   * @returns {Promise<Object>} - Storage result with blob ID and metadata
   */
  async storeBlob(data, owner) {
    try {
      console.log(`Storing blob of size ${data.length} bytes for owner ${owner}`);
      
      // Create the storage request
      const request = {
        data: Array.from(data), // Convert to array for JSON serialization
        owner: owner,
        network: this.network
      };

      // Send to Walrus publisher using PUT /v1/blobs as per Walrus API docs
      const response = await fetch(`${this.publisherUrl}/v1/blobs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: data, // Send the raw data directly
        agent: this.httpsAgent
      });

      if (!response.ok) {
        throw new Error(`Failed to store blob: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      let blobId, suiObjectId, txDigest;
      if (result.newlyCreated) {
        blobId = result.newlyCreated.blobObject?.blobId;
        suiObjectId = result.newlyCreated.blobObject?.id;
        txDigest = result.newlyCreated.event?.txDigest;
        console.log(`Blob stored successfully!`);
        console.log(`  Walrus Blob ID: ${blobId}`);
        console.log(`  Sui Blob Object ID: ${suiObjectId}`);
        if (txDigest) console.log(`  Sui Transaction Digest: ${txDigest}`);
      } else if (result.alreadyCertified) {
        blobId = result.alreadyCertified.blobId;
        txDigest = result.alreadyCertified.event?.txDigest;
        console.log(`Blob already certified!`);
        console.log(`  Walrus Blob ID: ${blobId}`);
        if (txDigest) console.log(`  Sui Transaction Digest: ${txDigest}`);
      } else {
        blobId = result.blobId;
        console.log(`Blob stored, but could not extract Sui object or tx digest.`);
      }
      
      return {
        blobId: blobId,
        size: data.length,
        owner: owner,
        timestamp: new Date().toISOString(),
        suiObjectId,
        txDigest,
        response: result // Include full response for debugging
      };
    } catch (error) {
      console.error('Error storing blob:', error);
      throw error;
    }
  }

  /**
   * Retrieve a blob from Walrus network
   * @param {string} blobId - The blob ID to retrieve
   * @returns {Promise<Uint8Array>} - The retrieved data
   */
  async retrieveBlob(blobId) {
    try {
      console.log(`Retrieving blob with ID: ${blobId}`);
      
      // Get blob from Walrus aggregator using GET /v1/blobs/<blobId> as per Walrus API docs
      const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
        agent: this.httpsAgent
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve blob: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      console.log(`Blob retrieved successfully, size: ${data.length} bytes`);
      return data;
    } catch (error) {
      console.error('Error retrieving blob:', error);
      throw error;
    }
  }

  /**
   * Get blob metadata
   * @param {string} blobId - The blob ID
   * @returns {Promise<Object>} - Blob metadata
   */
  async getBlobMetadata(blobId) {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}/metadata`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        agent: this.httpsAgent
      });

      if (!response.ok) {
        throw new Error(`Failed to get blob metadata: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting blob metadata:', error);
      throw error;
    }
  }
} 