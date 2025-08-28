import { asyncHandler } from "../utils/response.js";
import * as jsonwebtoken from "../../src/utils/security/jwt.security.js";
import * as DBservice from "../DB/DB.service.js";
import User, { roleEnum } from "../model/user.model.js"; // Importing the User model
export const authMiddleware = asyncHandler(async (req, res, next) => {
    // Check if the Authorization header is present
    const authHeader = req.headers.authorization;
    const [type, token] = authHeader.split(' ') ;
    if (!type || !token) {
        return next(new Error('Authorization token is missing', { cause: 401 }));
    }
    if (type!==jsonwebtoken.signatureLevelEnum.Bearer && type!==jsonwebtoken.signatureLevelEnum.system) {
        return next(new Error('Unauthorized access', { cause: 401 }));
    }
        
        // إذا كان المستخدم هو المسؤول، استخدم مفتاح JWT_SECRET_SYSTEM
        const {secretKey} = await jsonwebtoken.getSignatureLevel({signatureLevel :type })
        
        
    const decodedToken = await jsonwebtoken.verifyRefreshToken({
        token,
        isRefreshToken: false,
        secret:secretKey.accessKey
    });
    req.decoded = decodedToken;
   
    
    if (!decodedToken?.userId) {
        return next(new Error('Unauthorized access', { cause: 401 }));
    }
    const user = await DBservice.findById({ model: User, id: decodedToken.userId });
    if (!user) {
        return next(new Error('User not found', { cause: 404 }));
    }
    
    // Check if account is frozen (skip this check for restore account endpoint)
    if (user.deletedAt && !req.path.includes('/restore-account')) {
        return next(new Error('Account is frozen', { cause: 403 }));
    }
    
    req.user = user; // Attach user to the request object
    next();
});

export const authorization = ({accessRoles=[]}={})=>{
    return asyncHandler(
        async (req, res, next) => {
            if (accessRoles.includes(req.user.role)) {
                next();
            } else {
                next(new Error('Unauthorized access', { cause: 401 }));
            }
        }
    )
}