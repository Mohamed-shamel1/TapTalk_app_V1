import joi from "joi";
import { fileValidation } from "../utils/multier/cloud.multer.js";

export const createMassageValidation = joi.object({
    content: joi.string().required().min(1).max(1000).messages({
        "string.empty": "Message content is required",
        "string.min": "Message content must be at least 1 character long",
        "string.max": "Message content cannot exceed 1000 characters",
    }),
    params:joi.object().keys({
        receiverId: joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
            "string.empty": "Receiver ID is required",
            "string.pattern.base": "Receiver ID must be a valid MongoDB ObjectId",
        }),
    }),
    files:joi.array().items({
        images: joi.array().items(joi.object().keys({
            fieldname: joi.string().valid('images').required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(), 
            mimetype: joi.string().valid(...Object.values(fileValidation.image)).required(),
            // finalPath: joi.string().required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(), 
            size: joi.number().positive().required()
        })).min(0).max(2)
    })
});

// export const getMassageValidation = joi.object({
//     receiverId: joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
//         "string.empty": "Receiver ID is required",
//         "string.pattern.base": "Receiver ID must be a valid MongoDB ObjectId",
//     }),
//     page: joi.number().integer().min(1).default(1).messages({
//         "number.base": "Page must be a number",
//         "number.integer": "Page must be an integer",
//         "number.min": "Page must be at least 1",
//     }),
//     limit: joi.number().integer().min(1).max(50).default(10).messages({
//         "number.base": "Limit must be a number",
//         "number.integer": "Limit must be an integer",
//         "number.min": "Limit must be at least 1",
//         "number.max": "Limit cannot exceed 50",
//     }),
// });

export const getMassageValidation = joi.object({
    params:joi.object().keys({
        _id: joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
            "string.empty": "Receiver ID is required",
            "string.pattern.base": "Receiver ID must be a valid MongoDB ObjectId",
        }).required(),
    })
})
