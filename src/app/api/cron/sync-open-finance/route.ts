import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { pluggyClient, getAccounts, getTransactions, getInvestments } from "../../../../lib/integrations/pluggy";

const prisma = new PrismaClient();

// Vercel Cron Functions max duration
export const maxDuration = 60; 

export async function GET(req: NextRequest) {
  try {
    // Pegar todos os Itens do Pluggy conectados no banco
    const pluggyItems = await prisma.pluggyItem.findMany();
    const syncLogs: string[] = [];

    for (const dbItem of pluggyItems) {
      try {
        // 1. Atualizar contas (Saldos Correntes)
        const accounts = await getAccounts(dbItem.pluggyItemId);
        let totalBalance = 0;

        for (const acc of accounts.results) {
          totalBalance += acc.balance;
          await prisma.pluggyAccount.upsert({
            where: { accountId: acc.id },
            update: { balance: acc.balance, name: acc.name },
            create: {
              pluggyItemId: dbItem.id,
              accountId: acc.id,
              name: acc.name,
              type: acc.type,
              subtype: acc.subtype,
              balance: acc.balance,
              currency: acc.currencyCode,
            }
          });
        }

        // 2. Atualizar investimentos (Caixinhas)
        const investments = await getInvestments(dbItem.pluggyItemId);
        for (const inv of investments.results) {
          totalBalance += inv.balance;
          await prisma.pluggyInvestment.upsert({
            where: { investmentId: inv.id },
            update: { balance: inv.balance },
            create: {
              pluggyItemId: dbItem.id,
              investmentId: inv.id,
              name: inv.name,
              type: inv.type,
              balance: inv.balance,
              currency: inv.currencyCode,
            }
          });
        }

        // 3. Atualizar o MercadoPagoConfig mock legacy para fins de manter o gráfico rodando (Retrocompatibilidade)
        // Isso permite que o dashboard puxe o totalBalance sem quebrar
        await prisma.mercadoPagoConfig.upsert({
          where: { userId: dbItem.userId },
          update: { balance: totalBalance, lastSyncAt: new Date() },
          create: {
            userId: dbItem.userId,
            accessToken: "OPEN_FINANCE_SYNCED", // Token fake, apenas indicando open finance
            balance: totalBalance,
            lastSyncAt: new Date()
          }
        });

        syncLogs.push(`Item ${dbItem.name} sincronizado. Saldo+Invest: ${totalBalance}`);

      } catch (err: any) {
        console.error(`Erro ao sincronizar Item ${dbItem.pluggyItemId}:`, err);
        syncLogs.push(`Erro no Item ${dbItem.name}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, logs: syncLogs });

  } catch (error: any) {
    console.error("[cron/sync-open-finance] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
