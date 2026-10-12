'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  kodeBarang: string;
  namaBarang: string;
  harga: number;
  stok: number;
  kategori?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produk' | 'kategori' | 'transaksi' | 'member'>('dashboard');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);

  const [namaBarang, setNamaBarang] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState('Makanan');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data produk:', err);
    }
  };

  const fetchTransaksi = async () => {
    try {
      const res = await fetch('/api/checkout');
      if (res.ok) {
        const data = await res.json();
        setTotalTransaksi(data.length);
        const total = data.reduce((sum: number, t: any) => sum + Number(t.totalHarga), 0);
        setTotalPendapatan(total);
      }
    } catch (err) {
      console.error('Gagal mengambil data transaksi:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransaksi();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: namaBarang,
          harga: Number(harga),
          stok: Number(stok),
          kategori,
        }),
      });

      if (res.ok) {
        setNamaBarang('');
        setHarga('');
        setStok('');
        fetchProducts();
        setActiveTab('produk');
      }
    } catch (err) {
      console.error('Gagal menambah produk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-emerald-950/20 text-slate-800 font-sans pb-12">
      <header className="bg-emerald-900 text-white px-4 py-4 shadow-md sticky top-0 z-20 border-b border-emerald-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
            <button
              onClick={() => { setActiveTab('dashboard'); fetchTransaksi(); }}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('produk')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'produk'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              🍲 Produk
            </button>
            <button
              onClick={() => setActiveTab('kategori')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'kategori'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              📁 Kategori
            </button>
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'transaksi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              📑 Transaksi
            </button>
            <button
              onClick={() => setActiveTab('member')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === 'member'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              👥 Member
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-emerald-950/80 hover:bg-red-700 border border-emerald-700/50 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto w-full space-y-6 mt-2">
        {activeTab === 'dashboard' && (
          <>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  RINGKASAN RESTO
                </p>
                <h1 className="text-2xl font-black text-emerald-950">Dashboard</h1>
              </div>
              <span className="text-xs text-slate-500 font-medium">12 Oktober 2026</span>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-900/10 overflow-hidden shadow-sm grid grid-cols-2">
              <div className="p-4 border-b border-r border-emerald-900/10">
                <p className="text-xs text-slate-500 font-medium">Total Produk</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{products.length}</p>
              </div>
              <div className="p-4 border-b border-emerald-900/10">
                <p className="text-xs text-slate-500 font-medium">Total Member</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">2</p>
              </div>
              <div className="p-4 border-b border-r border-emerald-900/10">
                <p className="text-xs text-slate-500 font-medium">Total Kasir</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">1</p>
              </div>
              <div className="p-4 border-b border-emerald-900/10">
                <p className="text-xs text-slate-500 font-medium">Transaksi Hari Ini</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{totalTransaksi}</p>
              </div>
              <div className="p-4 border-r border-emerald-900/10 col-span-1">
                <p className="text-xs text-slate-500 font-medium">Pendapatan Hari Ini</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">
                  Rp {totalPendapatan.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-4 bg-emerald-50/30 col-span-1"></div>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-900/10 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                    7 HARI TERAKHIR
                  </p>
                  <h3 className="text-lg font-bold text-emerald-950">Tren penjualan</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                  <span>Pendapatan</span>
                </div>
              </div>

              <div className="pt-8 pb-2 border-b border-slate-100">
                <div className="h-36 flex items-end justify-between px-2 gap-2">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">-</span>
                    <div className="w-full bg-slate-100 h-1 rounded-t"></div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-emerald-700">
                      {totalPendapatan > 0 ? `${Math.round(totalPendapatan / 1000)} rb` : '-'}
                    </span>
                    <div
                      className="w-full bg-emerald-600 rounded-t shadow-sm transition-all duration-500"
                      style={{ height: totalPendapatan > 0 ? '112px' : '4px' }}
                    ></div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">-</span>
                    <div className="w-full bg-slate-100 h-1 rounded-t"></div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">-</span>
                    <div className="w-full bg-slate-100 h-1 rounded-t"></div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">-</span>
                    <div className="w-full bg-slate-100 h-1 rounded-t"></div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">-</span>
                    <div className="w-full bg-slate-100 h-1 rounded-t"></div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">-</span>
                    <div className="w-full bg-slate-100 h-1 rounded-t"></div>
                  </div>
                </div>

                <div className="flex justify-between px-2 mt-2 text-[10px] text-slate-400 font-medium">
                  <span>06 Okt</span>
                  <span>07 Okt</span>
                  <span>08 Okt</span>
                  <span>09 Okt</span>
                  <span>10 Okt</span>
                  <span>11 Okt</span>
                  <span>12 Okt</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'produk' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-emerald-950">➕ Tambah Produk Baru</h2>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    placeholder="Contoh: Nasi Goreng Spesial"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-medium">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      placeholder="25000"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-medium">Stok</label>
                    <input
                      type="number"
                      required
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      placeholder="50"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Cemilan">Cemilan</option>
                    <option value="Sembako">Sembako</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </form>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm">
              <h2 className="text-base font-bold text-emerald-950 mb-3">📋 Daftar Produk</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Nama Produk</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Harga</th>
                      <th className="py-2.5 px-3">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {p.namaBarang}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{p.kategori || 'Makanan'}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">
                          Rp {Number(p.harga).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 font-bold">{p.stok}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'kategori' || activeTab === 'transaksi' || activeTab === 'member') && (
          <div className="bg-white p-8 rounded-2xl border border-emerald-900/10 text-center text-xs text-slate-400 shadow-sm">
            Halaman <span className="font-bold uppercase text-emerald-800">{activeTab}</span> sedang disiapkan!
          </div>
        )}
      </main>
    </div>
  );
}