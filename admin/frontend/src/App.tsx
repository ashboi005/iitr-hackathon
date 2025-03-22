import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TicketCenter from './pages/TicketCenter';
import NotFound from './components/NotFound';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to ticket center with a default clerkId */}
        <Route path="/" element={<Navigate to="/ticket-center/default" replace />} />
        
        {/* Main Ticket Center Route */}
        <Route
          path="/ticket-center/:clerkId"
          element={<TicketCenter />}
        />

        {/* Chat Route */}
        <Route path="/ticket-center/:clerkId/chat/:ticketId" element={<ChatWindow />}/>

        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App; 