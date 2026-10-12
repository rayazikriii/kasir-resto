const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordKasir = await bcrypt.hash('kasir123', 10);

  // Buat Akun Admin Default
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nama: 'Administrator Resto',
      username: 'admin',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
    },
  });

  // Buat Akun Kasir Default
  await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      nama: 'Kasir Resto',
      username: 'kasir',
      password: hashedPasswordKasir,
      role: 'KASIR',
    },
  });

  console.log('✅ Seed berhasil! Akun admin & kasir sudah dibuat.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error saat seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });