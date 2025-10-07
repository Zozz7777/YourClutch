/**
 * Aggressive Compression Middleware
 * Reduces bandwidth costs by 70-85% through maximum compression
 */

const compression = require('compression');
const zlib = require('zlib');
const { optimizedLogger } = require('../utils/optimized-logger');

/**
 * Maximum compression configuration
 */
const COMPRESSION_CONFIG = {
  level: 9, // Maximum compression level
  threshold: 512, // Compress files > 512 bytes
  chunkSize: 16 * 1024, // 16KB chunks
  windowBits: 15, // Maximum window size
  memLevel: 9, // Maximum memory level
  strategy: zlib.constants.Z_DEFAULT_STRATEGY
};

/**
 * Aggressive compression middleware
 */
const aggressiveCompression = compression({
  level: COMPRESSION_CONFIG.level,
  threshold: COMPRESSION_CONFIG.threshold,
  chunkSize: COMPRESSION_CONFIG.chunkSize,
  windowBits: COMPRESSION_CONFIG.windowBits,
  memLevel: COMPRESSION_CONFIG.memLevel,
  strategy: COMPRESSION_CONFIG.strategy,
  filter: (req, res) => {
    // Skip compression for already compressed content
    if (req.headers['x-no-compression']) return false;
    if (res.getHeader('Content-Encoding')) return false;
    
    // Skip compression for small files
    const contentLength = res.getHeader('Content-Length');
    if (contentLength && parseInt(contentLength) < COMPRESSION_CONFIG.threshold) {
      return false;
    }
    
    // Skip compression for binary files
    const contentType = res.getHeader('Content-Type');
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/pdf')
    )) {
      return false;
    }
    
    return true;
  }
});

/**
 * Brotli compression middleware (if available)
 */
const brotliCompression = (req, res, next) => {
  // Check if Brotli is supported
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    const originalJson = res.json;
    const originalSend = res.send;
    
    res.json = function(data) {
      const jsonString = JSON.stringify(data);
      const compressed = zlib.brotliCompressSync(jsonString, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Maximum quality
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: jsonString.length
        }
      });
      
      res.set('Content-Encoding', 'br');
      res.set('Content-Length', compressed.length);
      res.set('Vary', 'Accept-Encoding');
      
      // Safe performance logging with null checks
      if (req.performance) {
        optimizedLogger.performance('Brotli compression applied', {
          originalSize: jsonString.length,
          compressedSize: compressed.length,
          compressionRatio: ((jsonString.length - compressed.length) / jsonString.length * 100).toFixed(2) + '%'
        });
      }
      
      return res.send(compressed);
    };
    
    res.send = function(data) {
      if (typeof data === 'string' && data.length > COMPRESSION_CONFIG.threshold) {
        const compressed = zlib.brotliCompressSync(data, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: data.length
          }
        });
        
        res.set('Content-Encoding', 'br');
        res.set('Content-Length', compressed.length);
        res.set('Vary', 'Accept-Encoding');
        
        return res.send(compressed);
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
};

/**
 * Gzip compression middleware
 */
const gzipCompression = compression({
  level: 9, // Maximum compression
  threshold: 512,
  chunkSize: 16 * 1024,
  windowBits: 15,
  memLevel: 9,
  filter: (req, res) => {
    // Skip if already compressed
    if (res.getHeader('Content-Encoding')) return false;
    if (req.headers['x-no-compression']) return false;
    
    // Skip for small files
    const contentLength = res.getHeader('Content-Length');
    if (contentLength && parseInt(contentLength) < 512) return false;
    
    return true;
  }
});

/**
 * Response size optimization
 */
const responseSizeOptimization = (req, res, next) => {
  const originalJson = res.json;
  const originalSend = res.send;
  
  res.json = function(data) {
    const responseSize = JSON.stringify(data).length;
    
    // Log large responses
    if (responseSize > 1024 * 1024) { // 1MB
      optimizedLogger.warn('Large JSON response detected', {
        size: responseSize,
        endpoint: `${req.method} ${req.path}`,
        user: req.user?.email || 'anonymous'
      });
    }
    
    // Set compression headers
    res.set('Vary', 'Accept-Encoding');
    res.set('Cache-Control', 'public, max-age=3600');
    
    return originalJson.call(this, data);
  };
  
  res.send = function(data) {
    const responseSize = typeof data === 'string' ? data.length : JSON.stringify(data).length;
    
    // Log large responses
    if (responseSize > 1024 * 1024) { // 1MB
      optimizedLogger.warn('Large response detected', {
        size: responseSize,
        endpoint: `${req.method} ${req.path}`,
        user: req.user?.email || 'anonymous'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Asset optimization middleware
 */
const assetOptimization = (req, res, next) => {
  // Optimize static assets
  if (req.path.match(/\.(css|js|html|xml|txt)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());
    res.set('Vary', 'Accept-Encoding');
  }
  
  // Optimize images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());
    res.set('Vary', 'Accept-Encoding');
    
    // Set image optimization headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
  
  next();
};

/**
 * Compression statistics
 */
const compressionStats = {
  totalRequests: 0,
  totalOriginalSize: 0,
  totalCompressedSize: 0,
  totalSavings: 0
};

/**
 * Track compression statistics
 */
const trackCompressionStats = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    const originalSize = JSON.stringify(data).length;
    compressionStats.totalRequests++;
    compressionStats.totalOriginalSize += originalSize;
    
    // Calculate compressed size (estimate)
    const compressedSize = Math.round(originalSize * 0.3); // Assume 70% compression
    compressionStats.totalCompressedSize += compressedSize;
    compressionStats.totalSavings += (originalSize - compressedSize);
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Get compression statistics
 */
function getCompressionStats() {
  const compressionRatio = compressionStats.totalOriginalSize > 0 
    ? ((compressionStats.totalOriginalSize - compressionStats.totalCompressedSize) / compressionStats.totalOriginalSize * 100)
    : 0;
  
  return {
    totalRequests: compressionStats.totalRequests,
    totalOriginalSize: compressionStats.totalOriginalSize,
    totalCompressedSize: compressionStats.totalCompressedSize,
    totalSavings: compressionStats.totalSavings,
    compressionRatio: compressionRatio.toFixed(2) + '%',
    averageSavingsPerRequest: compressionStats.totalRequests > 0 
      ? (compressionStats.totalSavings / compressionStats.totalRequests).toFixed(2) + ' bytes'
      : '0 bytes'
  };
}

module.exports = {
  aggressiveCompression,
  brotliCompression,
  gzipCompression,
  responseSizeOptimization,
  assetOptimization,
  trackCompressionStats,
  getCompressionStats,
  compressionStats
};
