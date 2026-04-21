const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  let input;
  try {
    input = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid request data' }) };
  }

  const name = (input.name || '').trim().substring(0, 100);
  const email = (input.email || '').trim().substring(0, 200);
  const subject = (input.subject || '').trim().substring(0, 200);
  const message = (input.message || '').trim().substring(0, 5000);

  // Validation
  const errors = [];
  if (!name || name.length < 2) errors.push('Name is required (min 2 characters)');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!subject || subject.length < 3) errors.push('Subject is required (min 3 characters)');
  if (!message || message.length < 10) errors.push('Message is required (min 10 characters)');

  if (errors.length) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: errors.join('. ') }) };
  }

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeSubject = esc(subject);
  const safeMessage = esc(message).replace(/\n/g, '<br/>');
  const date = new Date().toISOString().replace('T', ' — ').substring(0, 18);

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Portfolio Contact: ${safeSubject}</title>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700;800&family=Noto+Serif+JP:wght@400;700;900&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0f; font-family:'Shippori Mincho','Noto Serif JP',Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f; padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
<tr><td style="background: linear-gradient(90deg, #c23030 0%, #8b1a1a 50%, #c23030 100%); height:4px; border-radius:2px;"></td></tr>
<tr><td style="background-color:#0f0f14; padding:30px 40px; text-align:center; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <p style="margin:0; font-size:11px; letter-spacing:6px; color:#c23030; text-transform:uppercase;">最終章 — Final Chapter</p>
  <h1 style="margin:10px 0 0; font-size:28px; font-weight:800; color:#f5f0e8; letter-spacing:4px;">New Message</h1>
  <p style="margin:8px 0 0; font-size:11px; letter-spacing:3px; color:rgba(245,240,232,0.3);">${date}</p>
</td></tr>
<tr><td style="background-color:#0f0f14; padding:0 40px; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-bottom:1px solid rgba(245,240,232,0.08);"></td></tr></table></td></tr>
<tr><td style="padding:0; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:30px 40px; background-color:#0f0f14;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(245,240,232,0.03); border:1px solid rgba(245,240,232,0.08); margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px; font-size:10px; letter-spacing:4px; color:rgba(245,240,232,0.3); text-transform:uppercase;">From</p>
      <p style="margin:0; font-size:18px; font-weight:700; color:#f5f0e8; letter-spacing:2px;">${safeName}</p>
      <p style="margin:4px 0 0; font-size:13px; color:#c23030; letter-spacing:1px;">${safeEmail}</p>
    </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td>
      <p style="margin:0 0 4px; font-size:10px; letter-spacing:4px; color:rgba(245,240,232,0.3); text-transform:uppercase;">Subject</p>
      <p style="margin:0; font-size:16px; font-weight:700; color:#f5f0e8; letter-spacing:1px; border-left:3px solid #c23030; padding-left:12px;">${safeSubject}</p>
    </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; border:2px solid #1a1a1a;">
    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="12" height="12" style="border-top:2px solid #c23030; border-left:2px solid #c23030;"></td><td></td><td width="12" height="12" style="border-top:2px solid #c23030; border-right:2px solid #c23030;"></td></tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 28px;">
        <p style="margin:0 0 8px; font-size:10px; letter-spacing:4px; color:rgba(26,26,26,0.4); text-transform:uppercase;">Message</p>
        <div style="font-size:14px; line-height:1.8; color:#1a1a1a; letter-spacing:0.3px;">${safeMessage}</div>
      </td></tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="12" height="12" style="border-bottom:2px solid #c23030; border-left:2px solid #c23030;"></td><td></td><td width="12" height="12" style="border-bottom:2px solid #c23030; border-right:2px solid #c23030;"></td></tr></table>
    </td></tr>
    </table>
  </td></tr>
  </table>
</td></tr>
<tr><td style="background-color:#0f0f14; padding:24px 40px; text-align:center; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:12px;">
  <tr><td style="width:44px; height:44px; border:2px solid #c23030; border-radius:3px; text-align:center; vertical-align:middle;">
    <span style="font-family:'Noto Serif JP',serif; font-size:12px; font-weight:900; color:#c23030; letter-spacing:1px;">開発者</span>
  </td></tr>
  </table>
  <p style="margin:0; font-size:11px; letter-spacing:4px; color:rgba(245,240,232,0.3);">MUAKHIR DEV &copy; 2026</p>
  <p style="margin:6px 0 0; font-size:10px; letter-spacing:2px; color:rgba(245,240,232,0.15);">Sent from MangaDevFolio</p>
</td></tr>
<tr><td style="background: linear-gradient(90deg, #c23030 0%, #8b1a1a 50%, #c23030 100%); height:4px; border-radius:2px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `MangaDevFolio <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      replyTo: `${name} <${email}>`,
      subject: `Portfolio Contact: ${subject}`,
      html: htmlBody,
      text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Message sent successfully' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Failed to send email. Please try again later.' }) };
  }
};
