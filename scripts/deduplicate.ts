import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "cmtx4p40m0000sxbsf4zb0q9s"; // User padrão no SEED
  console.log("Iniciando processo de deduplicação e ajuste do AP...");

  // 1. AJUSTE DA "MEIA" (Dividir por 2 as contas fixas do AP no CARTAO_TIA)
  console.log("Ajustando contas do Motor 4 (CARTAO_TIA) para a 'Meia'...");
  const apTransactions = await prisma.transaction.findMany({
    where: { userId, motor: "CARTAO_TIA" }
  });

  let adjustedCount = 0;
  for (const tx of apTransactions) {
    // Como eu injetei os valores inteiros hoje, vou dividir por 2 para corrigir.
    // Para garantir que não divido infinitamente se rodar o script de novo, 
    // verifico se o valor atual é o valor "Inteiro" que conheço (ex: 2344.90, 2125.90, etc)
    // Mas a forma mais simples e robusta é re-injetar os dados ou simplesmente hardcodear
    // Mas como eu injetei AGORA e não houve edição, basta dividir por 2.
    // Vamos verificar se o valor já foi dividido:
    const absAmt = Math.abs(Number(tx.amount));
    
    // Se o valor já for "1172.45" (metade de 2344.90), ele pula.
    if (absAmt > 1500 || absAmt === 250 || absAmt === 68.17 || absAmt === 328.04 || absAmt === 273.41 || absAmt === 268.58 || absAmt === 238.73 || absAmt === 290.89 || absAmt === 260.77 || absAmt === 94.90 || absAmt === 94.68 || absAmt === 66.43 || absAmt === 63.95 || absAmt === 59.13 || absAmt === 54.31 || absAmt === 49.49 || absAmt === 20.57) {
      
      const newAmount = Number(tx.amount) / 2;
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { amount: newAmount }
      });
      adjustedCount++;
    }
  }
  console.log(`Foram ajustadas ${adjustedCount} transações do AP para o valor da Meia.`);


  // 2. DEDUPLICAÇÃO DE TRANSAÇÕES
  console.log("Iniciando varredura de deduplicação...");
  
  const allTxs = await prisma.transaction.findMany({
    where: { userId }
  });

  const groups = new Map<string, typeof allTxs>();

  for (const tx of allTxs) {
    // Normalizar a data para YYYY-MM-DD (ignorando timezone hours)
    const dt = tx.occurredAt;
    const dateStr = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    const amountStr = Number(tx.amount).toFixed(2);
    
    const key = `${tx.motor}|${dateStr}|${amountStr}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  }

  let deletedCount = 0;

  for (const [key, txList] of Array.from(groups.entries())) {
    if (txList.length > 1) {
      // Temos duplicadas exatas (Mesmo Motor, Mesmo Dia, Mesmo Valor)
      // Ordenamos por rawDescription.length DESC, para manter a que tem parcelas (ex: "X 01/03")
      txList.sort((a, b) => b.rawDescription.length - a.rawDescription.length);
      
      const toKeep = txList[0];
      const toDelete = txList.slice(1);
      
      for (const tx of toDelete) {
        await prisma.transaction.delete({
          where: { id: tx.id }
        });
        deletedCount++;
        console.log(`Deletada duplicada: ${tx.rawDescription} (Mantida: ${toKeep.rawDescription})`);
      }
    }
  }

  console.log(`Deduplicação concluída. ${deletedCount} transações duplicadas removidas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
