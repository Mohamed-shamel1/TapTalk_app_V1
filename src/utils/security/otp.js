import { customAlphabet } from "nanoid";
import * as security from "../security/hash.security.js";
import * as DBservice from "../../DB/DB.service.js";

const MAX_OTP_ATTEMPTS = 5; // الحد الأقصى قبل الحظر
const BLOCK_DURATION_MINUTES = 10; // مدة الحظر
const OTP_COOLDOWN_SECONDS = 60; // دقيقة بين كل إرسال

export const generateOTP = (length = 6) => {
  const otp = customAlphabet("0123456789", length);
  return otp();
};


export const otpExpireAt = (minutes = 3) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const hashOtp = async (otp) => {
  return security.hashPassword(otp);
};

export const compareOtp = async (otp, hashedOtp) => {
  return security.comparePassword(otp, hashedOtp);
};

export async function canSendOtp(user) {
  const now = new Date();

  // لو المستخدم في فترة الحظر
  if (user.otpCounterResetAt && now < user.otpCounterResetAt) {
    const diff = Math.ceil((user.otpCounterResetAt - now) / 1000);
    throw new Error(`You are blocked from sending OTP for ${diff} seconds`, { cause: 429 });
  }

  // لو لسه معدتش دقيقة من آخر إرسال
  if (user.otpLastSentAt && (now - user.otpLastSentAt) < OTP_COOLDOWN_SECONDS * 1000) {
    const diff = Math.ceil(
      OTP_COOLDOWN_SECONDS - ((now - user.otpLastSentAt) / 1000)
    );
    throw new Error(`Please wait ${diff} seconds before requesting a new OTP`, { cause: 429 });
  }

  return true;
}

export async function recordOtpSend(user) {
  const now = new Date();
  let otpSendCount = user.otpSendCount || 0;

  otpSendCount += 1;

  let updateData = {
    otpLastSentAt: now,
    otpSendCount
  };

  // لو وصل الحد الأقصى → يبدأ فترة الحظر
  if (otpSendCount >= MAX_OTP_ATTEMPTS) {
    updateData.otpCounterResetAt = new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
    updateData.otpSendCount = 0;
  }

  await DBservice.findOneAndUpdate({
    model: user.constructor,
    filter: { _id: user._id },
    data: updateData
  });
}
