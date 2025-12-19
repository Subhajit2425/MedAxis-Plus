const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Email wrapper (same layout, unchanged)
const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 520px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }
    .header {
      background: #1a2a4e;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 24px;
      color: #333333;
      font-size: 15px;
      line-height: 1.6;
    }
    .footer {
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      background: #f9fafb;
    }
    .highlight {
      font-size: 26px;
      letter-spacing: 4px;
      font-weight: bold;
      color: #1a2a4e;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${title}</div>
    <div class="content">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} MedAxis · All rights reserved
    </div>
  </div>
</body>
</html>
`;

module.exports = async ({ to, subject, title, content }) => {
  return resend.emails.send({
    from: "MedAxis <onboarding@resend.dev>", // works instantly
    to,
    subject,
    html: emailTemplate(title, content)
  });
};
