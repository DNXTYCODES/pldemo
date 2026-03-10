import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, message } = req.body;

    // Configure Nodemailer with your email credentials
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other services like Yahoo, Outlook, etc.
      auth: {
        user: "ayomatthew891@gmail.com", // Replace with your email
        // pass: "wixv wfzp zlss ujoa", // Replace with your app password
        // pass: "savl fddc glfw vzcy", // Replace with your app password
        pass: "savlfddcglfwvzcy", // Replace with your app password
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`, // Sender's name and email
      to: "mayodele113@gmail.com", // Destination email
      subject: `New Contact Form Submission from ${name}`,
      text: `Message: ${message}\n\nFrom: ${name} (${email})`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("Email Error:", error);
      res
        .status(500)
        .json({ error: "Failed to send email. Please try again later." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
