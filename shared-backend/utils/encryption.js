const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
    this.tagLength = 16; // 128 bits
    
    // Get encryption key from environment
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    // Ensure key is the correct length
    if (this.encryptionKey.length !== this.keyLength) {
      this.encryptionKey = crypto.scryptSync(this.encryptionKey, 'clutch-salt', this.keyLength);
    }
  }

  /**
   * Encrypt sensitive data
   * @param {string} text - Text to encrypt
   * @returns {string} - Encrypted string with IV and tag
   */
  encrypt(text) {
    try {
      if (!text) return null;
      
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('clutch-auth', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV + tag + encrypted data
      const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      
      return combined;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedText - Encrypted string
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText) {
    try {
      if (!encryptedText) return null;
      
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('clutch-auth', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt payment gateway credentials
   * @param {object} credentials - Credentials object
   * @returns {string} - Encrypted credentials
   */
  encryptCredentials(credentials) {
    try {
      const jsonString = JSON.stringify(credentials);
      return this.encrypt(jsonString);
    } catch (error) {
      console.error('Credentials encryption error:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  /**
   * Decrypt payment gateway credentials
   * @param {string} encryptedCredentials - Encrypted credentials
   * @returns {object} - Decrypted credentials object
   */
  decryptCredentials(encryptedCredentials) {
    try {
      const decryptedString = this.decrypt(encryptedCredentials);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Credentials decryption error:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Generate a secure random key
   * @param {number} length - Key length in bytes
   * @returns {string} - Hex encoded key
   */
  generateKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data for comparison (one-way)
   * @param {string} text - Text to hash
   * @returns {string} - Hashed text
   */
  hash(text) {
    if (!text) return null;
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Verify hashed data
   * @param {string} text - Original text
   * @param {string} hash - Hashed text
   * @returns {boolean} - Whether hash matches
   */
  verifyHash(text, hash) {
    if (!text || !hash) return false;
    const computedHash = this.hash(text);
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;