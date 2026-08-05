export interface WhatsAppMessageOptions {
  recipientPhone: string; // E.164 format or standard digits (e.g., +1234567890 or 1234567890)
  patientName: string;
  doctorName: string;
  treatmentName: string;
  date: string;
  timeSlot: string;
  clinicName?: string;
}

export interface SendWhatsAppResponse {
  success: boolean;
  sentViaApi: boolean;
  whatsappDeepLink: string;
  message: string;
}

/**
 * Normalizes phone numbers into clean digit-only format for WhatsApp wa.me links
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  // Pakistan local 11-digit mobile (03XX XXXXXXX -> 923XX XXXXXXX)
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  }
  // UK local 11-digit mobile (07XXX XXXXXX -> 447XXX XXXXXX)
  else if (cleaned.length === 11 && cleaned.startsWith('07')) {
    cleaned = '44' + cleaned.substring(1);
  }
  // US/Canada 10-digit number
  else if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  return cleaned;
}

/**
 * Builds a friendly, formatted WhatsApp confirmation text
 */
export function buildWhatsAppAppointmentText(opts: WhatsAppMessageOptions): string {
  const clinic = opts.clinicName || 'Dentora Flagship Practice';
  return (
    `*Appointment Confirmation - ${clinic}*\n\n` +
    `Hello *${opts.patientName}*,\n` +
    `Your appointment has been successfully scheduled!\n\n` +
    `📅 *Date:* ${opts.date}\n` +
    `⏰ *Time:* ${opts.timeSlot}\n` +
    `👨‍⚕️ *Doctor:* ${opts.doctorName}\n` +
    `🦷 *Treatment:* ${opts.treatmentName}\n` +
    `📍 *Location:* ${clinic}\n\n` +
    `If you need to reschedule or have any questions, please reply directly to this message. We look forward to seeing you!`
  );
}

/**
 * Generates a direct wa.me WhatsApp URL for 1-click messaging
 */
export function getWhatsAppDeepLink(opts: WhatsAppMessageOptions): string {
  const phone = formatPhoneForWhatsApp(opts.recipientPhone);
  const text = buildWhatsAppAppointmentText(opts);
  const encodedText = encodeURIComponent(text);
  
  if (phone) {
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export interface WhatsAppWebStatus {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
  qrDataUrl: string | null;
  user: { id?: string; name?: string } | null;
  error: string | null;
}

/**
 * Fetch status and QR code of WhatsApp Web bot gateway
 */
export async function getWhatsAppWebStatus(): Promise<WhatsAppWebStatus> {
  try {
    const res = await fetch('/api/whatsapp/qr');
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (err) {
    return { status: 'disconnected', qrDataUrl: null, user: null, error: 'Server unreachable' };
  }
}

/**
 * Trigger fresh QR code generation or connection attempt
 */
export async function initializeWhatsAppWeb(): Promise<WhatsAppWebStatus> {
  try {
    const res = await fetch('/api/whatsapp/initialize', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to initialize');
    return await res.json();
  } catch (err: any) {
    return { status: 'disconnected', qrDataUrl: null, user: null, error: err.message };
  }
}

/**
 * Instantly pair a simulated WhatsApp device for testing
 */
export async function simulatePairWhatsAppWeb(): Promise<WhatsAppWebStatus> {
  try {
    const res = await fetch('/api/whatsapp/simulate-pair', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to simulate pair');
    return await res.json();
  } catch (err: any) {
    return {
      status: 'connected',
      qrDataUrl: null,
      user: { id: '15553368672@s.whatsapp.net', name: 'Dentora Main Clinic (+1 555-DENTORA)' },
      error: null,
    };
  }
}

/**
 * Unlink phone and clear WhatsApp session
 */
export async function logoutWhatsAppWeb(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/whatsapp/logout', { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Sends automated WhatsApp notification via WhatsApp Web bot or Meta Cloud API
 * or returns the 1-click WhatsApp deep link for client fallback.
 */
export async function sendWhatsAppAppointmentNotification(
  opts: WhatsAppMessageOptions
): Promise<SendWhatsAppResponse> {
  const deepLink = getWhatsAppDeepLink(opts);

  try {
    const res = await fetch('/api/whatsapp/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opts),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        sentViaApi: true,
        whatsappDeepLink: deepLink,
        message: data.message || 'Automated WhatsApp message sent!',
      };
    } else {
      return {
        success: true,
        sentViaApi: false,
        whatsappDeepLink: deepLink,
        message: data.message || 'WhatsApp Web bot not connected. Generated 1-click WhatsApp link.',
      };
    }
  } catch (err) {
    console.warn('Backend WhatsApp API call failed or unavailable, falling back to wa.me link:', err);
    return {
      success: true,
      sentViaApi: false,
      whatsappDeepLink: deepLink,
      message: 'Generated 1-click WhatsApp deep link.',
    };
  }
}
