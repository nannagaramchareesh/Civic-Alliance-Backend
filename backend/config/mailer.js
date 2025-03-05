import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, text) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📌 Subject: ${subject}`);
    console.log(`📝 Body: ${text}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: ", info.response);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};

export default sendMail;
