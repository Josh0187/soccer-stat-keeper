import React, { useState } from 'react';
import type { Player, Game, MatchStat } from '../types';
import { gameAPI } from '../api';

interface MatchLoggerProps {
  players: Player[];
  onMatchLogged: () => void;
}

interface TempStatRow {
  player_id: string;
  goals: number;
  assists: number;
}

export default function MatchLogger({ players, onMatchLogged }: MatchLoggerProps) {
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [goalsFor, setGoalsFor] = useState<string>('0');
  const [goalsAgainst, setGoalsAgainst] = useState<string>('0');
  const [outcome, setOutcome] = useState<'Win' | 'Loss' | 'Draw'>('Draw');
  const [statRows, setStatRows] = useState<TempStatRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const addStatRow = () => {
    setStatRows([...statRows, { player_id: '', goals: 0, assists: 0 }]);
  };

  const removeStatRow = (index: number) => {
    setStatRows(statRows.filter((_, i) => i !== index));
  };

  const updateStatRow = (index: number, field: keyof TempStatRow, value: string | number) => {
    const updated = [...statRows];
    updated[index] = { ...updated[index], [field]: value };
    setStatRows(updated);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!opponent.trim()) return;

    setLoading(true);
    setMessage({ text: '', isError: false });

    const matchData: Game = {
      opponent: opponent.trim(),
      date,
      goals_for: parseInt(goalsFor, 10) || 0,
      goals_against: parseInt(goalsAgainst, 10) || 0,
      outcome
    };

    try {
      const savedGame = await gameAPI.create(matchData);
      
      if (savedGame.id) {
        for (const row of statRows) {
          if (!row.player_id) continue;
          
          const performancePayload: MatchStat = {
            game_id: savedGame.id,
            player_id: parseInt(row.player_id, 10),
            goals: row.goals,
            assists: row.assists,
            yellow_cards: 0,
            minutes_played: 90
          };
          
          await gameAPI.logStat(performancePayload);
        }
      }

      setOpponent('');
      setGoalsFor('0');
      setGoalsAgainst('0');
      setOutcome('Draw');
      setStatRows([]);
      setMessage({ text: 'Game and player statistics saved successfully!', isError: false });
      onMatchLogged();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to record match data to PostgreSQL.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Log Match & Player Stats</h3>
      
      {message.text && (
        <div className={`px-4 py-2 rounded-lg text-sm mb-4 border ${
          message.isError ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Opponent</label>
            <input 
              type="text" 
              value={opponent} 
              onChange={(e) => setOpponent(e.target.value)} 
              placeholder="e.g. FC Barcelona"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Match Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Goals For</label>
            <input 
              type="number" 
              min="0"
              value={goalsFor} 
              onChange={(e) => setGoalsFor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Goals Against</label>
            <input 
              type="number" 
              min="0"
              value={goalsAgainst} 
              onChange={(e) => setGoalsAgainst(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Outcome</label>
            <select 
              value={outcome} 
              onChange={(e) => setOutcome(e.target.value as 'Win' | 'Loss' | 'Draw')}
              className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="Win">Win</option>
              <option value="Loss">Loss</option>
              <option value="Draw">Draw</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-700">Individual Contributions</h4>
            <button 
              type="button"
              onClick={addStatRow}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              + Add Contributor
            </button>
          </div>

          {statRows.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No individual stats logged for this game yet.</p>
          ) : (
            <div className="space-y-3">
              {statRows.map((row, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <select
                    value={row.player_id}
                    onChange={(e) => updateStatRow(index, 'player_id', e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1.5 border border-slate-300 bg-white rounded-md text-xs focus:outline-none"
                    required
                  >
                    <option value="">Select Player...</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 w-20">
                    <span className="text-xs text-slate-400">G:</span>
                    <input 
                      type="number" 
                      min="0"
                      value={row.goals}
                      onChange={(e) => updateStatRow(index, 'goals', parseInt(e.target.value, 10) || 0)}
                      className="w-full px-1.5 py-1 border border-slate-300 bg-white rounded-md text-xs text-center"
                    />
                  </div>

                  <div className="flex items-center gap-1 w-20">
                    <span className="text-xs text-slate-400">A:</span>
                    <input 
                      type="number" 
                      min="0"
                      value={row.assists}
                      onChange={(e) => updateStatRow(index, 'assists', parseInt(e.target.value, 10) || 0)}
                      className="w-full px-1.5 py-1 border border-slate-300 bg-white rounded-md text-xs text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStatRow(index)}
                    className="text-red-500 hover:text-red-700 p-1 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || !opponent.trim()} 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg text-sm transition disabled:bg-slate-400 cursor-pointer shadow-sm"
        >
          {loading ? 'Recording Match Context...' : 'Save Complete Match Card'}
        </button>
      </form>
    </div>
  );
}
