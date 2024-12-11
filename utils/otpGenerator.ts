import dotenv from "dotenv";
import { createTransport } from "nodemailer";
import { redis, transporter } from "../config/config";

dotenv.config({ path: ".env.local" });

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (userId: string, otp: string) => {
  await redis.set(`otp:${userId}`, otp, "EX", 600);
};

export const verifyOTP = async (userId: string, otp: string) => {
  const storedOTP = await redis.get(`otp:${userId}`);
  if (!storedOTP || storedOTP !== otp) {
    throw new Error("Invalid OTP");
  }
  await redis.del(`otp:${userId}`);
  return true;
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    to: email,
    subject: "Verify Your Email",
    html: `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
  });
  console.log(`Email sent to ${email} with OTP: ${otp}`);
};
