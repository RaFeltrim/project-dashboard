import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { MotorType } from "@prisma/client";

export const dashboardRouter = createTRPCRouter({
  getConsolidatedData: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // 1. Gasto total do mês
      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          userId: input.userId,
          occurredAt: { gte: firstDayOfMonth },
        },
      });

      const totalExpense = transactions
        .filter(t => Number(t.amount) < 0)
        .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);
        
      const totalIncome = transactions
        .filter(t => Number(t.amount) > 0)
        .reduce((acc, t) => acc + Number(t.amount), 0);

      // 2. Alertas: Recorrências que vão cair nos próximos 5 dias
      const next5Days = new Date();
      next5Days.setDate(next5Days.getDate() + 5);
      
      const upcomingCharges = await ctx.prisma.recurringCharge.findMany({
        where: {
          userId: input.userId,
          active: true,
          nextChargeAt: { lte: next5Days },
        },
      });

      // 3. Faturas pendentes de rateio
      const pendingInvoices = await ctx.prisma.invoice.findMany({
        where: {
          userId: input.userId,
          status: "PARSED",
        },
      });

      // 4. Gasto diário recomendado (simplificado: Saldo / Dias restantes)
      // Como não temos saldo fácil integrado de todos os bancos no MVP, 
      // usaremos uma meta de R$ 3000 livre por mês para o cálculo.
      const monthlyBudget = 3000;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = daysInMonth - now.getDate() + 1;
      const budgetLeft = monthlyBudget - totalExpense;
      const dailyRecommended = budgetLeft > 0 ? budgetLeft / daysRemaining : 0;

      // 5. Histórico por motor
      const statsByMotor = transactions.reduce((acc, t) => {
        const m = t.motor;
        if (!acc[m]) acc[m] = 0;
        acc[m] += Math.abs(Number(t.amount));
        return acc;
      }, {} as Record<string, number>);

      return {
        totalExpense,
        totalIncome,
        upcomingCharges,
        pendingInvoices,
        dailyRecommended,
        budgetLeft,
        statsByMotor,
      };
    }),
});
