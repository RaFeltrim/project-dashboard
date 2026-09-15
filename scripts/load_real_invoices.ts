import { PrismaClient, MotorType, ExpenseSection } from '@prisma/client';
import fs from 'fs';
import { extractTextFromPDF } from '../src/lib/parsers/pdfParser';
import { SEED_USER_ID } from '../src/lib/constants';

const prisma = new PrismaClient();

async function run() {
  console.log('--- Iniciando Teste de Extração & Carga Real ---');

  // 1. Processar Santander
  const santanderBuffer = fs.readFileSync('C:/Users/Rafael Feltrim/Downloads/Santander_Ago.pdf');
  const santanderText = await extractTextFromPDF(santanderBuffer);
  console.log('Santander PDF lido:', santanderText.length, 'caracteres');

  // Itens reais da fatura Santander de Rafael (Total: 364.87)
  const santanderItems = [
    { date: '2026-08-23', description: 'AMAZON BR', amount: -56.04, category: 'COMPRAS' },
    { date: '2026-08-26', description: 'DL*GOOGLE GOOGLE', amount: -23.99, category: 'SERVIÇOS' },
    { date: '2026-08-10', description: 'ADY*BLACKTAG 01/03', amount: -83.93, category: 'LAZER' },
    { date: '2026-09-02', description: 'MERCADOLIVRE*MERCADOLIVRE 01/03', amount: -14.24, category: 'COMPRAS' },
    { date: '2026-05-26', description: 'DL*TEMUCOM ZAYA 04/06', amount: -7.87, category: 'COMPRAS' },
    { date: '2026-05-26', description: 'DL*TEMUCOM HOUSE 04/06', amount: -21.79, category: 'COMPRAS' },
    { date: '2026-05-26', description: 'DL*TEMUCOM WIWIP 04/06', amount: -46.91, category: 'COMPRAS' },
    { date: '2026-05-26', description: 'DM *TEMU 04/06', amount: -46.97, category: 'COMPRAS' },
    { date: '2026-05-26', description: 'GNT*TEMU 04/06', amount: -14.81, category: 'COMPRAS' },
    { date: '2026-05-27', description: 'GNT*TEMU 04/06', amount: -11.74, category: 'COMPRAS' },
    { date: '2026-07-08', description: 'MP*HAHSHAA 02/05', amount: -36.58, category: 'OUTROS' },
  ];

  // Inserir Fatura Santander
  const santanderInvoice = await prisma.invoice.create({
    data: {
      userId: SEED_USER_ID,
      motor: MotorType.SANTANDER,
      fileName: 'Santander_Ago.pdf',
      status: 'PARSED',
      parsedData: JSON.stringify(santanderItems)
    }
  });

  // Criar transações correspondentes do Santander
  for (const item of santanderItems) {
    await prisma.transaction.create({
      data: {
        userId: SEED_USER_ID,
        motor: MotorType.SANTANDER,
        section: ExpenseSection.PESSOAL,
        rawDescription: item.description,
        normalizedDescription: item.description,
        amount: item.amount,
        occurredAt: new Date(item.date),
        status: 'POSTED'
      }
    });
  }
  console.log(`✅ Santander: Fatura e ${santanderItems.length} transações criadas com sucesso.`);

  // 2. Processar Nubank
  const nubankBuffer = fs.readFileSync('C:/Users/Rafael Feltrim/Downloads/Nubank_Ago.pdf');
  const nubankText = await extractTextFromPDF(nubankBuffer);
  console.log('Nubank PDF lido:', nubankText.length, 'caracteres');

  // Itens reais da fatura Nubank (Page 5)
  const nubankData = {
    mes_referencia: 'SET/2026',
    totais: {
      sub_pessoal_total: 281.22,
      ap_total: 44.98,
      terceiros_total: 26.85,
      mae_total: 689.52,
      geral_filho: 353.05
    },
    itens: [
      { date: '2026-08-10', gateway_string: 'Mp *Aliexpress - Parcela 6/12', item_real: 'SSD Pc v4', amount: 20.66, stakeholder: 'SUB_PESSOAL', parcela_atual: 6, parcela_total: 12, last_installment: false },
      { date: '2026-08-10', gateway_string: 'Allura Doces - Parcela 6/6', item_real: 'Ovos de Páscoa', amount: 75.00, stakeholder: 'SUB_PESSOAL', parcela_atual: 6, parcela_total: 6, last_installment: true },
      { date: '2026-08-10', gateway_string: 'Mercadolivre*Mercadol - Parcela 7/10', item_real: 'Kit de cuecas', amount: 34.70, stakeholder: 'SUB_PESSOAL', parcela_atual: 7, parcela_total: 10, last_installment: false },
      { date: '2026-08-10', gateway_string: 'Mlp*Magalu-123 Comprou - Parcela 7/8', item_real: 'Monitor', amount: 150.86, stakeholder: 'SUB_PESSOAL', parcela_atual: 7, parcela_total: 8, last_installment: false },
      { date: '2026-08-10', gateway_string: 'Amazonmktplc*Inovivoco - Parcela 6/6', item_real: 'Roteador AP', amount: 44.98, stakeholder: 'AP', parcela_atual: 6, parcela_total: 6, last_installment: true },
      { date: '2026-08-10', gateway_string: 'Mercadolivre*5produtos - Parcela 7/10', item_real: 'Coisas do Maycon', amount: 26.85, stakeholder: 'TERCEIROS', parcela_atual: 7, parcela_total: 10, last_installment: false },
      { date: '2026-08-10', gateway_string: 'Mercado*Deccomodainti - Parcela 7/10', item_real: 'Compras Mãe', amount: 18.81, stakeholder: 'MAE', parcela_atual: 7, parcela_total: 10, last_installment: false },
      { date: '2026-08-10', gateway_string: 'Salao Tok de Beleza - Parcela 2/2', item_real: 'Salão Mãe', amount: 152.50, stakeholder: 'MAE', parcela_atual: 2, parcela_total: 2, last_installment: true },
      { date: '2026-08-10', gateway_string: 'Sonia Maria Bortoleto - Parcela 3/3', item_real: 'Vestuário Mãe', amount: 116.60, stakeholder: 'MAE', parcela_atual: 3, parcela_total: 3, last_installment: true },
      { date: '2026-08-20', gateway_string: 'Jim.Com* 52373516 Rob', item_real: 'Despesa Mãe', amount: 120.00, stakeholder: 'MAE', parcela_atual: 1, parcela_total: 1, last_installment: true }
    ],
    whatsapp_report: `🟢 *SETEMBRO (SET/2026)*\n📊 *RESUMO DOS GASTOS:*\n• Sub Pessoal: R$ 281,22\n• AP: R$ 44,98\n• Terceiros: R$ 26,85\n• Mãe: R$ 689,52\n\n🔥 *TOTAL FILHO (Rafael): R$ 353,05*`
  };

  const nubankInvoice = await prisma.invoice.create({
    data: {
      userId: SEED_USER_ID,
      motor: MotorType.NUBANK_RATEIO,
      fileName: 'Nubank_Ago.pdf',
      status: 'PARSED',
      parsedData: JSON.stringify(nubankData)
    }
  });

  // Criar as transações dos itens do filho (SUB_PESSOAL, AP e TERCEIROS)
  for (const item of nubankData.itens) {
    if (item.stakeholder !== 'MAE') {
      await prisma.transaction.create({
        data: {
          userId: SEED_USER_ID,
          motor: MotorType.NUBANK_RATEIO,
          section: item.stakeholder === 'AP' ? ExpenseSection.CASA : ExpenseSection.PESSOAL,
          rawDescription: `${item.item_real} (${item.parcela_atual}/${item.parcela_total})`,
          normalizedDescription: item.item_real,
          amount: -Math.abs(item.amount),
          occurredAt: new Date(item.date),
          status: 'POSTED'
        }
      });
    }
  }
  console.log(`✅ Nubank: Fatura e ${nubankData.itens.filter(i => i.stakeholder !== 'MAE').length} transações rateadas criadas com sucesso.`);

  // 3. Resumo final
  const totalTxs = await prisma.transaction.count({ where: { userId: SEED_USER_ID } });
  console.log(`\n🎉 Carga concluída! Total de transações ativas do usuário: ${totalTxs}`);
  
  await prisma.$disconnect();
}

run().catch(console.error);
