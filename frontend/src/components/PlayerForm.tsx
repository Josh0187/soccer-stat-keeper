import React, { useState, useEffect } from 'react';
import type { Player } from '../types';
import { playerAPI } from '../api';

interface PlayerFormProps {
  initialData?: Player | null;        // If provided go into edit mode
  onPlayerAdded?: () => void;         // Use after creating player
  onPlayerUpdated?: (updated: Player) => void; // Use after updating palyer
}

export default function PlayerForm({ initialData, onPlayerAdded, onPlayerUpdated }: PlayerFormProps) {
  const isEditMode = !!initialData;

  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [position, setPosition] = useState('Forward');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Sync local state when initial data loads
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setJerseyNumber(initialData.jersey_number !== null ? String(initialData.jersey_number) : '');
      setPosition(initialData.position || 'Forward');
    }
  }, [initialData]);


  // auto remove message after 3s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage({ text: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage({ text: '', isError: false });

    const payload = {
      name: name.trim(),
      jersey_number: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
      position: position
    };

    try {
      if (isEditMode && initialData?.id) {
        const updatedPlayer = await playerAPI.update(initialData.id, payload);
        setMessage({ text: 'Player updated successfully!', isError: false });
        if (onPlayerUpdated) onPlayerUpdated(updatedPlayer);
      } else {
        await playerAPI.create(payload as Player);
        setName('');
        setJerseyNumber('');
        setMessage({ text: 'Player added to roster successfully!', isError: false });
        if (onPlayerAdded) onPlayerAdded();
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save player to database.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        {isEditMode ? 'Edit Player' : 'Add New Player'}
      </h3>

      {message.text && (
        <div className={`px-4 py-2 rounded-lg text-sm mb-4 border ${message.isError ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lionel Messi"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Jersey Number</label>
          <input
            type="number"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            placeholder="e.g., 10"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Position</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            <option value="Goalkeeper">Goalkeeper</option>
            <option value="Defender">Defender</option>
            <option value="Midfielder">Midfielder</option>
            <option value="Forward">Forward</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition disabled:bg-emerald-400 cursor-pointer shadow-sm"
        >
          {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add to Roster'}
        </button>
      </form>
    </div>
  );
}
