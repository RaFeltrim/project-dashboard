import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const ID = "cmtx4p40m0000sxbsf4zb0q9s";
const charge = await p.recurringCharge.create({ data: { userId: ID, description: "Cartao Tia - Compra 3000", amount: 300.00, dayOfMonth: 10, isInstallment: true, installmentTotal: 10, installmentIndex: 4, active: true, startsAt: new Date(2026, 9, 10, 12, 0, 0), nextChargeAt: new Date(2026, 9, 10, 12, 0, 0) } });
console.log("RecurringCharge criado:", charge.id);
for (let i = 0; i < 3; i++) {
  const d = new Date(2026, 9 + i, 10, 12, 0, 0);
  await p.transaction.create({ data: { userId: ID, motor: "CARTAO_TIA", section: "CASA", rawDescription: `Cartao Tia - Compra 3000 ${i+1}/10`, normalizedDescription: "Cartao Tia - Compra 3000", amount: -300.00, occurredAt: d, status: "POSTED" } });
}
const total = await p.transaction.count({ where: { userId: ID } });
console.log("Parcelas inseridas. Total no banco:", total);
await p.$disconnect();
