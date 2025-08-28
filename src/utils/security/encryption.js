import CryptoJS from "crypto-js";
import User from "../../model/user.model.js";
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

export const encryptData = async ({data , key= process.env.ENCRYPTION_KEY}={}) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decryptData = async ({ciphertext, key = process.env.ENCRYPTION_KEY}={}) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
};
