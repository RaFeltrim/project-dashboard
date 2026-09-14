import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { fetchRecentTransactions } from "../../lib/integrations/mercadoPago";
import { mapCategory } from "../../lib/parsers/categoryMapper";
import { MotorType } from "@prisma/client";

export const mercadoPagoRouter = createTRPCRouter({
  // 1. Obter config atual
  getConfig: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.mercadoPagoConfig.findUnique({
        where: { userId: input.userId },
      });
    }),

  // 2. Salvar Token
  saveConfig: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        accessToken: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.mercadoPagoConfig.upsert({
        where: { userId: input.userId },
        update: { accessToken: input.accessToken },
        create: {
          userId: input.userId,
          accessToken: input.accessToken,
        },
      });
    }),

  // 3. Sincronizar transações
  sync: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.mercadoPagoConfig.findUnique({
        where: { userId: input.userId },
      });

      if (!config || !config.accessToken) {
        throw new Error("Token do Mercado Pago não configurado.");
      }

      // Buscar ultimos 30 dias na API
      const mpTxs = await fetchRecentTransactions(config.accessToken, 30);

      if (mpTxs.length === 0) {
        return { success: true, count: 0 };
      }

      // Para cada tx do MP, checar se já existe (via data e valor exato) ou algo assim
      // No MVP, vamos apenas inserir. Mas idealmente precisa de uniq constraint no db.
      // Vou simplificar inserindo as que foram "approved" e mapCategory.
      
      const approvedTxs = mpTxs.filter((t: any) => t.status === "approved");

      let insertedCount = 0;

      for (const tx of approvedTxs) {
        // Checar se já inseriu nas ultimas 24h
        const existing = await ctx.prisma.transaction.findFirst({
            where: {
              userId: input.userId,
              motor: MotorType.MERCADO_PAGO,
              amount: tx.amount,
              rawDescription: tx.description,
            }
          });

          if (!existing) {
            await ctx.prisma.transaction.create({
              data: {
                userId: input.userId,
                motor: MotorType.MERCADO_PAGO,
                amount: tx.type === "regular_payment" ? -tx.amount : tx.amount, // ajuste de sinal
                rawDescription: tx.description,
                normalizedDescription: tx.description,
                occurredAt: tx.date,
              }
            });
          insertedCount++;
        }
      }

      await ctx.prisma.mercadoPagoConfig.update({
        where: { userId: input.userId },
        data: { lastSyncAt: new Date() },
      });

      return { success: true, count: insertedCount };
    }),
});
