import { describe, it, expect } from 'vitest';
import { sendInquiryNotification } from '../utils/emailService.js';

describe('Email Notification Service Unit Tests', () => {

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

});
