import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    // AUTO-CREATE AKUN DEFAULT JIKA DATABASE MASIH KOSONG
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length === 0) {
      const hashAdmin = await bcrypt.hash('admin123', 10);
      const hashKasir = await bcrypt.hash('kasir123', 10);

      await prisma.user.createMany({
        data: [
          { nama: 'Administrator', username: 'admin', password: hashAdmin, role: 'ADMIN' },
          { nama: 'Petugas Kasir', username: 'kasir', password: hashKasir, role: 'KASIR' },
        ],
      });
    }

    // CEK LOGIN USER
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.role !== role) {
      return NextResponse.json(
        { message: 'Username atau role tidak sesuai' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Password salah' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}