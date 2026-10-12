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

interface CartItem extends Product {
  qty: number;
}

export default function KasirPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [memberPhone, setMemberPhone] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Sembako'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
      p.kodeBarang.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || (p.kategori || 'Makanan') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stok <= 0) return alert('Stok produk habis!');
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stok) {
          alert('Jumlah melebihi stok!');
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (newQty > item.stok) {
              alert('Jumlah melebihi stok!');
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.harga) * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong!');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total: subtotal,
          memberPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const transactionData = {
        noInvoice: data.transaksi.noInvoice,
        tanggal: new Date().toLocaleString('id-ID'),
        items: [...cart],
        total: subtotal,
        memberPhone,
      };

      setLastTransaction(transactionData);
      setShowReceipt(true);
      setCart([]);
      setMemberPhone('');
      fetchProducts(); // Refresh stok barang
    } catch (err: any) {
      alert('Gagal memproses transaksi: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950/20 text-slate-800 font-sans pb-10">
      <header className="bg-emerald-900 text-white px-5 py-3.5 flex justify-between items-center shadow-md sticky top-0 z-20 border-b border-emerald-800">
        <div className="flex items-center gap-2 font-extrabold text-lg tracking-wide">
          <span>🍃</span>
          <span>Resto Nusantara</span>
          <span className="text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md font-normal">Kasir</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/login');
          }}
          className="bg-emerald-800 hover:bg-red-700 text-emerald-100 hover:text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold transition"
        >
          Keluar
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto w-full space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk atau scan SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-900/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
          />
          <span className="absolute left-3 top-3 text-slate-400 text-sm">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-emerald-950 border border-emerald-900/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-3.5 rounded-2xl border border-emerald-900/10 shadow-sm flex flex-col justify-between cursor-pointer active:scale-95 transition hover:border-emerald-500/50"
            >
              <div className="bg-emerald-50/60 rounded-xl h-24 flex items-center justify-center mb-2 border border-emerald-100">
                <span className="text-3xl">🍲</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">
                  {p.namaBarang}
                </h3>
                <p className="text-[11px] text-emerald-700/70 font-medium">{p.kategori || 'Umum'}</p>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-emerald-700 font-extrabold text-sm">
                    Rp {Number(p.harga).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Stok {p.stok}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm space-y-4 mt-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-base">
            🛒 Keranjang
          </h2>

          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <label className="block text-xs text-emerald-900/70 mb-1 font-medium">
              Member? Cari dengan nomor HP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button className="bg-emerald-800 text-white text-xs px-4 py-1.5 rounded-lg font-semibold hover:bg-emerald-900 transition">
                Cari
              </button>
            </div>
          </div>

          {cart.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-4">
              Keranjang masih kosong
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">
                      {item.namaBarang}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-xs ml-1 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold text-sm pt-1">
              <span>Total</span>
              <span className="text-emerald-800">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold text-sm rounded-xl transition shadow-md"
          >
            Proses Transaksi & Struk
          </button>
        </div>
      </main>

      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl relative space-y-4 border border-emerald-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-emerald-900 text-sm">Transaksi Berhasil</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="font-mono text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 space-y-2">
              <div className="text-center font-bold text-xs uppercase text-slate-900">
                Resto Nusantara
                <br />
                <span className="text-[10px] font-normal text-slate-500">Jl. Raya Resto No. 1</span>
              </div>
              <div className="border-b border-dashed border-slate-300 py-1">
                <p>No: {lastTransaction.noInvoice}</p>
                <p>Tgl: {lastTransaction.tanggal}</p>
                <p>Kasir: Petugas Kasir</p>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-300 py-1">
                {lastTransaction.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.namaBarang} x{item.qty}
                    </span>
                    <span>
                      Rp {(Number(item.harga) * item.qty).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-1">
                <div className="flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span>Rp {lastTransaction.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <p className="text-center text-[10px] pt-2 border-t border-dashed border-slate-300 text-slate-500">
                Terima kasih telah berbelanja!
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}