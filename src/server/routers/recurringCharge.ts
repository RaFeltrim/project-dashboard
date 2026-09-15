import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { MotorType } from "@prisma/client";

export const recurringChargeRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.recurringCharge.findMany({
        where: { userId: input.userId },
        orderBy: { nextChargeAt: "asc" },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        description: z.string().min(1),
        amount: z.number().positive(),
        dayOfMonth: z.number().min(1).max(31),
        isInstallment: z.boolean().default(false),
        installmentTotal: z.number().optional(),
        startsAt: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Logic for nextChargeAt based on startsAt and dayOfMonth
      const now = new Date();
      let nextChargeAt = new Date(input.startsAt);
      nextChargeAt.setDate(input.dayOfMonth);
      if (nextChargeAt < now) {
        nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);
      }

      return ctx.prisma.recurringCharge.create({
        data: {
          userId: input.userId,
          motor: MotorType.CARTAO_TIA,
          description: input.description,
          amount: input.amount,
          dayOfMonth: input.dayOfMonth,
          isInstallment: input.isInstallment,
          installmentTotal: input.installmentTotal,
          installmentIndex: input.isInstallment ? 1 : null,
          startsAt: input.startsAt,
          nextChargeAt,
          notes: input.notes,
        },
      });
    }),

  toggleActive: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // 🔒 Security Gate
      const charge = await ctx.prisma.recurringCharge.findUnique({ where: { id: input.id } });
      if (!charge || charge.userId !== input.userId) {
        throw new Error("Acesso negado: recorrência não encontrada ou não pertence ao usuário.");
      }
      return ctx.prisma.recurringCharge.update({
        where: { id: input.id },
        data: { active: input.active },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 🔒 Security Gate
      const charge = await ctx.prisma.recurringCharge.findUnique({ where: { id: input.id } });
      if (!charge || charge.userId !== input.userId) {
        throw new Error("Acesso negado: recorrência não encontrada ou não pertence ao usuário.");
      }
      return ctx.prisma.recurringCharge.delete({
        where: { id: input.id },
      });
    }),

  updateInstallment: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
        newCurrentIndex: z.number().min(1),
        newTotal: z.number().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const charge = await ctx.prisma.recurringCharge.findUnique({ where: { id: input.id } });
      if (!charge || charge.userId !== input.userId) {
        throw new Error("Acesso negado: lançamento não encontrado ou não pertence ao usuário.");
      }

      const total = input.newTotal ?? charge.installmentTotal ?? input.newCurrentIndex;
      const isFinished = input.newCurrentIndex >= total;

      return ctx.prisma.recurringCharge.update({
        where: { id: input.id },
        data: {
          installmentIndex: input.newCurrentIndex,
          installmentTotal: total,
          active: !isFinished, // Pausa se já quitou todas
        },
      });
    }),
});
