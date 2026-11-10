const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // If creds are placeholders, log warning and return null (no crash)
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_USER.includes("your_email")
  ) {
    console.warn(
      "⚠️  Email credentials not set. Emails will not be sent. Update backend/.env to enable."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`   Text preview: ${text || "(html only)"}`);
    return { mock: true };
  }

  return t.sendMail({
    from: `"EventSphere" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

async function sendPasswordResetEmail(toEmail, toName, resetUrl) {
  const subject = "Reset your EventSphere password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0B1220;">Password Reset Request</h2>
      <p>Hi ${toName || "there"},</p>
      <p>You requested a password reset for your EventSphere account.</p>
      <p>Click the button below to set a new password. This link expires in 30 minutes.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background: #97BFD9; color: #0B1220; padding: 12px 30px;
                  text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 40px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
  const text = `Reset your EventSphere password: ${resetUrl} (expires in 30 minutes)`;
  return sendEmail({ to: toEmail, subject, html, text });
}

module.exports = { sendEmail, sendPasswordResetEmail };