import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // Ensure env is loaded

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// 🔍 SELF-CHECK: This runs once when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Config Error:", error.message);
  } else {
    console.log("🚀 Mail Server is ready to send messages");
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    console.error("❌ Email error: No recipient address provided");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"University E-Complaint" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error(`❌ Email error for ${to}:`, err.message);
    // Rethrow or handle based on your needs
  }
};