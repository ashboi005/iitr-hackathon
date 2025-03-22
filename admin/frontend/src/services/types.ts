export interface User {
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'freelancer' | 'employer';
  isBanned: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'resolved';
  created_by: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface ChatMessage {
  id: number;
  ticket_id: number;
  sender_id: string;
  message: string;
  timestamp: string;
  sender_name: string;
}