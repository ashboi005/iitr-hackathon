"use client"

import type { Ticket } from "../services/types"
import { updateTicketStatus } from "../services/api"

export default function AdminControls({
  pendingTickets,
  onBanUser,
  onResolve,
  clerkId
}: {
  pendingTickets: Ticket[]
  onBanUser: (userId: string) => void
  onResolve: (ticketId: number) => void
  clerkId: string
}) {
  const handleResolve = async (ticketId: number) => {
    try {
      await updateTicketStatus(clerkId, ticketId, 'resolved')
      onResolve(ticketId)
    } catch (err) {
      console.error('Resolution failed:', err)
    }
  }

  return (
    <div className="bg-[#1e1e1e] rounded-lg shadow-md border border-[#333333] p-6">
      <h2 className="text-xl font-bold mb-6">Pending Tickets</h2>
      <div className="space-y-4">
        {pendingTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-[#333333] rounded-lg p-4 hover:border-[#ff3333] transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-white">{ticket.title}</h3>
                <p className="text-gray-400 text-sm mt-2">{ticket.description}</p>
                <div className="mt-2 text-xs text-gray-400">Created by: {ticket.created_by}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleResolve(ticket.id)}
                  className="px-3 py-1 bg-[#1a1a1a] text-gray-300 rounded hover:bg-[#252525] border border-[#333333]"
                >
                  Resolve
                </button>
                <button
                  onClick={() => onBanUser(ticket.created_by)}
                  className="px-3 py-1 bg-red-900 text-white rounded hover:bg-red-800 transition-colors"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingTickets.length === 0 && <p className="text-center text-gray-400">No pending tickets</p>}
      </div>
    </div>
  )
}