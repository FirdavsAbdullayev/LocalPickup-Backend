const express = require('express');
const sc = require('../../controllers/shopController');
const { protect, requireRole } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Shop browsing and management operations
 */

/**
 * @swagger
 * /shops:
 *   get:
 *     summary: Get all approved shops
 *     tags: [Shops]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by shop name
 *     responses:
 *       200:
 *         description: List of approved shops
 */
router.get('/', sc.getAllShops);

/**
 * @swagger
 * /shops/my-shops:
 *   get:
 *     summary: Get all shops owned by current vendor
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor shops
 */
router.get('/my-shops', protect, requireRole('VENDOR', 'SUPER_ADMIN'), sc.getMyShops);

/**
 * @swagger
 * /shops/slug/{slug}:
 *   get:
 *     summary: Get shop details and available products by slug
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shop details
 */
router.get('/slug/:slug', sc.getShopBySlug);

/**
 * @swagger
 * /shops/{id}:
 *   get:
 *     summary: Get shop details by ID
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Shop details
 */
router.get('/:id', sc.getShopById);

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Create a new shop (Vendor or Super Admin)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               logo: { type: string }
 *     responses:
 *       201:
 *         description: Shop created
 */
router.post('/', protect, requireRole('VENDOR', 'SUPER_ADMIN'), sc.createShop);

/**
 * @swagger
 * /shops/{id}:
 *   patch:
 *     summary: Update shop details (Owner or Super Admin)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Shop updated
 */
router.patch('/:id', protect, requireRole('VENDOR', 'SUPER_ADMIN'), sc.updateShop);

/**
 * @swagger
 * /shops/{id}:
 *   delete:
 *     summary: Delete shop (Owner or Super Admin)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Shop deleted
 */
router.delete('/:id', protect, requireRole('VENDOR', 'SUPER_ADMIN'), sc.deleteShop);

module.exports = router;
