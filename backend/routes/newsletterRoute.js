import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use another email provider (like Outlook, Zoho, etc.)
    auth: {
      user: process.env.EMAIL_USER, // Your business email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send the subscription email to your business email
    subject: "New Newsletter Subscription",
    text: `You have a new subscriber: ${email}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Subscription successful!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email. Try again later." });
  }
});

export default router;
