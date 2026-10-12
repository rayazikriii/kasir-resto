'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'ADMIN' | 'KASIR'>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal, periksa username/password');
      }

      localStorage.setItem('user', JSON.stringify(data.user));

      if (role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 text-2xl font-bold mb-2 shadow-lg backdrop-blur-md">
            🍃
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Nusantara <span className="text-emerald-400">POS</span>
          </h1>
          <p className="text-emerald-200/70 text-sm font-medium">
            Sistem Kasir & Manajemen Restoran
          </p>
        </div>

        <div className="bg-emerald-900/40 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-7 shadow-2xl space-y-6">
          <div className="bg-emerald-950/60 p-1.5 rounded-2xl flex border border-emerald-800/50">
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                role === 'ADMIN'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-emerald-300/60 hover:text-emerald-200'
              }`}
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => { setRole('KASIR'); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                role === 'KASIR'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-emerald-300/60 hover:text-emerald-200'
              }`}
            >
              💻 Kasir
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-2xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-200/80 mb-2">Username</label>
              <input
                type="text"
                required
                placeholder={role === 'ADMIN' ? 'admin' : 'kasir'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-emerald-950/50 border border-emerald-700/50 rounded-2xl text-sm text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200/80 mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-emerald-950/50 border border-emerald-700/50 rounded-2xl text-sm text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-2xl text-sm shadow-xl transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : `Masuk Portal ${role === 'ADMIN' ? 'Admin' : 'Kasir'}`}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-emerald-800/40">
            <p className="text-[11px] text-emerald-300/60">
              Default: <span className="font-mono text-emerald-200">{role.toLowerCase()}</span> / <span className="font-mono text-emerald-200">{role.toLowerCase()}123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 