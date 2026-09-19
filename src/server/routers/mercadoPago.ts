import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { fetchRecentTransactions } from "../../lib/integrations/mercadoPago";
import { MotorType } from "@prisma/client";

export const mercadoPagoRouter = createTRPCRouter({
  // 1. Obter config atual
  getConfig: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.mercadoPagoConfig.findUnique({
        where: { userId: ctx.session.user.id },
      });
    }),

  // 2. Salvar Token
  saveConfig: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.mercadoPagoConfig.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          accessToken: input.accessToken,
        },
        update: {
          accessToken: input.accessToken,
        },
      });
    }),

  // 3. Sincronizar transações
  sync: protectedProcedure
    .mutation(async ({ ctx }) => {
      const config = await ctx.prisma.mercadoPagoConfig.findUnique({
        where: { userId: ctx.session.user.id },
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
      
      const approvedTxs = mpTxs.filter((t) => t.status === "approved");

      let insertedCount = 0;

      for (const tx of approvedTxs) {
        // Checar se já inseriu nas ultimas 24h
        const existing = await ctx.prisma.transaction.findFirst({
            where: {
              userId: ctx.session.user.id,
              motor: MotorType.MERCADO_PAGO,
              amount: tx.amount,
              rawDescription: tx.description,
            }
          });

          if (!existing) {
            await ctx.prisma.transaction.create({
              data: {
                userId: ctx.session.user.id,
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
        where: { userId: ctx.session.user.id },
        data: { lastSyncAt: new Date() },
      });

      return { success: true, count: insertedCount };
    }),
});
