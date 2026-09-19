import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de usuarios...');

  const passwordHash = await bcrypt.hash('ap34Maycon', 10);

  // 1. Criar ou atualizar Rafael Feltrim 
  const rafael = await prisma.user.upsert({
    where: { id: 'cmtx4p40m0000sxbsf4zb0q9s' },
    update: {
      email: 'rafeltrim@gmail.com',
      passwordHash,
      name: 'Rafael Feltrim',
      role: UserRole.ADMIN,
    },
    create: {
      id: 'cmtx4p40m0000sxbsf4zb0q9s', 
      email: 'rafeltrim@gmail.com',
      name: 'Rafael Feltrim',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log('Usuario criado/atualizado:', rafael.name, rafael.id);

  // 2. Criar Gustavo Contiero
  const gustavo = await prisma.user.upsert({
    where: { email: 'gustavo@gmail.com' },
    update: {
      passwordHash,
      name: 'Gustavo Contiero',
    },
    create: {
      email: 'gustavo@gmail.com',
      name: 'Gustavo Contiero',
      passwordHash,
      role: UserRole.USER,
    },
  });

  console.log('Usuario criado/atualizado:', gustavo.name, gustavo.id);

  const txCount = await prisma.transaction.count({
    where: { userId: rafael.id }
  });
  console.log(`O usuario Rafael possui ${txCount} transacoes no banco.`);

  console.log('Seed de usuarios finalizado!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
