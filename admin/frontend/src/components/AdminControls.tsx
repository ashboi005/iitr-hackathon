import { Ticket } from '../services/types';

export default function AdminControls({ 
  pendingTickets,
  onBanUser 
}: {
  pendingTickets: Ticket[];
  onBanUser: (userId: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Pending Tickets</h2>
      <div className="space-y-4">
        {pendingTickets.map(ticket => (
          <div key={ticket.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{ticket.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{ticket.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Created by: {ticket.createdBy}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                  Resolve
                </button>
                <button
                  onClick={() => onBanUser(ticket.createdBy)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingTickets.length === 0 && (
          <p className="text-center text-gray-500">No pending tickets</p>
        )}
      </div>
    </div>
  );
}