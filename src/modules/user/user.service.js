import { successResponse, asyncHandler } from "../../utils/response.js";
import * as DBservice from "../../DB/DB.service.js";
import User from "../../model/user.model.js";
import * as encryption from "../../utils/security/encryption.js"; // Importing the encryption functions
import * as jsonwebtoken from "../../utils/security/jwt.security.js"; // Importing the JWT functions
import * as security from "../../utils/security/hash.security.js"; // Importing the hash functions
import tokenModel from "../../model/Token.model.js";
import pkg from "cloudinary";
import {
  cloud,
  deleteFolderByPrefixCloud,
  deleteResourcesCloud,
  uploadFileCloud,
  uploadFilesCloud,
} from "../../utils/multier/cloudinary.js";
const { v2, Cloudinary } = pkg;

export const logout = asyncHandler(async (req, res, next) => {
  const { flag } = req.body;
  switch (flag) {
    case jsonwebtoken.logoutEnum.logoutFromAllDevices:
      await DBservice.findOneAndUpdate({
        model: User,
        filter: { _id: req.decoded.userId },
        data: { changeCredintialsTime: new Date() },
      });
      break;

    default:
      await DBservice.create({
        model: tokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.decoded.userId,
            expireIn: req.decoded.iat + Number(process.env.JWT_EXPIRE_REFRESH),
          },
        ],
      });
      break;
  }

  return successResponse({
    res,
    data: {},
    message: "User logged out successfully",
    statusCode: 200,
  });
});
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await DBservice.findById({
    model: User,
    id: req.user._id,
    populate: [
      {
        path: "massages",
        populate: {
          path: "senderId",
          select: "firstName lastName profilePicture",
        },
      },
      {
        path: "sentMassages",
        populate: {
          path: "receiverId",
          select: "firstName lastName profilePicture",
        },
      },
    ],
  });
  user.phone = await encryption.decryptData({
    ciphertext: req.user.phone,
    key: "supersecretkey",
  }); // Decrypt the phone number before sending it to the client
  // console.log("decrypted phone", user.phone);
  // Remove sensitive information before sending the response
  return successResponse({
    res,
    data: { user },
    message: "User profile fetched successfully",
    statusCode: 200,
  });
});
export const sharedProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBservice.findOne({
    model: User,
    filter: { _id: userId, isVerified: true },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return successResponse({
    res,
    data: { user },
    message: "User profile fetched successfully",
    statusCode: 200,
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone, gender } = req.body;
  if (req.body.phone) {
    req.body.phone = await encryption.encryptData({ data: req.body.phone });
  }
  const updatedUser = await DBservice.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: req.body,
    options: { new: true },
  });
  if (!updatedUser) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return updatedUser
    ? successResponse({
        res,
        data: { user: updatedUser },
        message: "User profile updated successfully",
        statusCode: 200,
      })
    : next(new Error("User not found", { cause: 404 }));
});

export const freezeUserAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum.admin) {
    return next(new Error("Unauthorized access", { cause: 401 }));
  }
  const updatedUser = await DBservice.findOneAndUpdate({
    model: User,
    filter: { _id: userId || req.user._id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: req.user._id },
  });

  if (!updatedUser) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return updatedUser
    ? successResponse({
        res,
        data: { user: updatedUser },
        message: "User account frozen successfully",
        statusCode: 200,
      })
    : next(new Error("User not found", { cause: 404 }));
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await DBservice.findOneAndUpdate({
    model: User,
    filter: {
      _id: userId || req.user._id,
      deletedAt: { $exists: true },
      deletedBy: { $ne: req.user._id },
    },
    data: {
      $unset: { deletedAt: 1, deletedBy: 1 },
      restoreAt: new Date(),
      restoreBy: req.user._id,
    },
  });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return user
    ? successResponse({
        res,
        data: { user },
        message: "User account restored successfully",
        statusCode: 200,
      })
    : next(new Error("User not found", { cause: 404 }));
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBservice.deleteOne({
    model: User,
    filter: { _id: userId, deletedAt: { $exists: true } },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.deletedAt) {
    await deleteFolderByPrefixCloud({
      prefix: `${process.env.APP_NAME}/User/${userId}`,
    });
  }
  return user
    ? successResponse({
        res,
        data: { user },
        message: "User account deleted successfully",
        statusCode: 200,
      })
    : next(new Error("User not found", { cause: 404 }));
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!(await security.comparePassword(oldPassword, req.user.password))) {
    return next(new Error("Old password is incorrect", { cause: 400 }));
  }
  if (newPassword !== confirmPassword) {
    return next(
      new Error("New password and confirm password do not match", {
        cause: 400,
      })
    );
  }
  const user = await DBservice.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: { password: await security.hashPassword(newPassword) },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return user
    ? successResponse({
        res,
        data: { user },
        message: "User password updated successfully",
        statusCode: 200,
      })
    : next(new Error("User not found", { cause: 404 }));
});

// export const uploadProfilePicture = asyncHandler(
//   async (req, res, next) => {
//       const { file } = req;
//   console.log({file});

//       const user = await DBservice.findOneAndUpdate({ model: User, filter: { _id: req.user._id }, data: { profilePicture: req.file.finalPath } });
//     console.log({file})
//     return user? successResponse({ res, data: { user }, message: 'Profile picture uploaded successfully', statusCode: 200 }) : next(new Error('User not found', { cause: 404 }));
//   }
// )

export const uploadProfilePictureCloud = asyncHandler(
  async (req, res, next) => {
    const { file } = req;
    const { secure_url, public_id } = await uploadFileCloud({
      file: req.file,
      path: `User/${req.user._id}`,
    });

    const user = await DBservice.findOneAndUpdate({
      model: User,
      filter: { _id: req.user._id },
      data: {
        profilePicture: { secure_url: secure_url, public_id: public_id },
      },
      options: { new: false },
    });
    // هنا حطيت الاوبشن ب new false لانه يجيب البيانات القديمة
    if (user?.profilePicture?.public_id) {
      await cloud().uploader.destroy(user.profilePicture.public_id);
    }
    // const user = await DBservice.findOneAndUpdate({ model: User, filter: { _id: req.user._id }, data: { profilePicture: req.file.url } });
    return user
      ? successResponse({
          res,
          data: { user },
          message: "Profile picture uploaded successfully",
          statusCode: 200,
        })
      : next(new Error("User not found", { cause: 404 }));
  }
);

export const uploadCoverPicture = asyncHandler(async (req, res, next) => {
  const { files } = req;

  const attachments = await uploadFilesCloud({
    files: files,
    path: `User/${req.user._id}`,
  });

  const user = await DBservice.findOneAndUpdate({
    model: User,
    filter: { _id: req.user._id },
    data: { coverPicture: attachments },

    options: { new: false },
  });

  if (user?.coverPicture?.length) {
    await deleteResourcesCloud({
      public_ids: user.coverPicture.map((ele) => ele.public_id),
    });
  }

  //    // 4. رجّع نسخة الـ user بعد التحديث
  // const newUser = await DBservice.findOne({
  //   model: User,
  //   filter: { _id: req.user._id },
  // });

  return successResponse({
    res,
    data: { user },
    message: "Cover picture uploaded successfully",
    statusCode: 200,
  });
});
