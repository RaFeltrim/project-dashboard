import { PrismaClient } from '@prisma/client'; 
const p = new PrismaClient(); 

async function main() {
  const txs = await p.transaction.findMany(); 
  const sums = txs.reduce((acc, t) => { 
    const month = t.occurredAt.getMonth() + 1; // 1-12
    const m = t.motor; 
    const k = `${m} (Mês ${month})`; 
    acc[k] = (acc[k]||0) + Number(t.amount); 
    return acc; 
  }, {} as Record<string, number>); 
  
  console.log(JSON.stringify(sums, null, 2)); 
}

main().finally(() => p.$disconnect());
