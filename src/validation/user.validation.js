import Joi from "joi";
import { genderEnum } from "../model/user.model.js";

import * as jsonwebtoken from '../../src/utils/security/jwt.security.js'
import { fileValidation } from "../utils/multier/local.multer.js";

export const shareProfileValidation =Joi.object({
    userId : Joi.string().hex().length(24).required()
})
export const logout=Joi.object({
    flag : Joi.string().valid(...Object.values(jsonwebtoken.logoutEnum))
})

export const updateBasicInfo =Joi.object({
    firstName : Joi.string(),
    lastName : Joi.string(),
    email : Joi.string().email(),
    gender : Joi.string().valid(...Object.values(genderEnum)),
    phone : Joi.string().pattern(new RegExp('^[0-9]{11}$')),
    picture : Joi.string(),
})


export const freezeUserAccount=Joi.object({
    userId : Joi.string().hex().length(24)
})

export const unfreezeUserAccount=Joi.object({
    userId : Joi.string().hex().length(24)
})

export const deleteAccount=Joi.object({
    userId : Joi.string().hex().length(24)
})


export const updatePasswordValidation = Joi.object({
    oldPassword: Joi.string().required().min(6).max(20).messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot exceed 20 characters",
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).messages({
        "any.only": "Passwords do not match",
    }),
    password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot exceed 20 characters",
    }),
})

export const coverPictureValidation = Joi.object({
    files: Joi.array().items({
        images: Joi.array().items(Joi.object().keys({
            fieldname: Joi.string().valid('images').required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(), 
            mimetype: Joi.string().valid(...Object.values(fileValidation.image)).required(),
            // finalPath: Joi.string().required(),
            destination: Joi.string().required(),
            filename: Joi.string().required(),
            path: Joi.string().required(), 
            size: Joi.number().positive().required()
        }))
    }).min(1).max(2).required()
})

export const profileImageValidation = Joi.object({
    fieldname: Joi.string().valid("image").required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid(...["image/jpeg", "image/png", "image/jpg"])
      .required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().positive().required(),
  });
  
