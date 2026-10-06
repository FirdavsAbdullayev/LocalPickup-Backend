const express = require('express');
const ac = require('../../controllers/adminController');
const { protect, requireRole } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Super Admin moderation and system metrics
 */

router.use(protect);
router.use(requireRole('SUPER_ADMIN'));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get overall platform statistics and GMV
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Platform statistics
 */
router.get('/stats', ac.getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users across the platform
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', ac.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/users/:id', ac.getUserById);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Block or unblock a user
 *     tags: [Admin]
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
 *               status: { type: string, enum: [ACTIVE, BLOCKED] }
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch('/users/:id/status', ac.updateUserStatus);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Change user role
 *     tags: [Admin]
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [SUPER_ADMIN, VENDOR, CUSTOMER] }
 *     responses:
 *       200:
 *         description: User role updated
 */
router.patch('/users/:id/role', ac.updateUserRole);

/**
 * @swagger
 * /admin/shops:
 *   get:
 *     summary: List all shops including pending approvals
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all shops
 */
router.get('/shops', ac.getAllShopsAdmin);

/**
 * @swagger
 * /admin/shops/{id}/approve:
 *   patch:
 *     summary: Approve a newly created vendor shop
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Shop approved
 */
router.patch('/shops/:id/approve', ac.approveShop);

/**
 * @swagger
 * /admin/shops/{id}:
 *   delete:
 *     summary: Reject or remove a shop
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Shop removed
 */
router.delete('/shops/:id', ac.rejectShop);

module.exports = router;
