import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/leads", async (req, res) => {
    const { name, email, phone, requirement } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || "admid@aveltygroup.com";
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || adminEmail;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("SMTP configuration missing. Skipping email notification.");
      return res.status(200).json({ success: true, message: "Lead received, but email not sent (SMTP not configured)." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: smtpFrom,
      to: adminEmail,
      subject: `New Lead Submitted: ${name}`,
      text: `
        New lead details:
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Requirement: ${requirement}
      `,
      html: `
        <h3>New Lead Submitted</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Requirement:</strong> ${requirement}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email notification sent to ${adminEmail}`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error sending email notification:", error);
      res.status(500).json({ success: false, error: "Failed to send email notification." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
