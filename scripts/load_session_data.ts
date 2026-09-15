import { PrismaClient, MotorType, ExpenseSection } from '@prisma/client';

const p = new PrismaClient();
const SEED_USER_ID = 'cmtx4p40m0000sxbsf4zb0q9s';

// Santander: dados reais extraídos pelo Gemini do Santander_Ago.pdf
const santanderItems = [
  { date: '2026-05-26', description: 'DL*TEMUCOM ZAYA 04/06', amount: -7.87 },
  { date: '2026-05-26', description: 'DL*TEMUCOM HOUSE 04/06', amount: -21.79 },
  { date: '2026-05-26', description: 'DL*TEMUCOM WIWIP 04/06', amount: -46.91 },
  { date: '2026-05-26', description: 'DM *TEMU 04/06', amount: -46.97 },
  { date: '2026-05-26', description: 'GNT*TEMU 04/06', amount: -14.81 },
  { date: '2026-05-27', description: 'GNT*TEMU 04/06', amount: -11.74 },
  { date: '2026-07-08', description: 'MP*HAHSHAA 02/05', amount: -36.58 },
  { date: '2026-08-10', description: 'ADY*BLACKTAG 01/03', amount: -83.93 },
  { date: '2026-09-02', description: 'MERCADOLIVRE*MERCADOLIVRE 01/03', amount: -14.24 },
  { date: '2026-08-23', description: 'AMAZON BR', amount: -56.04 },
  { date: '2026-08-26', description: 'DL*GOOGLE GOOGLE', amount: -23.99 },
];

// Nubank: dados reais extraídos do Nubank_Ago.pdf (fatura da Mae - Gislaine)
// Apenas itens do filho (SUB_PESSOAL, AP, TERCEIROS) — excluindo itens da Mae
const nubankItems = [
  { date: '2026-08-10', description: 'SSD Pc v4 (6/12)', amount: -20.66, section: ExpenseSection.PESSOAL },        // Mp *Aliexpress - SUB_PESSOAL
  { date: '2026-08-10', description: 'Ovos de Pascoa (6/6)', amount: -75.00, section: ExpenseSection.PESSOAL },     // Allura Doces - SUB_PESSOAL
  { date: '2026-08-10', description: 'Kit de cuecas (7/10)', amount: -34.70, section: ExpenseSection.PESSOAL },     // Mercadolivre*Mercadol - SUB_PESSOAL
  { date: '2026-08-10', description: 'Monitor (7/8)', amount: -150.86, section: ExpenseSection.PESSOAL },           // Mlp*Magalu - SUB_PESSOAL
  { date: '2026-08-10', description: 'Roteador AP (6/6)', amount: -44.98, section: ExpenseSection.CASA },           // Amazonmktplc*Inovivoco - AP
  { date: '2026-08-10', description: 'Coisas do Maycon (7/10)', amount: -26.85, section: ExpenseSection.PESSOAL },  // Mercadolivre*5produtos - TERCEIROS
];

async function run() {
  console.log('--- Iniciando carga de dados reais ---');

  // 1. Santander
  for (const item of santanderItems) {
    await p.transaction.create({
      data: {
        userId: SEED_USER_ID,
        motor: MotorType.SANTANDER,
        section: ExpenseSection.PESSOAL,
        rawDescription: item.description,
        normalizedDescription: item.description,
        amount: item.amount,
        occurredAt: new Date(item.date),
        status: 'POSTED',
      }
    });
  }
  console.log(`Santander: ${santanderItems.length} transacoes inseridas`);

  // 2. Nubank
  for (const item of nubankItems) {
    await p.transaction.create({
      data: {
        userId: SEED_USER_ID,
        motor: MotorType.NUBANK_RATEIO,
        section: item.section,
        rawDescription: item.description,
        normalizedDescription: item.description,
        amount: item.amount,
        occurredAt: new Date(item.date),
        status: 'POSTED',
      }
    });
  }
  console.log(`Nubank: ${nubankItems.length} transacoes inseridas`);

  // 3. Cartão Tia: R$3000 em 10x (R$300/parcela)
  // - Lançado para outubro (10/10/2026 = primeiro vencimento)
  // - 3 parcelas adiantadas => installmentIndex = 4 (próxima a cobrar)
  const charge = await p.recurringCharge.create({
    data: {
      userId: SEED_USER_ID,
      description: 'Cartao Tia - Compra R$3000',
      amount: 300.00,
      dayOfMonth: 10,
      isInstallment: true,
      installmentTotal: 10,
      installmentIndex: 4,  // 3 adiantadas, agora na 4a parcela
      active: true,
      startsAt: new Date(2026, 9, 10, 12, 0, 0),      // 10/10/2026
      nextChargeAt: new Date(2026, 9, 10, 12, 0, 0),  // proximo vencimento
    }
  });
  console.log(`Cartao Tia RecurringCharge criado: ${charge.id}`);

  // Inserir as 3 parcelas adiantadas como transações históricas (out, nov, dez 2026)
  for (let i = 0; i < 3; i++) {
    const d = new Date(2026, 9 + i, 10, 12, 0, 0);
    await p.transaction.create({
      data: {
        userId: SEED_USER_ID,
        motor: MotorType.CARTAO_TIA,
        section: ExpenseSection.CASA,
        rawDescription: `Cartao Tia - Compra R$3000 ${i + 1}/10`,
        normalizedDescription: 'Cartao Tia - Compra R$3000',
        amount: -300.00,
        occurredAt: d,
        status: 'POSTED',
      }
    });
  }
  console.log(`Cartao Tia: 3 parcelas adiantadas (1/10, 2/10, 3/10) inseridas`);

  const total = await p.transaction.count({ where: { userId: SEED_USER_ID } });
  console.log(`\nTotal final no banco: ${total} transacoes`);

  await p.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });

