export interface SecureMessage {
  id: string;
  clinicId: string;
  senderId: string;
  senderName: string;
  senderRole: 'Doctor' | 'Receptionist' | 'Patient' | 'Admin' | 'AI Assistant';
  recipientId: string;
  recipientName: string;
  recipientRole: 'Doctor' | 'Receptionist' | 'Patient' | 'Admin';
  content: string;
  timestamp: string;
  read: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: string;
  lastTime?: string;
}
