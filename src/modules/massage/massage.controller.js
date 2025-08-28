import { Router } from "express";
import * as massageService from "./massage.service.js";
import * as massageValidation from "../../validation/massage.validation.js";
import { cloudFail, fileValidation } from "../../utils/multier/cloud.multer.js";
import { validationMiddleware } from "../../middleware/validation.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging endpoints
 */


// router.post(
//         "/:receiverId",
//         cloudFail({ validation: fileValidation.image }).array("images", 2),
//         validationMiddleware(massageValidation.createMassageValidation),
//         massageService.sendMassage 
//     );

/**
 * @swagger
 * /api/message/{receiverId}/senderId:
 *   post:
 *     summary: Send message to user
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Receiver user ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Message attachments (max 2 images)
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Message content or files required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Receiver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
    router.post(
        "/:receiverId/senderId",
        authMiddleware,
        cloudFail({ validation: fileValidation.image }).array("images", 2),
        validationMiddleware(massageValidation.createMassageValidation),
        massageService.sendMassage 
    );

/**
 * @swagger
 * /api/message/chats:
 *   get:
 *     summary: Get all user messages
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
    router.get(
        '/chats',
        authMiddleware,
        massageService.getAllMassages
    );
/**
 * @swagger
 * /api/message/{_id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
    router.get(
        '/:id',
        authMiddleware,
        validationMiddleware(massageValidation.getMassageValidation),
        massageService.getMassageById
    );


/**
 * @swagger
 * /api/message/{id}:
 *   delete:
 *     summary: Delete a message
 *     description: Delete a single message by ID (only sender or receiver can delete it).
 *     tags: [Messages]   # ✅ خليه Messages زي الباقي
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the message to delete
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Message deleted successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Message not found or not authorized
 */
    router.delete(
        '/:id',
        authMiddleware,
        validationMiddleware(massageValidation.getMassageValidation),
        massageService.deleteMassage
    )



export default router; 