import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';
import {
  sendInquiryNotification,
  verifySmtpConnection,
  createTransporter,
  sendTestEmail
} from '../utils/emailService.js';

describe('Email Notification Service Unit Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('1. sendInquiryNotification — should skip email dispatch cleanly when credentials are omitted', async () => {
    delete process.env.EMAIL_USER;
    delete process.env.SMTP_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.SMTP_PASS;

    const result = await sendInquiryNotification({
      name: 'Test Client',
      email: 'client@example.com',
      subject: 'Freelance Lead',
      message: 'Interested in Full CMS Portfolio.'
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe('NOT_CONFIGURED');
  });

  it('2. verifySmtpConnection — should report configured: false when credentials are not set', async () => {
    delete process.env.EMAIL_USER;
    delete process.env.SMTP_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.SMTP_PASS;

    const result = await verifySmtpConnection();
    expect(result.configured).toBe(false);
    expect(result.connected).toBe(false);
    expect(result.message).toMatch(/credentials/i);
  });

  it('3. createTransporter — strips spaces from Gmail App Passwords and configures port 465 SSL', () => {
    process.env.SMTP_USER = 'arun.developer@gmail.com ';
    process.env.SMTP_PASS = 'abcd efgh ijkl mnop'; // 16-char app password with spaces

    const spy = vi.spyOn(nodemailer, 'createTransport');
    createTransporter();

    expect(spy).toHaveBeenCalled();
    const config = spy.mock.calls[0][0];
    expect(config.host).toBe('smtp.gmail.com');
    expect(config.port).toBe(465);
    expect(config.secure).toBe(true);
    expect(config.auth.user).toBe('arun.developer@gmail.com');
    expect(config.auth.pass).toBe('abcdefghijklmnop'); // Spaces stripped!
  });

  it('4. sendInquiryNotification — dispatches email with correct To, From, and Reply-To headers', async () => {
    process.env.SMTP_USER = 'sender@gmail.com';
    process.env.SMTP_PASS = 'mockapppassword16';

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: '<lead-123@gmail.com>' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock
    });

    const messageData = {
      name: 'Rahul Sharma',
      email: 'rahul.visitor@example.com',
      subject: 'Custom Web Development',
      message: 'Need a multi-client portal for our agency.'
    };

    const result = await sendInquiryNotification(messageData, {
      recipientEmail: 'portfolio.owner@gmail.com',
      portfolioName: 'Arun Kumar Portfolio'
    });

    expect(result.sent).toBe(true);
    expect(result.messageId).toBe('<lead-123@gmail.com>');
    expect(result.recipient).toBe('portfolio.owner@gmail.com');

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMailMock.mock.calls[0][0];
    expect(callArgs.to).toBe('portfolio.owner@gmail.com');
    expect(callArgs.replyTo).toBe('rahul.visitor@example.com');
    expect(callArgs.subject).toContain('Arun Kumar Portfolio');
    expect(callArgs.subject).toContain('Custom Web Development');
    expect(callArgs.html).toContain('Rahul Sharma');
    expect(callArgs.html).toContain('rahul.visitor@example.com');
    expect(callArgs.html).toContain('Need a multi-client portal for our agency.');
  });

  it('5. sendTestEmail — dispatches a diagnostic verification message to the specified recipient', async () => {
    process.env.SMTP_USER = 'sender@gmail.com';
    process.env.SMTP_PASS = 'mockapppassword16';

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: '<test-456@gmail.com>' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock
    });

    const result = await sendTestEmail('owner@gmail.com', 'Test Portfolio');
    expect(result.sent).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMailMock.mock.calls[0][0];
    expect(callArgs.to).toBe('owner@gmail.com');
    expect(callArgs.subject).toContain('Test Verification Email');
  });

});
