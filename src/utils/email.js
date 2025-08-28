import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load environment variables from .env file



const sendEmail = async ({
  from=process.env.EMAIL_USER,
  to,
  html="",
  subject="TapTalk",
  attachments=[]
}={}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // أو حسب مزود الإيميل بتاعك
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const mailOptions = {
  from: `"TapTalk 💬" <${process.env.EMAIL_USER}>`,
  to,
  subject,
  html,
  attachments
};
  await transporter.sendMail(mailOptions);
};
export { sendEmail  };
