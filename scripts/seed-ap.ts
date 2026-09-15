import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AP_DATA = [
  // MARCO
  { date: "2026-03-05", description: "Aluguel", amount: 2617.20 },
  { date: "2026-03-05", description: "Internet", amount: 66.43 },
  { date: "2026-03-04", description: "Água", amount: 20.57 },
  { date: "2026-03-11", description: "Energia", amount: 68.17 },
  // ABRIL
  { date: "2026-04-05", description: "Aluguel", amount: 2344.90 },
  { date: "2026-04-05", description: "Internet", amount: 94.90 },
  { date: "2026-04-05", description: "Água", amount: 49.49 },
  { date: "2026-04-06", description: "Energia", amount: 328.04 },
  // MAIO
  { date: "2026-05-05", description: "Aluguel", amount: 2344.90 },
  { date: "2026-05-05", description: "Internet", amount: 94.90 },
  { date: "2026-05-05", description: "Água", amount: 59.13 },
  { date: "2026-05-06", description: "Energia", amount: 273.41 },
  // JUNHO
  { date: "2026-06-05", description: "Aluguel", amount: 2344.90 },
  { date: "2026-06-05", description: "Internet", amount: 94.90 },
  { date: "2026-06-03", description: "Água", amount: 63.95 },
  { date: "2026-06-08", description: "Energia", amount: 268.58 },
  // JULHO
  { date: "2026-07-06", description: "Aluguel", amount: 2125.90 },
  { date: "2026-07-05", description: "Internet", amount: 94.90 },
  { date: "2026-07-03", description: "Água", amount: 54.31 },
  { date: "2026-07-08", description: "Energia", amount: 238.73 },
  { date: "2026-07-15", description: "Condomínio", amount: 250.00 },
  // AGOSTO
  { date: "2026-08-05", description: "Aluguel", amount: 2125.90 },
  { date: "2026-08-05", description: "Internet", amount: 94.68 },
  { date: "2026-08-05", description: "Água", amount: 54.31 },
  { date: "2026-08-05", description: "Energia", amount: 290.89 },
  { date: "2026-08-13", description: "Condomínio", amount: 250.00 },
  // SETEMBRO
  { date: "2026-09-05", description: "Aluguel", amount: 2125.90 },
  { date: "2026-09-05", description: "Internet", amount: 94.68 },
  { date: "2026-09-03", description: "Água", amount: 54.31 },
  { date: "2026-09-04", description: "Energia", amount: 260.77 },
  { date: "2026-09-13", description: "Condomínio", amount: 250.00 }
];

async function main() {
  const userId = "cmtx4p40m0000sxbsf4zb0q9s"; // User padrão no SEED
  console.log("Deletando histórico de AP existente para evitar duplicação...");
  
  await prisma.transaction.deleteMany({
    where: { 
      userId, 
      section: "CASA",
      motor: "CARTAO_TIA"
    }
  });

  console.log("Inserindo contas fixas do AP (Março a Setembro)...");

  for (const item of AP_DATA) {
    await prisma.transaction.create({
      data: {
        userId,
        motor: "CARTAO_TIA",
        section: "CASA",
        rawDescription: `AP: ${item.description}`,
        normalizedDescription: item.description,
        amount: -Math.abs(item.amount), // Despesa é negativa
        occurredAt: new Date(`${item.date}T12:00:00Z`), // Fix de timezone
        status: "POSTED"
      }
    });
  }

  console.log("Carga concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
