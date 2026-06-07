const express= require('express');
const {createEvent, getAllEvents, deleteEvent} = require('../controllers/event.controller');
const {verifyJWT, authorizeRoles} = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       403:
 *         description: Forbidden (Admin/Photographer only)
 */
router.post('/',verifyJWT,authorizeRoles('admin','photographer'),createEvent)

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of all events
 *       401:
 *         description: Unauthorized
 */
router.get('/',verifyJWT,getAllEvents)

/**
 * @swagger
 * /api/v1/events/{eventId}:
 *   delete:
 *     summary: Delete a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete('/:eventId', verifyJWT, authorizeRoles('admin'), deleteEvent);

module.exports = router