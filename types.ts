
export interface Message {
  id: string;
  recipient: string;
  content: string;
  status: 'pending' | 'sent' | 'failed';
  timestamp: Date;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  QR_READY = 'QR_READY'
}

export interface DashboardStats {
  totalSent: number;
  pending: number;
  failed: number;
  activeSessions: number;
}
