"use client"

import { useNavigate, useLocation } from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Extract potential Clerk ID from URL path
  const pathSegments = pathname.split("/")
  const clerkId = pathSegments.length > 2 ? pathSegments[2] : null

  const handleNavigation = () => {
    if (clerkId) {
      // Navigate back to ticket center if Clerk ID exists
      navigate(`/ticket-center/${clerkId}`)
    } else {
      // Fallback to root path (handled by main Next.js app)
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#121212] to-[#1a0000] p-6">
      <div className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-9xl font-bold text-white opacity-90">404</h1>
        <p className="text-2xl text-gray-300 mb-4">
          {clerkId ? "Ticket Center Page Not Found" : "Invalid Application Route"}
        </p>

        <button
          onClick={handleNavigation}
          className="px-8 py-3 bg-gradient-to-r from-[#ff3333] to-[#990000] text-white rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {clerkId ? (
            <>
              <span className="mr-2">←</span>
              Return to Ticket Center
            </>
          ) : (
            "Back to Main Dashboard"
          )}
        </button>

        <p className="text-gray-400 text-sm mt-6">{clerkId && `Clerk ID: ${clerkId}`}</p>
      </div>
    </div>
  )
}

