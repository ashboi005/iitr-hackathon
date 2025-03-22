"use client"
import { useEffect, useState } from 'react'
import { Ticket, User } from '../services/types'
import { fetchPendingTickets, banUser, updateTicketStatus } from '../services/api'

export default function AdminDashboard({ clerkId }: { clerkId: string }) {
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    bannedUsers: 0
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const tickets = await fetchPendingTickets(clerkId)
        setPendingTickets(tickets)
        // Add actual stats API calls here
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [clerkId])

  const handleResolve = async (ticketId: number) => {
    try {
      await updateTicketStatus(clerkId, ticketId, 'resolved')
      setPendingTickets(prev => prev.filter(t => t.id !== ticketId))
    } catch (error) {
      console.error('Resolution failed:', error)
    }
  }

  const handleBan = async (userId: string) => {
    try {
      await banUser(userId)
      setPendingTickets(prev => prev.filter(t => t.created_by !== userId))
    } catch (error) {
      console.error('Ban failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Pending Tickets</h3>
            <p className="text-2xl font-bold">{pendingTickets.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Resolved Tickets</h3>
            <p className="text-2xl font-bold">{stats.resolvedTickets}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Banned Users</h3>
            <p className="text-2xl font-bold">{stats.bannedUsers}</p>
          </div>
        </div>

        {/* Pending Tickets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    <div className="text-sm text-gray-500">{ticket.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.created_by}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ticket.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      ticket.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button 
                      onClick={() => handleResolve(ticket.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleBan(ticket.created_by)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Ban User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pendingTickets.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No pending tickets found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}