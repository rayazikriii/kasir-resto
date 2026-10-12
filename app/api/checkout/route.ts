import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total, kasirId, memberId, metodeBayar } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'Item keranjang tidak boleh kosong' },
        { status: 400 }
      );
    }

    // 1. Cari Kasir default jika kasirId tidak dikirim dari frontend
    let targetKasirId = kasirId;
    if (!targetKasirId) {
      const defaultKasir = await prisma.user.findFirst();
      if (!defaultKasir) {
        return NextResponse.json(
          { message: 'User Kasir tidak ditemukan di database. Buat user kasir terlebih dahulu.' },
          { status: 400 }
        );
      }
      targetKasirId = defaultKasir.id;
    }

    // 2. Format Metode Pembayaran (default TUNAI jika tidak sesuai enum)
    let validMetode = 'TUNAI';
    if (metodeBayar === 'QRIS' || metodeBayar === 'DEBIT') {
      validMetode = metodeBayar;
    }

    // 3. Simpan Transaksi & Detail Transaksi
    const transaksi = await prisma.transaksi.create({
      data: {
        kodeTransaksi: `TRX-${Date.now()}`,
        kasirId: Number(targetKasirId),
        memberId: memberId ? Number(memberId) : null,
        metodeBayar: validMetode as 'TUNAI' | 'QRIS' | 'DEBIT',
        totalHarga: Number(total),
        detail: {
          create: items.map((item: any) => ({
            productId: Number(item.id),
            jumlah: Number(item.qty),
            hargaSatuan: Number(item.harga),
            subtotal: Number(item.harga) * Number(item.qty),
          })),
        },
      },
      include: {
        detail: true,
      },
    });

    // 4. Potong Stok Barang
    for (const item of items) {
      await prisma.product.update({
        where: { id: Number(item.id) },
        data: { stok: { decrement: Number(item.qty) } },
      });
    }

    return NextResponse.json({ success: true, transaksi }, { status: 201 });
  } catch (error: any) {
    console.error('Error Checkout:', error);
    return NextResponse.json(
      { message: 'Gagal memproses transaksi: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const transaksi = await prisma.transaksi.findMany({
      orderBy: { tanggal: 'desc' },
      include: {
        detail: true,
        kasir: true,
        member: true,
      },
    });
    return NextResponse.json(transaksi);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Gagal mengambil data transaksi: ' + error.message },
      { status: 500 }
    );
  }
}