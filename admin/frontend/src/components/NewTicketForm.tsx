"use client"

import type React from "react"

import { useState } from "react"

export default function NewTicketForm({
  onCreate,
}: {
  onCreate: (title: string, description: string, urgency: string) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [urgency, setUrgency] = useState("medium")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(title, description, urgency)
    setTitle("")
    setDescription("")
    setUrgency("medium")
  }

  return (
    <div className="bg-[#1e1e1e] rounded-lg shadow-md border border-[#333333] p-6">
      <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ticket Title"
          className="w-full p-2 border border-[#333333] rounded-lg bg-[#252525] text-white focus:border-[#ff3333] focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe your issue"
          className="w-full p-2 border border-[#333333] rounded-lg bg-[#252525] text-white h-32 focus:border-[#ff3333] focus:outline-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          className="w-full p-2 border border-[#333333] rounded-lg bg-[#252525] text-white focus:border-[#ff3333] focus:outline-none"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
        >
          <option value="low">Low Urgency</option>
          <option value="medium">Medium Urgency</option>
          <option value="high">High Urgency</option>
        </select>
        <button
          type="submit"
          className="w-full py-2 bg-[#ff3333] text-white rounded-lg hover:bg-[#ff5555] transition-colors"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  )
}

