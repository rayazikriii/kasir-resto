import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Ambil semua produk
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Gagal mengambil data produk: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Tambah produk baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, harga, stok } = body;

    if (!nama || !harga) {
      return NextResponse.json(
        { message: 'Nama dan harga wajib diisi' },
        { status: 400 }
      );
    }

    // Buat kode barang otomatis (contoh: PRD-171829382)
    const kodeBarang = `PRD-${Date.now()}`;

    const newProduct = await prisma.product.create({
      data: {
        kodeBarang: kodeBarang,
        namaBarang: nama,
        harga: Number(harga),
        stok: Number(stok) || 0,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Gagal menambah produk: ' + error.message },
      { status: 500 }
    );
  }
}