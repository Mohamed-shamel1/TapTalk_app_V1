import joi from "joi";
import { genderEnum, roleEnum, providerEnum } from "../model/user.model.js";

export const userLoginValidation = joi.object({
    email: joi.string().required().email().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    password: joi.string().required().min(6).max(20).messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot exceed 20 characters",
    }),
})
export const userRegisterValidation = joi.object({
    firstName: joi.string().required().min(3).max(20).messages({
        "string.empty": "First name is required",
        "string.min": "First name must be at least 3 characters long",
        "string.max": "First name cannot exceed 20 characters",
    }),
    lastName: joi.string().required().min(3).max(20).messages({
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 3 characters long",
        "string.max": "Last name cannot exceed 20 characters",
    }),
    email: joi.string().required().email().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .when('provider', {
        is: providerEnum.system,
        then: joi.string().required().min(6).max(20),
        otherwise: joi.string().optional()
        }),
        phone:joi.string().pattern(new RegExp('^[0-9]{11}$')).
        when('provider', {
            is:providerEnum.system,
            then:joi.string().required().min(11).max(11),
            otherwise:joi.string().optional()
        }),
       role:joi.string().valid(...Object.values(roleEnum)),
        gender:joi.string().required().valid(...Object.values(genderEnum)).messages({
            "string.empty": "Gender is required",
            "any.only": "Gender must be either 'male' or 'female'",
        }),
        provider: joi.string().valid(...Object.values(providerEnum)),
        picture: joi.string().optional(),

        //quary feilds
        lang: joi.string().valid("ar", "en").default("en"),
    })




    export const validationConfiermEmail = joi.object({
        email: joi.string().required().email().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
        }),
        otp: joi.string().required().min(6).max(6).messages({
            "string.empty": "Code is required",
            "string.min": "Code must be at least 6 characters long",
            "string.max": "Code cannot exceed 6 characters",
        }),
    })


    export const validateForgetPassword = joi.object({
        email: joi.string().required().email().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
        }),
    })
    export const validateResetPassword = joi.object({
        password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
        .when('provider', {
            is: providerEnum.system,
            then: joi.string().required().min(6).max(20),
            otherwise: joi.string().optional()
            }),
            confirmPassword: joi.string().valid(joi.ref('password')).messages({
                "any.only": "Passwords do not match",
            }),
            otp: joi.string().required().min(6).max(6).messages({
                "string.empty": "Code is required",
                "string.min": "Code must be at least 4 characters long",
                "string.max": "Code cannot exceed 4 characters",
            }),
            email: joi.string().required().email().messages({
                "string.empty": "Email is required",
                "string.email": "Invalid email format",
            }),
        })