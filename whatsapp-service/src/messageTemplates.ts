export interface TemplateVariables {
  patientName: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  treatmentName?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  amount?: string;
  [key: string]: string | undefined;
}

export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_confirmed'
  | 'appointment_rescheduled'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'payment_reminder';

export const DEFAULT_TEMPLATES: Record<NotificationType, string> = {
  appointment_confirmation: `🦷 *{{clinicName}}*

Hello *{{patientName}}* 👋

Your dental appointment request has been received & confirmed!

👨‍⚕️ *Doctor:* {{doctorName}}
📅 *Date:* {{appointmentDate}}
⏰ *Time:* {{appointmentTime}}
📍 *Location:* {{clinicAddress}}

Please arrive 10 minutes before your scheduled time.

Thank you,
*{{clinicName}}*
📞 {{clinicPhone}}`,

  appointment_confirmed: `✅ *Appointment Confirmed - {{clinicName}}*

Dear *{{patientName}}*,
Your appointment with *{{doctorName}}* on *{{appointmentDate}}* at *{{appointmentTime}}* is fully confirmed.

We look forward to seeing you!`,

  appointment_rescheduled: `📅 *Appointment Rescheduled - {{clinicName}}*

Hello *{{patientName}}*,
Your appointment has been rescheduled to:

📅 *New Date:* {{appointmentDate}}
⏰ *New Time:* {{appointmentTime}}
👨‍⚕️ *Doctor:* {{doctorName}}

Please reach out if you need further adjustments.`,

  appointment_cancelled: `❌ *Appointment Cancellation - {{clinicName}}*

Dear *{{patientName}}*,
Your appointment on *{{appointmentDate}}* at *{{appointmentTime}}* has been cancelled as requested.

To rebook, please visit our online portal or reply to this message.`,

  appointment_reminder: `🔔 *Appointment Reminder - {{clinicName}}*

Hello *{{patientName}}*,
This is a friendly reminder for your upcoming appointment tomorrow:

📅 *Date:* {{appointmentDate}}
⏰ *Time:* {{appointmentTime}}
👨‍⚕️ *Doctor:* {{doctorName}}

See you soon!`,

  payment_reminder: `💳 *Payment Receipt / Invoice Notice - {{clinicName}}*

Dear *{{patientName}}*,
Thank you for visiting {{clinicName}}.

📄 Invoice Amount: {{amount}}
Doctor: {{doctorName}}

If you have any billing inquiries, feel free to contact us at {{clinicPhone}}.`,
};

/**
 * Replaces {{variableName}} in template string with dynamic values
 */
export function renderTemplate(templateStr: string, vars: TemplateVariables): string {
  let result = templateStr;

  const defaults: TemplateVariables = {
    clinicName: vars.clinicName || 'Teethly Dental Practice',
    clinicPhone: vars.clinicPhone || '+1 (555) Teethly',
    clinicAddress: vars.clinicAddress || 'Medical Plaza, Suite 400',
    doctorName: vars.doctorName || 'Attending Dentist',
    appointmentDate: vars.appointmentDate || 'Upcoming Date',
    appointmentTime: vars.appointmentTime || 'Scheduled Time',
    patientName: vars.patientName || 'Valued Patient',
    amount: vars.amount || '$0.00',
    ...vars,
  };

  Object.entries(defaults).forEach(([key, val]) => {
    if (val !== undefined) {
      const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(reg, val);
    }
  });

  return result;
}
