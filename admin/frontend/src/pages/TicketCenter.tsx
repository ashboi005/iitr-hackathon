"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { User, Ticket } from "../services/types"
import { fetchUserData, fetchTickets, fetchPendingTickets, createTicket, banUser, updateTicketStatus } from "../services/api"
import TicketList from "../components/TicketList"
import AdminControls from "../components/AdminControls"
import NewTicketForm from "../components/NewTicketForm"

export default function TicketCenter() {
  const { clerkId } = useParams<{ clerkId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      if (!clerkId) {
        setError("Missing Clerk ID")
        return
      }

      try {
        const userData = await fetchUserData(clerkId)
        setUser(userData)

        if (userData.role === "admin") {
          const pending = await fetchPendingTickets(clerkId)
          setPendingTickets(pending)
        } else {
          const userTickets = await fetchTickets(clerkId)
          setTickets(userTickets)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [clerkId])

  const handleCreateTicket = async (title: string, description: string, urgency: string) => {
    if (!clerkId) return

    try {
      const newTicket = await createTicket({
        title,
        description,
        urgency,
        created_by: clerkId,
      })
      setTickets((prev) => [...prev, newTicket])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket")
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId)
      setPendingTickets((prev) => prev.filter((t) => t.created_by !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ban user")
    }
  }

  const handleResolveTicket = (ticketId: number) => {
    setPendingTickets(prev => prev.filter(t => t.id !== ticketId))
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!user || !clerkId) return <div className="p-8 text-center">User not found</div>

  return (
    <div className="min-h-screen bg-[#121212] p-8">
      <div className="max-w-6xl mx-auto">
        {/* ... existing user profile card ... */}

        {user.role === "admin" ? (
          <AdminControls 
            pendingTickets={pendingTickets}
            onBanUser={handleBanUser}
            onResolve={handleResolveTicket}
            clerkId={clerkId}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TicketList tickets={tickets} clerkId={clerkId} />
            <NewTicketForm onCreate={handleCreateTicket} />
          </div>
        )}
      </div>
    </div>
  )
}