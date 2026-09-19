import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MotorType, ExpenseSection, Prisma } from "@prisma/client";

export const transactionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ 
      take: z.number().min(1).max(100).optional().default(20),
      cursor: z.string().optional(),
      motor: z.nativeEnum(MotorType).optional(),
      search: z.string().optional(),
      sortBy: z.enum(["date", "description", "amount", "motor"]).optional().default("date"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
    }))
    .query(async ({ ctx, input }) => {
      let orderBy: Prisma.TransactionOrderByWithRelationInput = {};
      if (input.sortBy === "date") orderBy = { occurredAt: input.sortOrder };
      else if (input.sortBy === "description") orderBy = { rawDescription: input.sortOrder };
      else if (input.sortBy === "amount") orderBy = { amount: input.sortOrder };
      else if (input.sortBy === "motor") orderBy = { motor: input.sortOrder };

      const myId = ctx.session.user.id;
      const where: Prisma.TransactionWhereInput = {
        OR: [
          { userId: myId },
          { section: "CASA" }
        ]
      };
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 🔒 Security Gate: verificar propriedade antes de deletar
      const tx = await ctx.prisma.transaction.findUnique({ where: { id: input.id } });
      const myId = ctx.session.user.id;
      
      // Permitir deletar se for o dono OU se for da CASA (pois é compartilhado)
      if (!tx || (tx.userId !== myId && tx.section !== "CASA")) {
        throw new Error("Acesso negado: transação não encontrada ou não pertence ao usuário.");
      }
      return ctx.prisma.transaction.delete({
        where: { id: input.id },
      });
    }),

  createInstallments: protectedProcedure
    .input(z.object({
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
      const myId = ctx.session.user.id;
      for (let i = 0; i < input.installments; i++) {
        // Increment month
        const date = new Date(Date.UTC(input.startYear, input.startMonth + i, input.dayOfMonth, 12, 0, 0));
        
        txs.push({
          userId: myId,
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
