import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pusher } from '../services/pusher';
import { chatApi } from '../services/api';
import { ChatMessage } from '../services/types';

export default function ChatWindow() {
  const { ticketId, clerkId } = useParams<{ 
    ticketId?: string;
    clerkId?: string;
  }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketId) return;

    const loadMessages = async () => {
      try {
        const data = await chatApi.getMessages(parseInt(ticketId));
        setMessages(data);
      } catch (err) {
        setError('Failed to load messages');
      }
    };

    loadMessages();

    const channel = pusher.subscribe(`ticket-${ticketId}`);
    channel.bind('new-message', (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [ticketId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticketId || !clerkId) return;

    try {
      await chatApi.sendMessage(parseInt(ticketId), {
        sender_id: clerkId,
        message: newMessage
      });
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (!ticketId) return <div className="p-4 text-red-600">Invalid Ticket ID</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-4">
      <div className="flex-1 bg-white rounded-lg shadow-inner p-4 mb-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-blue-600">
                {msg.sender_name}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="bg-gray-100 rounded-lg p-3">{msg.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}