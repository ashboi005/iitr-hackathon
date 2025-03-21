import { useState } from 'react';

export default function NewTicketForm({ onCreate }: {
  onCreate: (title: string, description: string, urgency: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title, description, urgency);
    setTitle('');
    setDescription('');
    setUrgency('medium');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ticket Title"
          className="w-full p-2 border rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe your issue"
          className="w-full p-2 border rounded-lg h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="low">Low Urgency</option>
          <option value="medium">Medium Urgency</option>
          <option value="high">High Urgency</option>
        </select>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}