const API_BASE = import.meta.env.VITE_FLASK_API_URL;

export interface ApiError {
  error: string;
  message: string;
}

export const fetchUserData = async (clerkId: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/users/clerk/${clerkId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const fetchTickets = async (clerkId: string): Promise<Ticket[]> => {
  const response = await fetch(`${API_BASE}/tickets/user/${clerkId}`);
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return response.json();
};

export const fetchPendingTickets = async (): Promise<Ticket[]> => {
  const response = await fetch(`${API_BASE}/tickets/pending}`);
  if (!response.ok) throw new Error('Failed to fetch pending tickets');
  return response.json();
};

export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> => {
  const response = await fetch(`${API_BASE}/tickets}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(ticketData)
  });
  if (!response.ok) throw new Error('Failed to create ticket');
  return response.json();
};

export const banUser = async (clerkId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/admin/ban/${clerkId}`, { 
    method: 'POST' 
  });
  if (!response.ok) throw new Error('Failed to ban user');
};

export const chatApi = {
  getMessages: async (ticketId: number): Promise<ChatMessage[]> => {
    const response = await fetch(`${API_BASE}/chat/${ticketId}/messages}`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },
  
  sendMessage: async (ticketId: number, data: { sender_id: string, message: string }): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE}/chat/${ticketId}/messages}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  }
};