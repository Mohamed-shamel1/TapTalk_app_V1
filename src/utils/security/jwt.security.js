import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import { nanoid } from "nanoid";
import * as DBservice from "../../DB/DB.service.js";
import tokenModel from "../../model/Token.model.js";
import User from "../../model/user.model.js";
export const signatureLevelEnum = {system:"System" , Bearer:"Bearer"}
export const logoutEnum = {logoutFromAllDevices:"logoutFromAllDevices" , logout:"logout" , staylogedIn:"staylogedIn"}
dotenv.config();
//داله ل انشاء ال access token وال refresh token
// =============================
// إنشاء Access + Refresh Tokens
// =============================
export const createTokens = ({
  payload = {},
  accessExpiresIn = process.env.JWT_EXPIRE || "1h",
  refreshExpiresIn = process.env.JWT_EXPIRE_REFRESH || "1y",
  accessSecret = process.env.JWT_SECRET,
  refreshSecret = process.env.JWT_SECRET_REFRESH,
} = {}) => {
  const jwtId = nanoid(); // توليد jti مرة واحدة بس

  const accessToken = generateToken({
    payload,
    expiresIn: accessExpiresIn,
    secret: accessSecret,
    jwtId,
  });

  const refreshTokenValue = refreshToken({
    userId: payload.userId,
    expiresIn: refreshExpiresIn,
    secret: refreshSecret,
    jwtId,
  });

  return { accessToken, refreshToken: refreshTokenValue };
};


// =============================
// إنشاء Access Token فقط
// =============================
export const generateToken = ({
  payload = {},
  expiresIn = process.env.JWT_EXPIRE || "1h",
  secret = process.env.JWT_SECRET,
  jwtId,
} = {}) => {
  return jwt.sign(
    { ...payload },
    secret,
    { expiresIn, ...(jwtId && { jwtid: jwtId }) }
  );
};


// =============================
// إنشاء Refresh Token فقط
// =============================
export const refreshToken = ({
  userId,
  expiresIn = process.env.JWT_EXPIRE_REFRESH || "1y",
  secret = process.env.JWT_SECRET_REFRESH,
  jwtId,
} = {}) => {
  return jwt.sign(
    { userId },
    secret,
    { expiresIn, ...(jwtId && { jwtid: jwtId }) }
  );
};



// التحقق من أي Token
export const verifyRefreshToken = async ({
  token="",
  isRefreshToken = false,
  secret = ""
}={})=>{
  const decoded = jwt.verify(token, secret);

  const user = await DBservice.findById({ model:User,  id: decoded.userId });
  if (user.changeCredintialsTime?.getTime()>decoded.iat * 1000) {
    throw new Error("In-valid credintionals").cause = 401;
  }
  if (decoded.jti&& await DBservice.findOne({ model: tokenModel,filter: { jti: decoded.jti } })) {
    throw new Error("you are logged out from this device"); 
  }

  return decoded;
} 





export const getSignatureLevel = async ({signatureLevel=signatureLevelEnum.Bearer}={})=>{
      // إذا كان المستخدم هو المسؤول، استخدم مفتاح JWT_SECRET_SYSTEM
      let secretKey = { accessKey: undefined, refreshKey: undefined };
      // console.log( process.env.JWT_SECRET_SYSTEM , process.env.JWT_SECRET_SYSTEM_REFRESH);
      // console.log( process.env.JWT_SECRET , process.env.JWT_SECRET_REFRESH);
      switch (signatureLevel) {
        case signatureLevelEnum.system:
          secretKey.accessKey = process.env.JWT_SECRET_SYSTEM;
          secretKey.refreshKey =  process.env.JWT_SECRET_SYSTEM_REFRESH;
          break;
      
        default:
          secretKey.accessKey = process.env.JWT_SECRET;
          secretKey.refreshKey = process.env.JWT_SECRET_REFRESH;
          break;
      }
      return {secretKey ,signatureLevel };
}