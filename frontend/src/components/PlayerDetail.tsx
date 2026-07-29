import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerForm from '../components/PlayerForm';
import type { Player } from '../types';
import { playerAPI } from '../api';
import { FaTrash } from 'react-icons/fa';

export default function PlayerDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                if (!id) return;
                const player = await playerAPI.get(parseInt(id));
                setPlayer(player);
            } catch (err) {
                console.error("Could not find player record", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id]);

    const handleDelete = async () => {
        if (!player || !id) return;

        const confirmDelete = window.confirm(`Are you sure you want to delete ${player.name}? This will remove all their stats.`);
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            await playerAPI.delete(Number(id));
            alert("Player successfully removed.");
            navigate('/');
        } catch (err) {
            console.error('Error deleting player:', err);
            alert("Failed to delete player.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="p-6 text-slate-600">Loading player profile...</div>;
    if (!player) return <div className="p-6 text-red-500">Player profile not found.</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col min-h-[calc(100vh-76px)]">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center pb-20 space-y-6">
                {/* Update form */}
                <PlayerForm
                    initialData={player}
                    onPlayerUpdated={(updated) => {
                        setPlayer(updated);
                    }}
                />

                {/* Delete button */}
                <div className="w-full max-w-md pt-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-4 py-2 rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        <FaTrash className="text-xs" />
                        {isDeleting ? 'Removing...' : 'Delete Player'}
                    </button>
                </div>
            </div>
        </div>
    );
}
