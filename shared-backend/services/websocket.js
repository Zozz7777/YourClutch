const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.connections = new Map(); // partnerId -> Set of connections
    this.connectionMetadata = new Map(); // connectionId -> metadata
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    logger.info('WebSocket service initialized');
  }

  handleConnection(ws, req) {
    const connectionId = this.generateConnectionId();
    
    // Store connection metadata
    this.connectionMetadata.set(connectionId, {
      ws,
      partnerId: null,
      userId: null,
      connectedAt: new Date(),
      lastPing: new Date()
    });

    ws.connectionId = connectionId;

    // Handle authentication
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth') {
          this.handleAuthentication(ws, data);
        } else if (data.type === 'ping') {
          this.handlePing(ws);
        } else {
          this.handleMessage(ws, data);
        }
      } catch (error) {
        logger.error('WebSocket message error:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });

    // Send welcome message
    this.sendMessage(ws, {
      type: 'welcome',
      message: 'Connected to Clutch Partners WebSocket',
      connectionId
    });
  }

  handleAuthentication(ws, data) {
    try {
      const { token } = data;
      
      if (!token) {
        this.sendError(ws, 'Authentication token required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clutch_secret_key');
      
      if (decoded.type !== 'partner') {
        this.sendError(ws, 'Invalid token type');
        return;
      }

      const { partnerId, deviceId } = decoded;
      
      // Update connection metadata
      const metadata = this.connectionMetadata.get(ws.connectionId);
      if (metadata) {
        metadata.partnerId = partnerId;
        metadata.userId = decoded.userId;
        metadata.authenticatedAt = new Date();
      }

      // Add to partner connections
      if (!this.connections.has(partnerId)) {
        this.connections.set(partnerId, new Set());
      }
      this.connections.get(partnerId).add(ws);

      // Send authentication success
      this.sendMessage(ws, {
        type: 'auth_success',
        message: 'Authentication successful',
        partnerId,
        deviceId
      });

      logger.info(`Partner ${partnerId} authenticated via WebSocket`);
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      this.sendError(ws, 'Authentication failed');
    }
  }

  handlePing(ws) {
    const metadata = this.connectionMetadata.get(ws.connectionId);
    if (metadata) {
      metadata.lastPing = new Date();
    }
    
    this.sendMessage(ws, {
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  }

  handleMessage(ws, data) {
    const metadata = this.connectionMetadata.get(ws.connectionId);
    
    if (!metadata || !metadata.partnerId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    // Handle different message types
    switch (data.type) {
      case 'subscribe':
        this.handleSubscribe(ws, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(ws, data);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  handleSubscribe(ws, data) {
    const { channel } = data;
    const metadata = this.connectionMetadata.get(ws.connectionId);
    
    if (!metadata.subscriptions) {
      metadata.subscriptions = new Set();
    }
    
    metadata.subscriptions.add(channel);
    
    this.sendMessage(ws, {
      type: 'subscribe_success',
      channel,
      message: `Subscribed to ${channel}`
    });
  }

  handleUnsubscribe(ws, data) {
    const { channel } = data;
    const metadata = this.connectionMetadata.get(ws.connectionId);
    
    if (metadata && metadata.subscriptions) {
      metadata.subscriptions.delete(channel);
    }
    
    this.sendMessage(ws, {
      type: 'unsubscribe_success',
      channel,
      message: `Unsubscribed from ${channel}`
    });
  }

  handleDisconnection(ws) {
    const metadata = this.connectionMetadata.get(ws.connectionId);
    
    if (metadata && metadata.partnerId) {
      // Remove from partner connections
      const partnerConnections = this.connections.get(metadata.partnerId);
      if (partnerConnections) {
        partnerConnections.delete(ws);
        if (partnerConnections.size === 0) {
          this.connections.delete(metadata.partnerId);
        }
      }
    }
    
    // Remove connection metadata
    this.connectionMetadata.delete(ws.connectionId);
    
    logger.info(`WebSocket connection ${ws.connectionId} disconnected`);
  }

  // Send message to specific partner
  sendToPartner(partnerId, message) {
    const connections = this.connections.get(partnerId);
    if (connections) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sendMessage(ws, message);
        }
      });
    }
  }

  // Send message to specific connection
  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Send error message
  sendError(ws, error) {
    this.sendMessage(ws, {
      type: 'error',
      message: error,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to all connected partners
  broadcast(message) {
    this.connections.forEach((connections, partnerId) => {
      this.sendToPartner(partnerId, message);
    });
  }

  // Send order notification
  sendOrderNotification(partnerId, order) {
    this.sendToPartner(partnerId, {
      type: 'new_order',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      },
      timestamp: new Date().toISOString()
    });
  }

  // Send payment notification
  sendPaymentNotification(partnerId, payment) {
    this.sendToPartner(partnerId, {
      type: 'payment_update',
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        method: payment.paymentMethod,
        processedAt: payment.processedAt
      },
      timestamp: new Date().toISOString()
    });
  }

  // Send inventory update notification
  sendInventoryUpdate(partnerId, product) {
    this.sendToPartner(partnerId, {
      type: 'inventory_update',
      data: {
        productId: product._id,
        sku: product.sku,
        name: product.name,
        stock: product.stockQuantity,
        price: product.price,
        updatedAt: product.updatedAt
      },
      timestamp: new Date().toISOString()
    });
  }

  // Send system notification
  sendSystemNotification(partnerId, notification) {
    this.sendToPartner(partnerId, {
      type: 'system_notification',
      data: {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        createdAt: notification.createdAt
      },
      timestamp: new Date().toISOString()
    });
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.connectionMetadata.size,
      authenticatedConnections: Array.from(this.connectionMetadata.values())
        .filter(meta => meta.partnerId).length,
      partnerConnections: this.connections.size,
      connectionsByPartner: Object.fromEntries(
        Array.from(this.connections.entries()).map(([partnerId, connections]) => [
          partnerId,
          connections.size
        ])
      )
    };
  }

  // Clean up inactive connections
  cleanupInactiveConnections() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    this.connectionMetadata.forEach((metadata, connectionId) => {
      if (now - metadata.lastPing > timeout) {
        const ws = metadata.ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        this.handleDisconnection(ws);
      }
    });
  }

  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
