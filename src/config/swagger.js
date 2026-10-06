const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LocalPickup Platform API',
      version: '2.0.0',
      description: 'Enterprise Multi-Vendor Local Pickup Platform with RBAC, Telegram Alerts, and Full DB Persistence',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current Environment API',
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['SUPER_ADMIN', 'VENDOR', 'CUSTOMER'] },
            status: { type: 'string', enum: ['ACTIVE', 'BLOCKED'] },
          },
        },
        Shop: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ownerId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            logo: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            isApproved: { type: 'boolean' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            shopId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            discountPrice: { type: 'number' },
            image: { type: 'string' },
            stockQuantity: { type: 'integer' },
            isAvailable: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            shopId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] },
            paymentStatus: { type: 'string', enum: ['UNPAID', 'PAID'] },
            totalAmount: { type: 'number' },
            pickupTime: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/v1/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
