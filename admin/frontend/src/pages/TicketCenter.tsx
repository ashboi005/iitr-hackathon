import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Ticket } from '../services/types';
import { fetchUserData, fetchTickets, fetchPendingTickets, createTicket, banUser } from '../services/api';
import TicketList from '../components/TicketList';
import AdminControls from '../components/AdminControls';
import NewTicketForm from '../components/NewTicketForm';

export default function TicketCenter() {
  const { clerkId } = useParams<{ clerkId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      if (!clerkId) {
        setError('Missing Clerk ID');
        return;
      }

      try {
        const userData = await fetchUserData(clerkId);
        setUser(userData);

        if (userData.role === 'admin') {
          const pending = await fetchPendingTickets();
          setPendingTickets(pending);
        } else {
          const userTickets = await fetchTickets(clerkId);
          setTickets(userTickets);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [clerkId]);

  const handleCreateTicket = async (title: string, description: string, urgency: string) => {
    if (!clerkId) return;

    try {
      const newTicket = await createTicket({
        title,
        description,
        urgency,
        created_by: clerkId,
        status: 'open'
      });
      setTickets(prev => [...prev, newTicket]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    }
  };

  const handleBanUser = async (clerkId: string) => {
    try {
      await banUser(clerkId);
      setPendingTickets(prev => prev.filter(t => t.created_by !== clerkId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user');
    }
  };

  if (loading) return (
    <div className="p-8 text-center space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!user || !clerkId) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'freelancer' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role.toUpperCase()}
                </span>
                {user.isBanned && (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                    BANNED
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {user.role === 'admin' ? (
          <AdminControls
            pendingTickets={pendingTickets}
            onBanUser={handleBanUser}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TicketList tickets={tickets} clerkId={clerkId} />
            <NewTicketForm onCreate={handleCreateTicket} />
          </div>
        )}
      </div>
    </div>
  );
}