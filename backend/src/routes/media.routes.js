const express = require('express');
const {uploadMediaToEvent,getEventMedia, findMyPhotos, downloadWatermarkedMedia, deleteMedia} = require('../controllers/media.controller');
const {toggleLike, addComment, getMediaDetails} = require('../controllers/interaction.controller');
const {verifyJWT,authorizeRoles} = require('../middlewares/auth.middleware');
const {upload} = require('../middlewares/multer.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/media/{eventId}/upload:
 *   post:
 *     summary: Upload photos/videos to an event
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *       403:
 *         description: Forbidden
 */
router.post('/:eventId/upload',verifyJWT,authorizeRoles('admin','photographer'),upload.array('mediaFiles', 50),uploadMediaToEvent)

/**
 * @swagger
 * /api/v1/media/{eventId}:
 *   get:
 *     summary: Get all media for a specific event
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of event media
 */
router.get('/:eventId', verifyJWT, getEventMedia);

/**
 * @swagger
 * /api/v1/media/{mediaId}/like:
 *   post:
 *     summary: Toggle a like on a photo
 *     tags: [Media Interactions]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 */
router.post('/:mediaId/like',verifyJWT,toggleLike);

/**
 * @swagger
 * /api/v1/media/{mediaId}/comment:
 *   post:
 *     summary: Add a comment to a photo
 *     tags: [Media Interactions]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/:mediaId/comment',verifyJWT, addComment);

/**
 * @swagger
 * /api/v1/media/{mediaId}/details:
 *   get:
 *     summary: Get comments and likes for a photo
 *     tags: [Media Interactions]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media details retrieved
 */
router.get('/:mediaId/details', verifyJWT, getMediaDetails);

/**
 * @swagger
 * /api/v1/media/find-me:
 *   post:
 *     summary: Upload a selfie to find matching photos
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               selfie:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Returns matching photos
 */
router.post('/find-me', verifyJWT, upload.single('selfie'), findMyPhotos);

/**
 * @swagger
 * /api/v1/media/{mediaId}/download:
 *   get:
 *     summary: Download watermarked media
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image downloaded
 */
router.get('/:mediaId/download', verifyJWT, downloadWatermarkedMedia);

/**
 * @swagger
 * /api/v1/media/{mediaId}:
 *   delete:
 *     summary: Delete a media file
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media deleted
 */
router.delete('/:mediaId', verifyJWT, deleteMedia);

module.exports = router;