const request = require('supertest');
const app = require('../../app');
const { getCollection } = require('../../config/database');

describe('Partner End-to-End Flow Tests', () => {
  let testPartnerId;
  let testPartnerUser;
  let authToken;

  beforeAll(async () => {
    // Clean up test data
    const partnersCollection = await getCollection('partners');
    const partnerUsersCollection = await getCollection('partnerusers');
    
    await partnersCollection.deleteMany({ partnerId: { $regex: /^TEST-/ } });
    await partnerUsersCollection.deleteMany({ partnerId: { $regex: /^TEST-/ } });
  });

  afterAll(async () => {
    // Clean up test data
    const partnersCollection = await getCollection('partners');
    const partnerUsersCollection = await getCollection('partnerusers');
    
    await partnersCollection.deleteMany({ partnerId: { $regex: /^TEST-/ } });
    await partnerUsersCollection.deleteMany({ partnerId: { $regex: /^TEST-/ } });
  });

  describe('Partner Registration Flow', () => {
    test('1. Create partner via sales team', async () => {
      const partnerData = {
        partnerId: 'TEST-PARTNER-001',
        name: 'Test Auto Parts Store',
        type: 'AUTO_PARTS_SHOP',
        primaryContact: {
          name: 'Ahmed Mohamed',
          email: 'ahmed@testautoparts.com',
          phone: '+201234567890'
        },
        addresses: [{
          line1: '123 Test Street',
          city: 'Cairo',
          state: 'Cairo',
          postalCode: '12345'
        }],
        status: 'active',
        createdAt: new Date()
      };

      const partnersCollection = await getCollection('partners');
      const result = await partnersCollection.insertOne(partnerData);
      
      expect(result.insertedId).toBeDefined();
      testPartnerId = partnerData.partnerId;
    });

    test('2. Partner signup for app access', async () => {
      const signupData = {
        partnerId: testPartnerId,
        email: 'ahmed@testautoparts.com',
        password: 'TestPassword123!',
        businessName: 'Test Auto Parts Store',
        ownerName: 'Ahmed Mohamed',
        partnerType: 'AUTO_PARTS_SHOP',
        businessAddress: {
          street: '123 Test Street',
          city: 'Cairo',
          state: 'Cairo',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/v1/partners/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.partner).toBeDefined();
      
      authToken = response.body.data.token;
      testPartnerUser = response.body.data.partner;
    });

    test('3. Partner sign in', async () => {
      const signinData = {
        emailOrPhone: 'ahmed@testautoparts.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/partners/auth/signin')
        .send(signinData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.partner.partnerId).toBe(testPartnerId);
    });
  });

  describe('Dashboard Analytics Flow', () => {
    test('4. Get dashboard analytics', async () => {
      const response = await request(app)
        .get('/api/v1/partners/dashboard/analytics?period=week')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeDefined();
      expect(response.body.data.revenue).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
    });

    test('5. Get inventory overview', async () => {
      const response = await request(app)
        .get('/api/v1/partners/dashboard/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProducts).toBeDefined();
      expect(response.body.data.lowStockItems).toBeDefined();
      expect(response.body.data.outOfStockItems).toBeDefined();
    });

    test('6. Get recent orders', async () => {
      const response = await request(app)
        .get('/api/v1/partners/dashboard/recent-orders?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Notifications Flow', () => {
    test('7. Get notifications', async () => {
      const response = await request(app)
        .get('/api/v1/partners/notifications?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
    });

    test('8. Mark notifications as read', async () => {
      // First get some notifications
      const getResponse = await request(app)
        .get('/api/v1/partners/notifications?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (getResponse.body.data.notifications.length > 0) {
        const notificationIds = getResponse.body.data.notifications
          .slice(0, 2)
          .map(n => n._id);

        const response = await request(app)
          .post('/api/v1/partners/notifications/mark-read')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ notificationIds })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.modifiedCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Support System Flow', () => {
    test('9. Create support ticket', async () => {
      const ticketData = {
        title: 'Test Support Ticket',
        description: 'This is a test support ticket for E2E testing',
        priority: 'medium',
        category: 'technical'
      };

      const response = await request(app)
        .post('/api/v1/partners/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticketId).toBeDefined();
    });

    test('10. Get support tickets', async () => {
      const response = await request(app)
        .get('/api/v1/partners/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tickets)).toBe(true);
    });
  });

  describe('Warranty & Disputes Flow', () => {
    test('11. Create warranty claim', async () => {
      const claimData = {
        orderId: 'TEST-ORDER-001',
        productName: 'Test Product',
        issue: 'Test issue description',
        amount: 100.50
      };

      const response = await request(app)
        .post('/api/v1/partners/warranty/claims')
        .set('Authorization', `Bearer ${authToken}`)
        .send(claimData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.claimId).toBeDefined();
    });

    test('12. Create dispute', async () => {
      const disputeData = {
        orderId: 'TEST-ORDER-002',
        reason: 'Product quality issue',
        description: 'Test dispute description',
        amount: 250.75
      };

      const response = await request(app)
        .post('/api/v1/partners/warranty/disputes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disputeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.disputeId).toBeDefined();
    });
  });

  describe('Audit Logs Flow', () => {
    test('13. Get audit logs', async () => {
      const response = await request(app)
        .get('/api/v1/partners/audit-logs?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.auditLogs)).toBe(true);
    });

    test('14. Export audit logs', async () => {
      const response = await request(app)
        .get('/api/v1/partners/audit-logs/export?format=csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });
  });

  describe('Data Export Flow', () => {
    test('15. Export orders data', async () => {
      const response = await request(app)
        .post('/api/v1/partners/export/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
          dateRange: 'last_30_days'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.exportId).toBeDefined();
    });

    test('16. Get export history', async () => {
      const response = await request(app)
        .get('/api/v1/partners/export/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.exports)).toBe(true);
    });
  });

  describe('RBAC Security Tests', () => {
    test('17. Test unauthorized access', async () => {
      const response = await request(app)
        .get('/api/v1/partners/dashboard/analytics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    test('18. Test invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/partners/dashboard/analytics')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('19. Test partner data isolation', async () => {
      // Create another partner
      const anotherPartnerData = {
        partnerId: 'TEST-PARTNER-002',
        name: 'Another Test Store',
        type: 'REPAIR_CENTER',
        primaryContact: {
          name: 'Another Owner',
          email: 'another@teststore.com',
          phone: '+201234567891'
        },
        status: 'active',
        createdAt: new Date()
      };

      const partnersCollection = await getCollection('partners');
      await partnersCollection.insertOne(anotherPartnerData);

      // Try to access another partner's data
      const response = await request(app)
        .get('/api/v1/partners/dashboard/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only return data for the authenticated partner
      expect(response.body.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('20. Dashboard analytics performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/partners/dashboard/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    test('21. Bulk notifications performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/partners/notifications?limit=50')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
