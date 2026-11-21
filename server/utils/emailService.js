import nodemailer from 'nodemailer';

/**
 * Creates and configures the Nodemailer transporter.
 * Supports Gmail SMTP with direct SSL (port 465) or STARTTLS (port 587),
 * as well as custom SMTP hosts. Strips whitespace from Gmail App Passwords.
 */
export const createTransporter = () => {
  const emailUser = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USERNAME ||
    process.env.GMAIL_USER ||
    ''
  ).trim();

  const rawPass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    ''
  );

  // Gmail App Passwords are 16 characters often formatted with spaces (e.g. 'abcd efgh ijkl mnop')
  const emailPass = rawPass.replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    return null;
  }

  const customHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null;
  const host = customHost || 'smtp.gmail.com';

  // Port: Default to 465 for Gmail (direct SSL, cloud-safe on Render), or 587 for custom SMTP
  const port = parseInt(process.env.SMTP_PORT, 10) || (host === 'smtp.gmail.com' ? 465 : 587);

  // Secure: Port 465 requires secure: true; Port 587 requires secure: false
  const secure = process.env.SMTP_SECURE !== undefined
    ? (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true)
    : (port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 10000,   // 10s greeting timeout
    socketTimeout: 15000      // 15s socket timeout
  });
};

/**
 * Verifies live SMTP credentials and server connectivity.
 */
export const verifySmtpConnection = async () => {
  const emailUser = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USERNAME ||
    process.env.GMAIL_USER ||
    ''
  ).trim();

  const rawPass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    ''
  );

  if (!emailUser || !rawPass) {
    return {
      configured: false,
      connected: false,
      message: 'SMTP credentials (SMTP_USER and SMTP_PASS) are not configured in environment variables.'
    };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return {
        configured: false,
        connected: false,
        message: 'Could not initialize email transporter.'
      };
    }

    await transporter.verify();
    return {
      configured: true,
      connected: true,
      user: emailUser,
      message: `SMTP connection to Gmail verified successfully (${emailUser}).`
    };
  } catch (err) {
    console.error('❌ [Email Service] SMTP verification failed:', err.message);
    let hint = '';
    if (err.message.includes('535') || err.message.includes('Username and Password not accepted') || err.code === 'EAUTH') {
      hint = 'Authentication failed. Please verify you are using a 16-character Gmail App Password (with 2-Step Verification enabled), NOT your standard Gmail account password.';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      hint = 'Network connection timed out or was refused. Check your SMTP host and port settings.';
    }

    return {
      configured: true,
      connected: false,
      user: emailUser,
      error: err.message,
      code: err.code || null,
      hint,
      message: `SMTP authentication failed: ${err.message}${hint ? ` — ${hint}` : ''}`
    };
  }
};

/**
 * Sends a visitor inquiry email notification to the portfolio owner.
 */
export const sendInquiryNotification = async (messageData, options = {}) => {
  const emailUser = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USERNAME ||
    process.env.GMAIL_USER ||
    ''
  ).trim();

  const rawPass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    ''
  );

  if (!emailUser || !rawPass) {
    console.log('ℹ️ [Email Service] Skipping email dispatch: SMTP_USER and SMTP_PASS environment variables are not set.');
    return { sent: false, reason: 'NOT_CONFIGURED' };
  }

  const recipientEmail = options.recipientEmail || process.env.NOTIFICATION_EMAIL || emailUser;
  const portfolioName = options.portfolioName || 'Portfolio CMS';

  if (!recipientEmail || !recipientEmail.trim()) {
    console.log('ℹ️ [Email Service] Skipping email dispatch: No recipient email configured.');
    return { sent: false, reason: 'NO_RECIPIENT' };
  }

  const cleanRecipient = recipientEmail.trim();

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { sent: false, reason: 'NOT_CONFIGURED' };
    }

    const fromAddress = process.env.EMAIL_FROM || `"${portfolioName} Alert" <${emailUser}>`;

    const mailOptions = {
      from: fromAddress,
      to: cleanRecipient,
      replyTo: messageData.email,
      subject: `🚨 New Lead [${portfolioName}]: ${messageData.subject || 'Portfolio Inquiry'} from ${messageData.name}`,
      text: `New Contact Inquiry Received for ${portfolioName}\n\n` +
            `Visitor Name: ${messageData.name}\n` +
            `Visitor Email: ${messageData.email}\n` +
            `Subject: ${messageData.subject || 'Portfolio Inquiry'}\n` +
            `Date: ${new Date(messageData.createdAt || Date.now()).toLocaleString()}\n\n` +
            `Message:\n${messageData.message}\n\n` +
            `---\nReply directly to this email to contact ${messageData.name}.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 auto;">
          <h2 style="color: #059669; margin-top: 0;">🎉 New Contact Inquiry Received for ${portfolioName}!</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #475569;">Visitor Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${messageData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Visitor Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${messageData.email}" style="color: #059669; text-decoration: underline;">${messageData.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
              <td style="padding: 8px 0; color: #0f172a;">${messageData.subject || 'Portfolio Inquiry'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Portfolio:</td>
              <td style="padding: 8px 0; color: #0f172a;">${portfolioName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Received At:</td>
              <td style="padding: 8px 0; color: #64748b;">${new Date(messageData.createdAt || Date.now()).toLocaleString()}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1e293b;">
${messageData.message}
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
            This email was sent to <strong>${cleanRecipient}</strong> because it is configured as the notification recipient for <strong>${portfolioName}</strong>.<br />
            You can reply directly to this email to communicate with <strong>${messageData.name}</strong>.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Notification email sent successfully to ${cleanRecipient}:`, info.messageId);
    return { sent: true, messageId: info.messageId, recipient: cleanRecipient };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send email notification to ${cleanRecipient}:`, err.message);
    return { sent: false, error: err.message, recipient: cleanRecipient };
  }
};

/**
 * Sends a diagnostic test email to verify live delivery.
 */
export const sendTestEmail = async (targetEmail, portfolioName = 'Portfolio CMS') => {
  const emailUser = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USERNAME ||
    process.env.GMAIL_USER ||
    ''
  ).trim();

  const recipient = (targetEmail || process.env.NOTIFICATION_EMAIL || emailUser).trim();

  if (!recipient) {
    return { sent: false, error: 'No recipient email specified for test email.' };
  }

  const testMessage = {
    name: 'Portfolio CMS Diagnostic Test',
    email: emailUser || 'support@portfolio-cms.local',
    subject: `Test Verification Email — ${portfolioName}`,
    message: `This is a test notification confirming that Gmail SMTP email notifications are functioning correctly on your live Portfolio CMS deployment.\n\nAll subsequent contact inquiries submitted through your public portfolio will be delivered to this inbox (${recipient}).`,
    createdAt: new Date().toISOString()
  };

  return await sendInquiryNotification(testMessage, {
    recipientEmail: recipient,
    portfolioName: `${portfolioName} (Test)`
  });
};
