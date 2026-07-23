import { useEffect, useState } from 'react';
import type { Player, Game, LeaderboardRow } from './types';
import { playerAPI, gameAPI } from './api';
import PlayerForm from './components/PlayerForm';
import MatchLogger from './components/MatchLogger';
import { FaTrash } from 'react-icons/fa';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [matches, setMatches] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch player, games, stats
  const loadDashboardData = async () => {
    try {
      const [rosterData, leaderboardData, matchData] = await Promise.all([
        playerAPI.getAll(),
        playerAPI.getLeaderboard(),
        gameAPI.getAll()
      ]);
      setPlayers(rosterData);
      setLeaderboard(leaderboardData);
      setMatches(matchData);
    } catch (err) {
      console.error('Error syncing dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeletePlayer = async (id: number) => {
    try {
      await playerAPI.delete(id);
      // update local state first
      setLeaderboard(prev => prev.filter(player => player.id !== id));
      // some message
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-900">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>⚽</span> <span>Stat<span className="text-emerald-400">Keeper</span></span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* left column - forms */}
          <div className="md:col-span-1 space-y-6">
            <PlayerForm onPlayerAdded={loadDashboardData} />
            <MatchLogger players={players} onMatchLogged={loadDashboardData} />
          </div>

          {/* right column - data tables */}
          <div className="md:col-span-2 space-y-8">

            {/* top panel - leaderboard */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>🏆</span> Player Leaderboard
              </h3>
              {loading ? (
                <p className="text-sm text-slate-500 animate-pulse">Syncing statistics...</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Log match stats to calculate leaderboards.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-100 text-slate-500 font-semibold">
                        <th className="py-2 px-4">Player</th>
                        <th className="py-2 px-4 text-center">Position</th>
                        <th className="py-2 px-4 text-center">Goals</th>
                        <th className="py-2 px-4 text-center">Assists</th>
                        <th className="py-2 px-4 text-center font-bold text-slate-700">Total Points</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboard.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {row.name} <span className="text-xs font-normal text-slate-400 font-mono">#{row.jersey_number ?? 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4 text-center">{row.position}</td>
                          <td className="py-3 px-4 text-center font-semibold text-orange-600">{row.goals}</td>
                          <td className="py-3 px-4 text-center font-semibold text-blue-600">{row.assists}</td>
                          <td className="py-3 px-4 text-center font-black text-emerald-600 bg-emerald-50/30 font-mono">{row.points}</td>
                          <td>
                            <button className="text-center text-red-600 hover:text-red-800" onClick={() => handleDeletePlayer(row.id)} title="Delete Player">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* bottom panel - match history */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📅</span> Recent Match History
              </h3>
              {loading ? (
                <p className="text-sm text-slate-500">Loading matches...</p>
              ) : matches.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No matches logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">vs {match.opponent}</p>
                        <p className="text-xs text-slate-400">{match.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-black font-mono tracking-wider text-slate-700">
                          {match.goals_for} - {match.goals_against}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${match.outcome === 'Win' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          match.outcome === 'Loss' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-slate-200 text-slate-800 border-slate-300'
                          }`}>
                          {match.outcome}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
