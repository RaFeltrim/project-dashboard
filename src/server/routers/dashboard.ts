import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";

export const dashboardRouter = createTRPCRouter({
  getConsolidatedData: protectedProcedure
    .input(z.object({ 
      timeRange: z.enum(['THIS_MONTH', 'LAST_30_DAYS', 'ALL_TIME', 'CUSTOM_MONTH']).optional().default('THIS_MONTH'),
      statusFilter: z.enum(['PAGAR', 'PAGOS', 'AMBOS']).optional().default('AMBOS'),
      selectedMonth: z.number().min(0).max(11).optional(),
      selectedYear: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const myId = ctx.session.user.id;
      
      // Lógica de Data (timeRange)
      let dateFilter: Prisma.DateTimeFilter | undefined = undefined;
      if (input.timeRange === 'CUSTOM_MONTH' || (input.selectedMonth !== undefined && input.selectedYear !== undefined && input.timeRange !== 'ALL_TIME' && input.timeRange !== 'LAST_30_DAYS')) {
        const year = input.selectedYear ?? now.getFullYear();
        const month = input.selectedMonth ?? now.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayOfNextMonth = new Date(year, month + 1, 1);
        dateFilter = { gte: firstDayOfMonth, lt: firstDayOfNextMonth };
      } else if (input.timeRange === 'THIS_MONTH') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        dateFilter = { gte: firstDayOfMonth, lt: firstDayOfNextMonth };
      } else if (input.timeRange === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter = { gte: thirtyDaysAgo };
      }
      
      // Lógica de Status (statusFilter)
      let statusFilter: Prisma.DateTimeFilter | undefined = undefined;
      if (input.statusFilter === 'PAGAR') {
        statusFilter = { gt: now }; // Futuro
      } else if (input.statusFilter === 'PAGOS') {
        statusFilter = { lte: now }; // Passado / Hoje
      }

      // Merge Filters
      let occurredAtFilter: Prisma.DateTimeFilter = {};
      if (dateFilter) occurredAtFilter = { ...occurredAtFilter, ...dateFilter };
      if (statusFilter) occurredAtFilter = { ...occurredAtFilter, ...statusFilter };
      
      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          OR: [
            { userId: myId },
            { section: "CASA" }
          ],
          ...(Object.keys(occurredAtFilter).length > 0 ? { occurredAt: occurredAtFilter } : {})
        },
        orderBy: { occurredAt: 'desc' }
      });

      const getEffectiveAmount = (t: typeof transactions[0]) => {
        const val = Number(t.amount);
        return t.section === "CASA" ? val / 2 : val;
      };

      const totalExpense = transactions
        .filter(t => getEffectiveAmount(t) < 0 && t.section !== "MAE" && t.section !== "TERCEIROS")
        .reduce((acc, t) => acc + Math.abs(getEffectiveAmount(t)), 0);
        
      const totalIncome = transactions
        .filter(t => getEffectiveAmount(t) > 0 && t.section !== "MAE" && t.section !== "TERCEIROS")
        .reduce((acc, t) => acc + getEffectiveAmount(t), 0);

      // 2. Alertas: Recorrências que vão cair nos próximos 5 dias
      const next5Days = new Date();
      next5Days.setDate(next5Days.getDate() + 5);
      
      const upcomingCharges = await ctx.prisma.recurringCharge.findMany({
        where: {
          userId: myId,
          active: true,
          nextChargeAt: { lte: next5Days },
        },
      });

      // 3. Faturas pendentes de rateio
      const pendingInvoices = await ctx.prisma.invoice.findMany({
        where: {
          userId: myId,
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

      // 5. Histórico por motor (Em JS por causa da regra do CASA)
      const statsByMotor: Record<string, number> = {};
      
      transactions
        .filter(t => t.section !== 'MAE' && t.section !== 'TERCEIROS' && getEffectiveAmount(t) < 0)
        .forEach(t => {
          const m = t.motor || "MANUAL";
          statsByMotor[m] = (statsByMotor[m] || 0) + Math.abs(getEffectiveAmount(t));
        });

      // 6. Agrupamentos Temporais (Dia, Mês, Ano)
      const groupedByDay: Record<string, { dateStr: string, expense: number, income: number, dateObj: Date }> = {};
      const groupedByMonth: Record<string, { label: string, expense: number, income: number }> = {};
      const groupedByYear: Record<string, { label: string, expense: number, income: number }> = {};
      
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      transactions
        .filter(t => t.section !== "MAE" && t.section !== "TERCEIROS")
        .forEach(t => {
        const dt = t.occurredAt;
        const dayKey = `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`;
        const dayLabel = `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth()+1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
        const monthKey = `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2, '0')}`;
        const monthLabel = `${monthNames[dt.getMonth()]} ${dt.getFullYear()}`;
        const yearKey = `${dt.getFullYear()}`;
        
        const amt = getEffectiveAmount(t);
        const isExp = amt < 0;
        const absAmt = Math.abs(amt);

        if(!groupedByDay[dayKey]) groupedByDay[dayKey] = { dateStr: dayLabel, expense: 0, income: 0, dateObj: dt };
        if(!groupedByMonth[monthKey]) groupedByMonth[monthKey] = { label: monthLabel, expense: 0, income: 0 };
        if(!groupedByYear[yearKey]) groupedByYear[yearKey] = { label: yearKey, expense: 0, income: 0 };

        if (isExp) {
          groupedByDay[dayKey].expense += absAmt;
          groupedByMonth[monthKey].expense += absAmt;
          groupedByYear[yearKey].expense += absAmt;
        } else {
          groupedByDay[dayKey].income += absAmt;
          groupedByMonth[monthKey].income += absAmt;
          groupedByYear[yearKey].income += absAmt;
        }
      });
      
      // Arrays ordenados para o frontend
      const historyByDay = Object.values(groupedByDay).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 30); // Ultimos 30 dias com dados
      const historyByMonth = Object.keys(groupedByMonth).sort().reverse().map(k => groupedByMonth[k]);
      const historyByYear = Object.keys(groupedByYear).sort().reverse().map(k => groupedByYear[k]);

      return {
        totalExpense,
        totalIncome,
        upcomingCharges,
        pendingInvoices,
        dailyRecommended,
        budgetLeft,
        statsByMotor,
        historyByDay,
        historyByMonth,
        historyByYear
      };
    }),
});
