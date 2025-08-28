import User, { providerEnum, roleEnum } from "../../model/user.model.js";
import {
  asyncHandler,
  globalErrorHandler,
  successResponse,
} from "../../utils/response.js";
import * as DBservice from "../../DB/DB.service.js";
import * as security from "../../utils/security/hash.security.js"; // Importing the hash functions
import * as encryption from "../../utils/security/encryption.js"; // Importing the encryption functions
import * as jsonwebtoken from "../../utils/security/jwt.security.js";
import * as dotenv from "dotenv";
import { sendEmail } from "../../utils/email.js"; // Importing the email utility
import { OAuth2Client } from "google-auth-library";
import eventEmitter from "../../utils/events/events.email.js";
import verify from "jsonwebtoken/verify.js";
import { templateEmail } from "../../utils/templates/email.templates.js";
import path from "path";
const __dirname = path.dirname(import.meta.url); // Get the directory name of the current module
import { fileURLToPath } from "url";
import {
  generateOTP,
  otpExpireAt,
  hashOtp,
  compareOtp,
  canSendOtp,
  recordOtpSend,
} from "../../utils/security/otp.js";
import { nanoid } from "nanoid";
import tokenModel from "../../model/Token.model.js";
dotenv.config(); // Load environment variables from .env file

//عمل اكونت جديد

export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone, gender } = req.body;
  // التحقق من وجود المستخدم بالفعل
  if (await DBservice.findOne({ model: User, filter: { email } })) {
    return next(new Error("User already exists", { cause: 409 }));
  }
  // تهيش الباسورد
  const hashedPassword = await security.hashPassword(password);
  //عمل انكريبت لل فون
  const encryptedPhone = await encryption.encryptData({
    data: phone,
    key: process.env.ENCRYPTION_KEY || "supersecretkey",
  });
  // توليد OTP عشوائي
  const otp = generateOTP(6); // Generates a 6-digit OTP
  const hashOTP = await hashOtp(otp); // Hash the OTP for storage
  // إنشاء مستخدم جديد
  const [newUser] = await DBservice.create({
    model: User,
    data: [
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        gender,
        isVerified: false,
        role: roleEnum.user,
        HashOtp: hashOTP,
        otpExpireAt: otpExpireAt(3),
        otpSendCount: 1,
        otpLastSentAt: new Date(),
        otpCounterResetAt: null,
      },
    ],
  });

  // توليد توكن التحقق من البريد الإلكتروني
  const emailToken = jsonwebtoken.generateToken({
    payload: { userId: newUser._id },
  });
  // إرسال بريد إلكتروني لتأكيد الحساب
  eventEmitter.emit("emailSent", {
    to: newUser.email,
    subject: "Confirm Your Email",
    otp: otp,
    html: templateEmail({
      otp: otp,
      title: "TapTalk Email Confirmation",
    }),
  });

  return successResponse({
    res,
    data: { user: newUser },
    message: "Registration successful",
    statusCode: 201,
  });
});
async function verifyGoogleAccount(idToken) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID.split(","),
  });

  const payload = ticket.getPayload();
  return payload;
}

// دالة لتسجيل الدخول باستخدام جوجل
export const googleSignUp = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  console.log(`Google ID Token: ${idToken}`);

  const payload = await verifyGoogleAccount(idToken);
  console.log(payload);

  const user = await DBservice.findOne({
    model: User,
    filter: { email: payload.email },
  });

  // عشان نعمل لوجين و ساين اب سوا ف ميثود واحده
  if (user) {
    if (user.provider === providerEnum.google) {
      const token = jsonwebtoken.generateToken({
        payload: { userId: user._id },
        secret: process.env.JWT_SECRET,
      });
      // Generate refresh token
      const refreshToken = jsonwebtoken.refreshToken({
        userId: user._id,
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return successResponse({
        res,
        data: { token, refreshToken },
        message: "Google login successful",
        statusCode: 200,
      });
    }
  }
  // إذا لم يكن المستخدم موجودًا، قم بإنشاء مستخدم جديد
  const newUser = await DBservice.create({
    model: User,
    data: [
      {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        googleProfile: payload.picture,
        isVerified: true, // Assuming Google sign-up means email is verified
        role: roleEnum.user, // Default role for Google sign-up
        provider: providerEnum.google, // Indicating that this user signed up via Google
      },
    ],
  });
  return successResponse({
    res,
    data: { user: newUser },
    message: "Google sign up successful",
    statusCode: 201,
  });
});

export const googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email } = await verifyGoogleAccount(idToken);
  console.log(`Google ID Token: ${idToken}`);
  console.log(`Email: ${email}`);
  const user = await DBservice.findOne({
    model: User,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const token = jsonwebtoken.generateToken({
    payload: { userId: user._id },
    secret: process.env.JWT_SECRET,
  });
  // Generate refresh token
  const refreshToken = jsonwebtoken.refreshToken({
    userId: user._id,
    secret: process.env.JWT_REFRESH_SECRET,
  });
  return successResponse({
    res,
    data: { token, refreshToken },
    message: "Google login successful",
    statusCode: 200,
  });
});

