const express = require('express');
const pc = require('../../controllers/productController');
const { protect, requireRole } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createProductSchema } = require('../../config/validations');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog and category operations
 */

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: List all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories list
 */
router.get('/categories', pc.getAllCategories);

/**
 * @swagger
 * /products/categories:
 *   post:
 *     summary: Create product category (Super Admin)
 *     tags: [Products]
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
 *               icon: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/categories', protect, requireRole('SUPER_ADMIN'), pc.createCategory);

/**
 * @swagger
 * /products/categories/{id}:
 *   patch:
 *     summary: Update category (Super Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch('/categories/:id', protect, requireRole('SUPER_ADMIN'), pc.updateCategory);

/**
 * @swagger
 * /products/categories/{id}:
 *   delete:
 *     summary: Delete category (Super Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Category deleted
 */
router.delete('/categories/:id', protect, requireRole('SUPER_ADMIN'), pc.deleteCategory);

/**
 * @swagger
 * /products/shop/{shopId}:
 *   get:
 *     summary: Get all products for a specific shop
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Products list
 */
router.get('/shop/:shopId', pc.getProductsByShop);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get single product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', pc.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product for a shop (Vendor or Super Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shopId, title, price]
 *             properties:
 *               shopId: { type: string, format: uuid }
 *               categoryId: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               discountPrice: { type: number }
 *               image: { type: string }
 *               stockQuantity: { type: integer }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', protect, requireRole('VENDOR', 'SUPER_ADMIN'), validate(createProductSchema), pc.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update product (Vendor owner or Super Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch('/:id', protect, requireRole('VENDOR', 'SUPER_ADMIN'), pc.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (Vendor owner or Super Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Product deleted
 */
router.delete('/:id', protect, requireRole('VENDOR', 'SUPER_ADMIN'), pc.deleteProduct);

module.exports = router;
