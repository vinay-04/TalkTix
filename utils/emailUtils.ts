import { createTransport } from "nodemailer";
import dotenv from "dotenv";
import { transporter } from "../config/config";

dotenv.config({ path: ".env.local" });

export const sendEmailNotification = async (email: string) => {
  await transporter.sendMail({
    to: email,
    subject: "Booking Confirmation",
    html: `
            <h1>Booking Confirmation</h1>
            <p>Your booking has been confirmed.</p>
            <p>Thank you for choosing TalkTix!</p>
        `,
  });
  console.log(`Email sent to ${email}`);
};
