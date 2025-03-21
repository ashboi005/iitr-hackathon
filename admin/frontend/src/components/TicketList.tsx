import { Link } from 'react-router-dom';
import { Ticket } from '../services/types';

export default function TicketList({ tickets, clerkId }: { 
  tickets: Ticket[];
  clerkId: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Your Tickets</h2>
      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{ticket.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{ticket.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  ticket.urgency === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.urgency}
                </span>
                <Link 
                  to={`/ticket-center/${clerkId}/chat/${ticket.id}`}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Open Chat →
                </Link>
              </div>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-center text-gray-500">No tickets found</p>
        )}
      </div>
    </div>
  );
}