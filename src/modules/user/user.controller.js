import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authMiddleware,
  authorization,
} from "../../middleware/auth.middleware.js"; // Assuming you have an auth middleware
import { roleEnum } from "../../model/user.model.js";
import { validationMiddleware } from "../../middleware/validation.js";
import {
  shareProfileValidation,
  updateBasicInfo,
  freezeUserAccount,
  unfreezeUserAccount,
  deleteAccount,
  updatePasswordValidation,
  logout,
  coverPictureValidation,
  profileImageValidation,
} from "../../validation/user.validation.js";
import { endpoint } from "./user.authrization.js";
import {fileValidation, localFail} from "../../utils/multier/local.multer.js"
import { cloudFail } from "../../utils/multier/cloud.multer.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *       403:
 *         description: Account is frozen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//هنعمل اللى يقدر يعمله اليوزر العادي بقى
router.get(
  "/profile",
  authMiddleware,
  authorization({ accessRoles: [roleEnum.user, roleEnum.admin] }),
  userService.getUserProfile
); // Assuming user ID is passed in the request params
/**
 * @swagger
 * /api/user/profile/{userId}:
 *   get:
 *     summary: Get shared user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/profile/:userId",
  validationMiddleware(shareProfileValidation, "params"),
  userService.sharedProfile
);

/**
 * @swagger
 * /api/user/{userId}/freeze-account:
 *   delete:
 *     summary: Freeze user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID (optional, defaults to current user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: User ID to freeze
 *     responses:
 *       200:
 *         description: User account frozen successfully
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "{/:userId}/freeze-account",
  authMiddleware,
  validationMiddleware(freezeUserAccount),
  userService.freezeUserAccount
);

/**
 * @swagger
 * /api/user/update-profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: User last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: User gender
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{11}$'
 *                 description: User phone number (11 digits)
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input data
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/update-profile",
  authMiddleware,
  validationMiddleware(updateBasicInfo),
  userService.updateProfile
);

/**
 * @swagger
 * /api/user/{userId}/restore-account:
 *   patch:
 *     summary: Restore frozen user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID (optional, defaults to current user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: User ID to restore
 *     responses:
 *       200:
 *         description: User account restored successfully
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/:userId/restore-account",
  authMiddleware,
  authorization({ accessRoles: endpoint.restoreAccount }),
  validationMiddleware(unfreezeUserAccount),
  userService.restoreAccount
);

/**
 * @swagger
 * /api/user/{userId}:
 *   delete:
 *     summary: Delete user account permanently
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: User ID to delete
 *     responses:
 *       200:
 *         description: User account deleted successfully
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:userId",
  authMiddleware,
  authorization({ accessRoles: endpoint.deleteAccount }),
  validationMiddleware(deleteAccount),
  userService.deleteAccount
);

/**
 * @swagger
 * /api/user/update-Password:
 *   patch:
 *     summary: Update user password
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - password
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 20
 *                 description: Current password
 *               password:
 *                 type: string
 *                 pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'
 *                 description: New password (must contain uppercase, lowercase, number)
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid password or passwords don't match
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/update-Password",
  authMiddleware,
  validationMiddleware(updatePasswordValidation),
  userService.updatePassword
);
/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: User logout
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flag
 *             properties:
 *               flag:
 *                 type: string
 *                 enum: [logoutFromAllDevices, logout, staylogedIn]
 *                 description: Logout type
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid logout flag
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
 */
router.post(
  "/logout",
  authMiddleware,
  validationMiddleware(logout),
  userService.logout
);

// router.patch(
//   "/upload-profile-picture",
//   authMiddleware,
//   localFail({customPath: "User" ,validation: fileValidation.image}).single("image"),
//   userService.uploadProfilePicture
// );

/**
 * @swagger
 * /api/user/upload-profile-picture-cloud:
 *   patch:
 *     summary: Upload profile picture to cloud storage
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture image file (JPEG, PNG, JPG)
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid file type or validation error
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/upload-profile-picture-cloud",
  authMiddleware,
  cloudFail({validation: fileValidation.image}).single("image"),
  validationMiddleware(profileImageValidation),
  userService.uploadProfilePictureCloud
);

/**
 * @swagger
 * /api/user/upload-cover-picture:
 *   post:
 *     summary: Upload cover pictures to cloud storage
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Cover picture image files (JPEG, PNG, JPG) - max 5 images
 *     responses:
 *       200:
 *         description: Cover pictures uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid file type or validation error
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/upload-cover-picture",
  authMiddleware,
  cloudFail({ validation: fileValidation.image }).array("images", 5),
  validationMiddleware(coverPictureValidation),
  userService.uploadCoverPicture
);

export default router;
