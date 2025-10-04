const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

// Configure AWS S3 v3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET;

// Folder prefixes
const FOLDERS = {
  CONTRACT_TEMPLATES: 'contracts/templates',
  GENERATED_DOCX: 'contracts/generated-docx',
  GENERATED_PDF: 'contracts/generated-pdf',
  SIGNED_PDFS: 'contracts/signed'
};

/**
 * Upload a file to S3
 * @param {Buffer|Stream} fileData - File data to upload
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<string>} - S3 object URL
 */
async function uploadFile(fileData, key, contentType, metadata = {}) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileData,
      ContentType: contentType,
      Metadata: metadata
    });

    const result = await s3Client.send(command);
    const location = `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    console.log(`✅ File uploaded to S3: ${key}`);
    return location;
  } catch (error) {
    console.error(`❌ Error uploading file to S3: ${key}`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Generate a signed URL for S3 object
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
async function getSignedUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`✅ Generated signed URL for: ${key}`);
    return url;
  } catch (error) {
    console.error(`❌ Error generating signed URL for: ${key}`, error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Download a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Buffer>} - File data
 */
async function downloadFile(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const result = await s3Client.send(command);
    const chunks = [];
    for await (const chunk of result.Body) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    console.log(`✅ File downloaded from S3: ${key}`);
    return body;
  } catch (error) {
    console.error(`❌ Error downloading file from S3: ${key}`, error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} - Success status
 */
async function deleteFile(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    console.log(`✅ File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting file from S3: ${key}`, error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Check if S3 is properly configured
 * @returns {Promise<boolean>} - Configuration status
 */
async function checkS3Configuration() {
  try {
    if (!BUCKET_NAME || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      console.error('❌ S3 configuration missing');
      return false;
    }

    // Test S3 access
    const command = new HeadBucketCommand({ Bucket: BUCKET_NAME });
    await s3Client.send(command);
    console.log('✅ S3 configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ S3 configuration error:', error.message);
    return false;
  }
}

/**
 * Generate contract template key
 * @param {string} partnerType - Partner type
 * @param {string} contractType - Contract type (person/company)
 * @param {string} locale - Locale (en/ar)
 * @param {string} version - Version number
 * @returns {string} - S3 key
 */
function generateTemplateKey(partnerType, contractType, locale, version) {
  return `${FOLDERS.CONTRACT_TEMPLATES}/${partnerType}-${contractType}-${locale}/${version}.docx`;
}

/**
 * Generate generated contract key
 * @param {string} contractId - Contract ID
 * @param {string} type - File type (docx/pdf)
 * @returns {string} - S3 key
 */
function generateContractKey(contractId, type = 'docx') {
  const folder = type === 'pdf' ? FOLDERS.GENERATED_PDF : FOLDERS.GENERATED_DOCX;
  return `${folder}/${contractId}.${type}`;
}

/**
 * Generate signed contract key
 * @param {string} contractId - Contract ID
 * @returns {string} - S3 key
 */
function generateSignedContractKey(contractId) {
  return `${FOLDERS.SIGNED_PDFS}/${contractId}.pdf`;
}

/**
 * List files in a folder
 * @param {string} prefix - Folder prefix
 * @param {number} maxKeys - Maximum number of keys to return
 * @returns {Promise<Array>} - List of objects
 */
async function listFiles(prefix, maxKeys = 1000) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    console.error(`❌ Error listing files with prefix: ${prefix}`, error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

module.exports = {
  uploadFile,
  getSignedUrl,
  downloadFile,
  deleteFile,
  checkS3Configuration,
  generateTemplateKey,
  generateContractKey,
  generateSignedContractKey,
  listFiles,
  FOLDERS
};
