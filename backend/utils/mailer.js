const nodemailer = require('nodemailer');

let transporter;

const isMailEnabled = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );
};

const getTransporter = () => {
  if (transporter) return transporter;

  const smtpUser = String(process.env.SMTP_USER || '').trim();
  const smtpPass = String(process.env.SMTP_PASS || '')
    .replace(/\s+/g, '')
    .trim();

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    family: 4, // Force IPv4 to avoid ENETUNREACH errors on IPv6-disabled networks
    connectionTimeout: 10000, // 10s connection timeout
    socketTimeout: 10000, // 10s socket timeout
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  return transporter;
};

const formatCurrencyINR = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(Number.isNaN(amount) ? 0 : amount);
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const sendMailIfEnabled = async ({ to, subject, text, html }) => {
  if (!to) {
    console.warn('[MAIL] Skipped: recipient email is missing.');
    return { skipped: true };
  }

  if (!isMailEnabled()) {
    const missingVars = [];
    if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
    if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT');
    if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
    if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');
    if (!process.env.MAIL_FROM) missingVars.push('MAIL_FROM');
    console.warn(`[MAIL] Skipped: Missing SMTP variables: ${missingVars.join(', ')}`);
    return { skipped: true };
  }

  try {
    console.log(`[MAIL] Attempting to send email to: ${to}`);
    const mailer = getTransporter();
    console.log('[MAIL] Transporter created successfully');
    
    const info = await mailer.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html
    });
    
    console.log(`[MAIL] SUCCESS: Email sent. MessageID: ${info.messageId}`);
    return { skipped: false, messageId: info.messageId };
    
  } catch (error) {
    console.error(`[MAIL] ERROR sending to ${to}: ${error.message}`);
    console.error('[MAIL] Full error:', error);
    throw error; // Re-throw so controller can handle it
  }
};

exports.sendCoursePurchaseEmail = async ({
  to,
  fullName,
  courseName,
  courseDescription,
  amount,
  paymentId,
  orderId
}) => {
  const userName = fullName || 'Learner';
  const paidAmount = formatCurrencyINR(amount);
  const safeUserName = escapeHtml(userName);
  const safeCourseName = escapeHtml(courseName);
  const safeCourseDescription = escapeHtml(courseDescription || 'N/A');
  const safePaymentId = escapeHtml(paymentId || 'N/A');
  const safeOrderId = escapeHtml(orderId || 'N/A');

  const subject = `Payment Confirmed - ${courseName}`;

  const text = [
    `Hi ${userName},`,
    '',
    'Your payment is successful and your enrollment is now active.',
    '',
    `Course: ${courseName}`,
    `Description: ${courseDescription || 'N/A'}`,
    `Amount Paid: ${paidAmount}`,
    `Payment ID: ${paymentId || 'N/A'}`,
    `Order ID: ${orderId || 'N/A'}`,
    '',
    'Thank you for learning with ForensIQ.'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1f2937;">
      <h2 style="margin:0 0 16px;">Payment Successful</h2>
      <p>Hi ${safeUserName},</p>
      <p>Your payment is successful and your enrollment is now active.</p>
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:18px 0;">
        <p style="margin:0 0 8px;"><strong>Course:</strong> ${safeCourseName}</p>
        <p style="margin:0 0 8px;"><strong>Description:</strong> ${safeCourseDescription}</p>
        <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> ${paidAmount}</p>
        <p style="margin:0 0 8px;"><strong>Payment ID:</strong> ${safePaymentId}</p>
        <p style="margin:0;"><strong>Order ID:</strong> ${safeOrderId}</p>
      </div>
      <p style="margin:20px 0 0;">Thank you for learning with ForensIQ.</p>
    </div>
  `;

  return sendMailIfEnabled({ to, subject, text, html });
};

exports.sendWelcomeEmail = async ({ to, fullName }) => {
  const userName = fullName || 'Learner';
  const safeUserName = escapeHtml(userName);
  const subject = 'Welcome to ForensIQ';

  const text = [
    `Hi ${userName},`,
    '',
    'Welcome to ForensIQ. Your account has been created successfully.',
    '',
    'You can now log in and start learning from your dashboard.',
    '',
    'Best regards,',
    'ForensIQ Team'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1f2937;">
      <h2 style="margin:0 0 16px;">Welcome to ForensIQ</h2>
      <p>Hi ${safeUserName},</p>
      <p>Your account has been created successfully.</p>
      <p>You can now log in and start learning from your dashboard.</p>
      <p style="margin:20px 0 0;">Best regards,<br/>ForensIQ Team</p>
    </div>
  `;

  return sendMailIfEnabled({ to, subject, text, html });
};

exports.sendTestEmail = async ({ to, fullName }) => {
  const userName = fullName || 'Learner';
  const safeUserName = escapeHtml(userName);
  const sentAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const subject = 'ForensIQ SMTP Test Email';

  const text = [
    `Hi ${userName},`,
    '',
    'This is a test email from ForensIQ.',
    `Sent at: ${sentAt}`,
    '',
    'If you received this, your SMTP setup is working.'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1f2937;">
      <h2 style="margin:0 0 16px;">SMTP Test Successful</h2>
      <p>Hi ${safeUserName},</p>
      <p>This is a test email from ForensIQ.</p>
      <p><strong>Sent at:</strong> ${escapeHtml(sentAt)}</p>
      <p style="margin:20px 0 0;">If you received this, your SMTP setup is working.</p>
    </div>
  `;

  return sendMailIfEnabled({ to, subject, text, html });
};
