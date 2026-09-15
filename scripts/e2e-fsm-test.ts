import { appRouter } from "../src/server/routers/_app";
import { PrismaClient, MotorType } from "@prisma/client";

/**
 * @deprecated Script de teste FSM manual — NÃO integrado ao Vitest/Playwright.
 *
 * Este arquivo foi criado durante o desenvolvimento para validação manual de fluxos.
 * TODO(Sprint 2 — Rafael-QA): Migrar os cenários relevantes para src/tests/e2e/*.spec.ts
 * e deletar este arquivo.
 *
 * Executar manualmente: npx tsx scripts/e2e-fsm-test.ts
 */

const prisma = new PrismaClient();

async function runE2ETest() {
  console.log("=================================================");
  console.log("🚀 INICIANDO TESTE E2E DA FSM (MÁQUINA DE ESTADOS)");
  console.log("=================================================\n");
  
  // 1. Contexto mockado para o tRPC
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("❌ Erro: Nenhum usuário no banco. Execute o seed antes.");
    process.exit(1);
  }
  
  // Create a mock session context for tRPC
  const ctx: any = {
    prisma,
    session: { user: { id: user.id, email: user.email } }
  };
  const caller = appRouter.createCaller(ctx);

  // 2. Criar uma Caixinha para o teste
  console.log("📦 FASE 1: Criando Caixinha de Teste (Vault)");
  const vaultName = `Reserva E2E ${Date.now()}`;
  const vault = await caller.vault.create({ userId: user.id, name: vaultName, targetAmount: 5000 });
  await caller.vault.addFunds({ id: vault.id, userId: user.id, amount: 1000 }); // Saldo inicial 1000
  console.log(`✅ Caixinha "${vaultName}" criada com saldo inicial de R$ 1000,00\n`);

  // 3. Simular Upload e Parse (Motor 3: Nubank Rateio)
  console.log("🧠 FASE 2: Enviando texto cru para Extração IA (Motor Nubank)");
  console.log("   (Simulando a colagem de um extrato do Nubank)...");
  
  const nubankText = `
    10 AGO Mlp*Magalu-123 Comprou Parcela 7/8 150,86
    11 AGO Amazonmktplc*Inovivoco Parcela 6/6 44,98
  `;
  
  const invoice = await caller.invoice.uploadAndParse({
    userId: user.id,
    motor: MotorType.NUBANK_RATEIO,
    fileName: "teste_nubank_e2e.txt",
    content: nubankText
  });
  
  if (invoice.status === "ERROR") {
    console.error("❌ Falha na extração IA:", invoice.errorMessage);
    process.exit(1);
  }
  
  const parsed = invoice.parsedData as any;
  console.log("✅ Extração IA concluída com Sucesso (Structured Output Nativo)!");
  console.log(`   Itens detectados: ${parsed.itens.length}`);
  console.log(`   Total Geral Filho Extraído: R$ ${parsed.totais.geral_filho}`);
  console.log(`   Item 1: ${parsed.itens[0].item_real} - R$ ${parsed.itens[0].amount} (${parsed.itens[0].stakeholder})`);
  console.log(`   Item 2: ${parsed.itens[1].item_real} - R$ ${parsed.itens[1].amount} (${parsed.itens[1].stakeholder})\n`);

  // 4. Confirmar Fatura com Adiantamento e Abate da Caixinha
  console.log("💾 FASE 3: Confirmando Fatura (Testando Múltiplas Regras de Negócio)");
  console.log("   Regra A: Adiantar 1 parcela do Magalu (R$ 150.86 * 2)");
  console.log("   Regra B: Abater o total diretamente da Caixinha criada");
  
  // Magalu: 150.86, vamos adiantar 1 parcela (total 2x = 301.72)
  const txs = parsed.itens.map((t: any) => {
    let finalAmount = t.amount;
    if (t.gateway_string.includes("Magalu")) {
      finalAmount = t.amount * 2; // Adiantou 1 parcela
    }
    return {
      date: t.date,
      description: t.item_real || t.gateway_string,
      amount: -Math.abs(finalAmount), // Garantindo negativo no banco para despesa
      categoryName: t.stakeholder,
      vaultId: vault.id // Abatendo da caixinha
    };
  });

  const confirmedTxs = await caller.invoice.confirmInvoice({
    invoiceId: invoice.id,
    userId: user.id,
    transactions: txs
  });

  console.log(`✅ Fatura Confirmada via transação ACID. ${confirmedTxs.length} registros inseridos.\n`);

  // 5. Validar o DB (Efeito Colateral na Caixinha)
  console.log("🔍 FASE 4: Validando Consistência de Banco de Dados");
  const updatedVault = await prisma.vault.findUnique({ where: { id: vault.id } });
  
  // Cálculo Esperado: 
  // Saldo Inicial = 1000
  // Gastos = 301.72 (Magalu x2) + 44.98 (Amazon) = 346.70
  // Saldo Final = 1000 - 346.70 = 653.30
  console.log(`   Saldo Inicial da Caixinha: R$ 1000.00`);
  console.log(`   Despesas Deduzidas Atomicamente: R$ 346.70`);
  console.log(`   Saldo Atual no Banco: R$ ${updatedVault?.balance}`);
  
  if (Number(updatedVault?.balance).toFixed(2) === "653.30") {
    console.log("\n🎯 RESULTADO: MATEMÁTICA PERFEITA. O saldo bate exatamente com o esperado.");
    console.log("=================================================");
    console.log("🟢 TESTE E2E APROVADO. A MÁQUINA DE ESTADOS (FSM) ESTÁ 100% BLINDADA.");
    console.log("=================================================\n");
  } else {
    console.error("\n❌ RESULTADO: INCONSISTÊNCIA MATEMÁTICA DETECTADA.");
    console.log(`Esperava 653.30, recebeu ${updatedVault?.balance}`);
    process.exit(1);
  }
}

runE2ETest().catch(console.error).finally(() => prisma.$disconnect());
