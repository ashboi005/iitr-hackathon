"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { pusher } from "../services/pusher"
import { chatApi } from "../services/api"
import type { ChatMessage } from "../services/types"

export default function ChatWindow() {
  const { ticketId, clerkId } = useParams<{
    ticketId?: string
    clerkId?: string
  }>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ticketId) return

    const loadMessages = async () => {
      try {
        const data = await chatApi.getMessages(Number.parseInt(ticketId))
        setMessages(data)
      } catch (err) {
        setError("Failed to load messages")
      }
    }

    loadMessages()

    const channel = pusher.subscribe(`ticket-${ticketId}`)
    channel.bind("new-message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [ticketId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !ticketId || !clerkId) return

    try {
      await chatApi.sendMessage(Number.parseInt(ticketId), {
        sender_id: clerkId,
        message: newMessage,
      })
      setNewMessage("")
    } catch (err) {
      setError("Failed to send message")
    }
  }

  if (!ticketId) return <div className="p-4 text-red-600">Invalid Ticket ID</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="h-screen flex flex-col bg-[#121212] p-4">
      <div className="flex-1 bg-[#1e1e1e] rounded-lg shadow-inner p-4 mb-4 overflow-y-auto border border-[#333333]">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#ff3333]">{msg.sender_name}</span>
              <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
            </div>
            <p className="bg-[#252525] rounded-lg p-3 border border-[#333333]">{msg.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-[#333333] rounded-lg bg-[#252525] text-white focus:ring-2 focus:ring-[#ff3333] focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#ff3333] text-white rounded-lg hover:bg-[#ff5555] transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}

