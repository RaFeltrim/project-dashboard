import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { MotorType, ExpenseSection } from "@prisma/client";

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ 
      userId: z.string(), 
      take: z.number().min(1).max(100).optional().default(20),
      cursor: z.string().optional(),
      motor: z.nativeEnum(MotorType).optional(),
      search: z.string().optional(),
      sortBy: z.enum(["date", "description", "amount", "motor"]).optional().default("date"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
    }))
    .query(async ({ ctx, input }) => {
      let orderBy: any = {};
      if (input.sortBy === "date") orderBy = { occurredAt: input.sortOrder };
      else if (input.sortBy === "description") orderBy = { rawDescription: input.sortOrder };
      else if (input.sortBy === "amount") orderBy = { amount: input.sortOrder };
      else if (input.sortBy === "motor") orderBy = { motor: input.sortOrder };

      let where: any = { userId: input.userId };
      if (input.motor) {
        where.motor = input.motor;
      }
      if (input.search && input.search.trim() !== "") {
        where.rawDescription = { contains: input.search, mode: "insensitive" };
      }

      const items = await ctx.prisma.transaction.findMany({
        where,
        orderBy,
        take: input.take + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          category: true,
          fundingSource: true,
        }
      });

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.take) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 🔒 Security Gate: verificar propriedade antes de deletar
      const tx = await ctx.prisma.transaction.findUnique({ where: { id: input.id } });
      if (!tx || tx.userId !== input.userId) {
        throw new Error("Acesso negado: transação não encontrada ou não pertence ao usuário.");
      }
      return ctx.prisma.transaction.delete({
        where: { id: input.id },
      });
    }),

  createInstallments: publicProcedure
    .input(z.object({
      userId: z.string(),
      description: z.string(),
      amount: z.number(),
      installments: z.number().min(1).max(72),
      startMonth: z.number(), // 0-11
      startYear: z.number(),
      dayOfMonth: z.number(),
      motor: z.nativeEnum(MotorType).default("CARTAO_TIA")
    }))
    .mutation(async ({ ctx, input }) => {
      const txs = [];
      for (let i = 0; i < input.installments; i++) {
        // Increment month
        const date = new Date(Date.UTC(input.startYear, input.startMonth + i, input.dayOfMonth, 12, 0, 0));
        
        txs.push({
          userId: input.userId,
          motor: input.motor,
          section: ExpenseSection.CASA, // Default para Motor 4 (despesas do apartamento)
          rawDescription: `${input.description} ${i + 1}/${input.installments}`,
          normalizedDescription: input.description,
          amount: -Math.abs(input.amount),
          occurredAt: date,
          status: "POSTED" as const,
        });
      }

      await ctx.prisma.transaction.createMany({
        data: txs
      });
      return { success: true, count: txs.length };
    }),
});
