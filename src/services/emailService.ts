export type EmailTemplateType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'invoice_receipt'
  | 'password_reset'
  | 'welcome_patient'
  | 'followup_reminder';

export interface EmailPayload {
  to: string;
  recipientName: string;
  templateType: EmailTemplateType;
  subject: string;
  data: Record<string, any>;
}

export interface EmailLog {
  id: string;
  to: string;
  recipientName: string;
  templateType: EmailTemplateType;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'queued' | 'failed';
  htmlPreview: string;
}

export class EmailService {
  private static STORAGE_KEY = 'dentora_email_logs';

  public static getEmailLogs(): EmailLog[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      if (logs) return JSON.parse(logs);
    } catch (e) {
      console.warn('Failed to parse email logs', e);
    }
    return [
      {
        id: 'em-log-1',
        to: 'samira.k@example.com',
        recipientName: 'Samira Khan',
        templateType: 'appointment_reminder',
        subject: 'Appointment Reminder: Tomorrow at 10:00 AM - Dentora Flagship Clinic',
        sentAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'delivered',
        htmlPreview: this.generateHtml('appointment_reminder', 'Samira Khan', {
          date: 'Tomorrow, Aug 4',
          time: '10:00 AM',
          doctor: 'Dr. Elena Rostova',
          treatment: 'Routine Dental Hygiene & Composite Polish',
          clinicName: 'Dentora Flagship Clinic',
          clinicAddress: 'Floor 4, Medical Towers, Downtown',
          clinicPhone: '+92 300 1234567'
        }),
      },
      {
        id: 'em-log-2',
        to: 'ahmed.r@example.com',
        recipientName: 'Ahmed Raza',
        templateType: 'invoice_receipt',
        subject: 'Invoice & Receipt #INV-2026-0892 - Dentora Dental Practice',
        sentAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        status: 'delivered',
        htmlPreview: this.generateHtml('invoice_receipt', 'Ahmed Raza', {
          invoiceNumber: 'INV-2026-0892',
          totalAmount: 'Rs. 18,500',
          paidAmount: 'Rs. 18,500',
          date: 'Aug 3, 2026',
          treatmentList: 'Root Canal Obturation (Tooth #16), Dental X-Ray',
          paymentMethod: 'Credit Card (Visa)'
        }),
      }
    ];
  }

  public static async sendEmail(payload: EmailPayload): Promise<EmailLog> {
    const htmlPreview = this.generateHtml(payload.templateType, payload.recipientName, payload.data);
    
    // Simulate SMTP network call
    await new Promise((res) => setTimeout(res, 900));

    const newLog: EmailLog = {
      id: `em-log-${Date.now()}`,
      to: payload.to,
      recipientName: payload.recipientName,
      templateType: payload.templateType,
      subject: payload.subject,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      htmlPreview,
    };

    const currentLogs = this.getEmailLogs();
    const updated = [newLog, ...currentLogs];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

    return newLog;
  }

  public static generateHtml(templateType: EmailTemplateType, recipientName: string, data: Record<string, any>): string {
    const header = `
      <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-family: sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
          <span style="color: #3b82f6;">DENTORA</span> DENTAL PRACTICE OS
        </h1>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px; font-family: sans-serif;">Enterprise Dental Health & Patient Management</p>
      </div>
    `;

    const footer = `
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-family: sans-serif; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px 0;"><strong>Dentora Healthcare System</strong> • 24/7 Automated Dental Care</p>
        <p style="margin: 0;">Need to reschedule? Call us at <strong>${data.clinicPhone || '+92 300 1234567'}</strong> or reply to this email.</p>
      </div>
    `;

    let bodyContent = '';

    switch (templateType) {
      case 'appointment_confirmation':
        bodyContent = `
          <h2 style="color: #0f172a; margin-top: 0;">Appointment Confirmed!</h2>
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>Your dental appointment at <strong>${data.clinicName || 'Dentora Flagship Clinic'}</strong> has been successfully booked.</p>
          <div style="background: #eff6ff; border-left: 4px solid #1d5bd8; padding: 16px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${data.date || 'Tomorrow'}</p>
            <p style="margin: 4px 0;"><strong>⏰ Time:</strong> ${data.time || '10:00 AM'}</p>
            <p style="margin: 4px 0;"><strong>🩺 Doctor:</strong> ${data.doctor || 'Dr. Elena Rostova'}</p>
            <p style="margin: 4px 0;"><strong>🦷 Procedure:</strong> ${data.treatment || 'Comprehensive Dental Examination'}</p>
          </div>
          <p>Please arrive 10 minutes before your scheduled appointment time.</p>
        `;
        break;

      case 'appointment_reminder':
        bodyContent = `
          <h2 style="color: #0f172a; margin-top: 0;">Friendly Appointment Reminder 🦷</h2>
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>This is a quick reminder for your upcoming appointment scheduled for tomorrow.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 4px 0;"><strong>📅 Scheduled Date:</strong> ${data.date || 'Aug 4, 2026'}</p>
            <p style="margin: 4px 0;"><strong>⏰ Time Slot:</strong> ${data.time || '11:30 AM'}</p>
            <p style="margin: 4px 0;"><strong>📍 Location:</strong> ${data.clinicAddress || 'Dentora Flagship, Suite 402'}</p>
          </div>
          <p>If you need to make changes, please let us know at least 4 hours in advance.</p>
        `;
        break;

      case 'invoice_receipt':
        bodyContent = `
          <h2 style="color: #0f172a; margin-top: 0;">Payment Receipt & Invoice</h2>
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>Thank you for visiting Dentora Clinic. Below is your payment confirmation statement.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Invoice #:</strong> ${data.invoiceNumber || 'INV-9021'}</p>
            <p style="margin: 4px 0;"><strong>Treatments Rendered:</strong> ${data.treatmentList || 'Dental Clean & Polish'}</p>
            <p style="margin: 4px 0; font-size: 16px; color: #047857;"><strong>Total Paid:</strong> ${data.totalAmount || 'Rs. 12,000'}</p>
            <p style="margin: 4px 0; color: #64748b;">Payment Method: ${data.paymentMethod || 'Credit Card'}</p>
          </div>
        `;
        break;

      case 'password_reset':
        bodyContent = `
          <h2 style="color: #0f172a; margin-top: 0;">Security Password Reset Request</h2>
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>We received a request to reset your Dentora OS account password.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${data.resetLink || '#'}" style="background-color: #1d5bd8; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-family: sans-serif; display: inline-block;">Reset Password Now</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you did not request this, you can safely ignore this security notification.</p>
        `;
        break;

      case 'welcome_patient':
        bodyContent = `
          <h2 style="color: #0f172a; margin-top: 0;">Welcome to Dentora Dental OS! 👋</h2>
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>Welcome to our dental family! You now have access to our 24/7 Patient Portal where you can:</p>
          <ul style="color: #334155; line-height: 1.6;">
            <li>View your digital dental charts & X-ray records</li>
            <li>Book & reschedule appointments online anytime</li>
            <li>Receive AI-powered post-treatment oral care guides</li>
            <li>Download official invoices & medical certificates</li>
          </ul>
        `;
        break;

      case 'followup_reminder':
        bodyContent = `
          <h2 style="color: #0f172a; margin-top: 0;">Post-Procedure Oral Care Check-In 🦷</h2>
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>Dr. Elena Rostova and the team at Dentora hope you are recovering comfortably after your recent treatment.</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0;"><strong>Care Tip:</strong> Continue soft warm saline rinses and follow your prescribed medication schedule.</p>
          </div>
          <p>If you experience unexpected swelling or pain, please reach out to our emergency line immediately.</p>
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.subject || 'Dentora Notification'}</title>
        </head>
        <body style="background-color: #f1f5f9; font-family: sans-serif; padding: 20px; margin: 0;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
            ${header}
            <div style="padding: 28px; color: #334155; font-size: 15px; line-height: 1.6;">
              ${bodyContent}
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }
}
