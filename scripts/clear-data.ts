import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🚨 GUARD DE SEGURANÇA: Impede execução acidental em produção
if (process.env.NODE_ENV === "production") {
  console.error("❌ BLOQUEADO: Este script NÃO pode ser executado em ambiente de PRODUÇÃO.");
  console.error("   Ambiente detectado: production");
  process.exit(1);
}

async function clearData() {
  console.log("🧹 Iniciando limpeza de dados...");

  try {
    // Apaga todas as transações (inclui as que referenciam faturas e caixinhas)
    const txDelete = await prisma.transaction.deleteMany({});
    console.log(`✅ ${txDelete.count} Transações apagadas.`);

    // Apaga todas as faturas baseadas em IA
    const invoiceDelete = await prisma.invoice.deleteMany({});
    console.log(`✅ ${invoiceDelete.count} Históricos de Faturas apagados.`);

    // Apaga todas as Caixinhas (Vaults)
    const vaultDelete = await prisma.vault.deleteMany({});
    console.log(`✅ ${vaultDelete.count} Caixinhas apagadas.`);

    console.log("🚀 Base limpa com sucesso. Pronta para novas inserções do zero!");
  } catch (error) {
    console.error("❌ Erro ao limpar a base:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