// دالة لتأكيد البريد الإلكتروني
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { otp, email } = req.body;
  if (!otp || !email) {
    return next(new Error("OTP is requried", { cause: 400 }));
  }
  const user = await DBservice.findOne({
    model: User,
    filter: { email, isVerified: false },
  });

  if (!user) {
    return next(
      new Error("user not found or already verified", { cause: 404 })
    );
  }
  if (new Date() > user.otpExpireAt) {
    return next(new Error("OTP has expired", { cause: 400 }));
  }

  if (!(await compareOtp(otp, user.HashOtp))) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }
  const updated = await DBservice.findOneAndUpdate({
    model: User,
    filter: { email },
    data: { isVerified: true, $inc: { __v: 1 } },
  });

  return successResponse({
    res,
    message: "Email confirmed successfully",
    statusCode: 200,
  });
});

// دالة نعملها عشان ننسى الباسورد
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new Error("Email is required", { cause: 400 }));
  }

  // Check if user exists
  const user = await DBservice.findOne({ model: User, filter: { email } });
  if (!user) {
    // console.log("User not found" , email);
    return next(new Error("User not found", { cause: 404 }));
  }

  await canSendOtp(user);

  //send otp in Email
  const otp = generateOTP();
  const hashedOtp = await hashOtp(otp);
  await DBservice.findOneAndUpdate({
    model: User,
    filter: { email },
    data: { HashOtp: hashedOtp, otpExpireAt: otpExpireAt(3) },
  });

  await recordOtpSend(user);

  eventEmitter.emit("emailSent", {
    to: user.email,
    subject: "Reset Your Password ",
    otp: otp,
    html: templateEmail({
      otp: otp,
      title: "TapTalk Password Reset",
    }),
  });
  return successResponse({
    res,
    message: "Reset password email sent",
    statusCode: 200,
  });
});

// دالة نعملها عشان نعيد تعيين الباسورد
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password, confirmPassword } = req.body;
  if (!email || !otp || !password || !confirmPassword) {
    return next(
      new Error("Email, OTP, password and confirm password are required", {
        cause: 400,
      })
    );
  }
  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match", { cause: 400 }));
  }
  const user = await DBservice.findOne({ model: User, filter: { email } });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (new Date() > user.otpExpireAt) {
    return next(new Error("OTP has expired", { cause: 400 }));
  }
  if (!(await compareOtp(otp, user.HashOtp))) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  // Hash the new password
  const hashedPassword = await security.hashPassword(password);

  // Update the user's password
  await DBservice.findOneAndUpdate({
    model: User,
    filter: { email },
    data: { password: hashedPassword },
  });

  return successResponse({
    res,
    message: "Password reset successfully",
    statusCode: 200,
  });
});

// تسجيل الدخول
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // البحث عن المستخدم
  const user = await DBservice.findOne({ model: User, filter: { email } }); // Exclude password from the response

  if (!user) {
    return next(new Error("Invalid email or password", { cause: 401 }));
  }

  // التحقق من كلمة المرور
  const isPasswordValid = await security.comparePassword(
    password,
    user.password
  );
  // داله الكومبير بتاخد اتنين باراميتر اول واحد الباسورد اللى اليوزر مدخله
  //و التاني بتكتب الباسورد اللى متدخل ف الداتا بيز و تبدا تقارن بقى
  if (!isPasswordValid) {
    return next(new Error("Invalid email or password", { cause: 401 }));
  }
  if (!user.isVerified) {
    return next(new Error("Email not verified", { cause: 403 }));
  }
  // Check if this account in not frezze
  if (user.deletedAt) {
    return next(new Error("Account is frozen", { cause: 403 }));
  }
  let signtures = await jsonwebtoken.getSignatureLevel({
    signatureLevel: user.role === roleEnum.admin ? "System" : "Bearer", // تحديد مستوى التوقيع بناءً على الدور
  });

  // const jwtId=nanoid();
  // إنشاء token
  const { accessToken: token, refreshToken: refresh_Token } =
    jsonwebtoken.createTokens({
      payload: { userId: user._id },
      accessExpiresIn: process.env.JWT_EXPIRE || "1h",
      refreshExpiresIn: process.env.JWT_EXPIRE_REFRESH || "1y",
      accessSecret: signtures.secretKey.accessKey,
      refreshSecret: signtures.secretKey.refreshKey,
    });

  // const token = jsonwebtoken.generateToken({
  //   payload: { userId: user._id },
  //   secret: signtures.secretKey.accessKey
  // });

  // const refresh_Token = jsonwebtoken.refreshToken({
  //   userId: user._id,
  //   secret: signtures.refreshKey
  // });
  // console.log("refresh_Token", refresh_Token);
  // console.log("expired time to refresh",process.env.JWT_EXPIRE_REFRESH);
  
  // console.log("secretkaysysysy", signtures.secretKey.accessKey);

  return successResponse({
    res,
    data: {
      token,
      refresh_Token,
      user: { isVerified: user.isVerified },
      role: user.role,
    },
    message: "Login successful",
    statusCode: 200,
  });
});

// داله الريفريش توكن
export const generateRefreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new Error("Refresh token is required", { cause: 400 }));
  }

  // Verify the refresh token
  const decoded = await jsonwebtoken.verifyRefreshToken({
    token: refreshToken,
    isRefreshToken: true,
    secret: process.env.JWT_SECRET_REFRESH,
  }); // true = Refresh Token
  if (!decoded?.userId) {
    return next(new Error("Invalid refresh token", { cause: 401 }));
  }

  const newAccessToken = jsonwebtoken.generateToken({
    payload: { userId: decoded.userId },
  });
  const newRefreshToken = jsonwebtoken.refreshToken({ userId: decoded.userId });

  return successResponse({
    res,
    data: { token: newAccessToken, refreshToken: newRefreshToken },
    message: "Token refreshed successfully",
    statusCode: 200,
  });
});