const santanderItems = [
  { date: '2026-05-26', description: 'DL*TEMUCOM ZAYA 04/06', amount: -7.87 },
  { date: '2026-05-26', description: 'DL*TEMUCOM HOUSE 04/06', amount: -21.79 },
  { date: '2026-05-26', description: 'DL*TEMUCOM WIWIP 04/06', amount: -46.91 },
  { date: '2026-05-26', description: 'DM *TEMU 04/06', amount: -46.97 },
  { date: '2026-05-26', description: 'GNT*TEMU 04/06', amount: -14.81 },
  { date: '2026-05-27', description: 'GNT*TEMU 04/06', amount: -11.74 },
  { date: '2026-07-08', description: 'MP*HAHSHAA 02/05', amount: -36.58 },
  { date: '2026-08-10', description: 'ADY*BLACKTAG 01/03', amount: -83.93 },
  { date: '2026-09-02', description: 'MERCADOLIVRE*MERCADOLIVRE 01/03', amount: -14.24 },
  { date: '2026-08-23', description: 'AMAZON BR', amount: -56.04 },
  { date: '2026-08-26', description: 'DL*GOOGLE GOOGLE', amount: -23.99 },
];
const nubankItems = [
  { date: '2026-08-10', description: 'SSD Pc v4 (6/12)', amount: -20.66, section: ExpenseSection.PESSOAL },
  { date: '2026-08-10', description: 'Ovos de Pascoa (6/6)', amount: -75.00, section: ExpenseSection.PESSOAL },
  { date: '2026-08-10', description: 'Kit de cuecas (7/10)', amount: -34.70, section: ExpenseSection.PESSOAL },
  { date: '2026-08-10', description: 'Monitor (7/8)', amount: -150.86, section: ExpenseSection.PESSOAL },
  { date: '2026-08-10', description: 'Roteador AP (6/6)', amount: -44.98, section: ExpenseSection.CASA },
  { date: '2026-08-10', description: 'Coisas do Maycon (7/10)', amount: -26.85, section: ExpenseSection.PESSOAL },
];
async function run() {
  for (const item of santanderItems) { await p.transaction.create({ data: { userId: SEED_USER_ID, motor: MotorType.SANTANDER, section: ExpenseSection.PESSOAL, rawDescription: item.description, normalizedDescription: item.description, amount: item.amount, occurredAt: new Date(item.date), status: 'POSTED' } }); }
  console.log('Santander: ' + santanderItems.length + ' transacoes');
  for (const item of nubankItems) { await p.transaction.create({ data: { userId: SEED_USER_ID, motor: MotorType.NUBANK_RATEIO, section: item.section, rawDescription: item.description, normalizedDescription: item.description, amount: item.amount, occurredAt: new Date(item.date), status: 'POSTED' } }); }
  console.log('Nubank: ' + nubankItems.length + ' transacoes');
  const charge = await p.recurringCharge.create({ data: { userId: SEED_USER_ID, description: 'Cartao Tia - Compra R\', amount: 300.00, dayOfMonth: 10, isInstallment: true, installmentTotal: 10, installmentIndex: 4, active: true, startsAt: new Date(2026, 9, 10, 12, 0, 0), nextChargeAt: new Date(2026, 9, 10, 12, 0, 0) } });
  console.log('Cartao Tia recorrencia criada: ' + charge.id);
  for (let i = 0; i < 3; i++) { const d = new Date(2026, 9 + i, 10, 12, 0, 0); await p.transaction.create({ data: { userId: SEED_USER_ID, motor: MotorType.CARTAO_TIA, section: ExpenseSection.CASA, rawDescription: 'Cartao Tia - Compra R\ ' + (i+1) + '/10', normalizedDescription: 'Cartao Tia - Compra R\', amount: -300.00, occurredAt: d, status: 'POSTED' } }); }
  console.log('Cartao Tia: 3 parcelas adiantadas inseridas');
  const total = await p.transaction.count({ where: { userId: SEED_USER_ID } });
  console.log('TOTAL: ' + total + ' transacoes no banco');
  await p.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
