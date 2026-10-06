const express = require('express');
const oc = require('../../controllers/orderController');
const { protect, requireRole } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order reservation and management operations
 */

router.use(protect);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new pickup reservation order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shopId, items]
 *             properties:
 *               shopId: { type: string, format: uuid }
 *               pickupTime: { type: string, format: date-time }
 *               notes: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     quantity: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post('/', requireRole('CUSTOMER', 'SUPER_ADMIN'), oc.createOrder);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get all orders of current logged-in customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
 */
router.get('/my', oc.getMyOrders);

/**
 * @swagger
 * /orders/shop/{shopId}:
 *   get:
 *     summary: Get all orders for a specific shop (Vendor or Super Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Shop orders list
 */
router.get('/shop/:shopId', requireRole('VENDOR', 'SUPER_ADMIN'), oc.getShopOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', oc.getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order preparation status (Vendor or Super Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PREPARING, READY, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', requireRole('VENDOR', 'SUPER_ADMIN'), oc.updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order by customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.patch('/:id/cancel', requireRole('CUSTOMER', 'SUPER_ADMIN'), oc.cancelOrder);

module.exports = router;
