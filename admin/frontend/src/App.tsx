import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TicketCenter from './pages/TicketCenter';
import NotFound from './components/NotFound';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Ticket Center Route */}
        <Route
          path="/ticket-center/:clerkId"
          element={<TicketCenter />}
        />

        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/ticket-center/:clerkId/chat/:ticketId" element={<ChatWindow />}/>
      </Routes>
    </Router>
  );
}

export default App; 