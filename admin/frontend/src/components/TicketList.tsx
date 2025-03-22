import { Link } from "react-router-dom"
import type { Ticket } from "../services/types"

export default function TicketList({
  tickets,
  clerkId,
}: {
  tickets: Ticket[]
  clerkId: string
}) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg shadow-md border border-[#333333] p-6">
      <h2 className="text-xl font-bold mb-6">Your Tickets</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-[#333333] rounded-lg p-4 hover:border-[#ff3333] transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-white">{ticket.title}</h3>
                <p className="text-gray-400 text-sm mt-2">{ticket.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      ticket.status === "open"
                        ? "bg-[#330000] text-red-300"
                        : ticket.status === "pending"
                          ? "bg-[#332200] text-yellow-300"
                          : "bg-[#1a1a1a] text-gray-300"
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    ticket.urgency === "high"
                      ? "bg-red-900 text-red-200"
                      : ticket.urgency === "medium"
                        ? "bg-[#332200] text-yellow-300"
                        : "bg-[#1a1a1a] text-gray-300"
                  }`}
                >
                  {ticket.urgency}
                </span>
                <Link
                  to={`/ticket-center/${clerkId}/chat/${ticket.id}`}
                  className="text-sm px-3 py-1 bg-red-900 text-white rounded-full hover:bg-red-800 transition-colors"
                >
                  Open Chat →
                </Link>
              </div>
            </div>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-center text-gray-400">No tickets found</p>}
      </div>
    </div>
  )
}

