import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 Limpando dados do banco...');

  // Deletar transações, alocações, reembolsos, faturas, recorrências e caixinhas
  await prisma.transactionAllocation.deleteMany();
  await prisma.refundLink.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.recurringCharge.deleteMany();
  await prisma.vault.deleteMany();

  console.log('✅ Banco limpo: Transações, Faturas, Caixinhas e Recorrências zeradas.');
  console.log('ℹ️ Categorias, Fontes de Pagamento, Usuário e Stakeholders preservados.');
  
  await prisma.$disconnect();
}

clean().catch(console.error);
