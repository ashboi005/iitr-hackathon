import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import TicketCenter from './pages/TicketCenter'
import NotFound from './components/NotFound'
import ChatWindow from './components/ChatWindow'

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { clerkId } = useParams()
  const location = useLocation()
  
  // Add your actual Clerk ID validation logic here
  const validClerkIds = ['admin', 'user1', 'user2'] // Example valid IDs

  if (!clerkId || !validClerkIds.includes(clerkId)) {
    return <Navigate to="/404" state={{ from: location }} replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/ticket-center/admin" replace />} />
        
        <Route
          path="/ticket-center/:clerkId"
          element={
            <AuthGuard>
              <TicketCenter />
            </AuthGuard>
          }
        />

        <Route
          path="/admin/:clerkId"
          element={
            <AuthGuard role="admin">
              <AdminDashboard />
            </AuthGuard>
          }
        />

        <Route
          path="/ticket-center/:clerkId/chat/:ticketId"
          element={
            <AuthGuard>
              <ChatWindow />
            </AuthGuard>
          }
        />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App