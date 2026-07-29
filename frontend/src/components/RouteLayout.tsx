import { Outlet, Link } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-900">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>⚽</span> <span>Stat<span className="text-emerald-400">Keeper</span></span>
            </h1>
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
