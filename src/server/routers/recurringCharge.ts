import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MotorType } from "@prisma/client";

export const recurringChargeRouter = createTRPCRouter({
  getAll: protectedProcedure
    
    .query(async ({ ctx, input }) => {
      return ctx.prisma.recurringCharge.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { nextChargeAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
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
      const nextChargeAt = new Date(input.startsAt);
      nextChargeAt.setDate(input.dayOfMonth);
      if (nextChargeAt < now) {
        nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);
      }

      return ctx.prisma.recurringCharge.create({
        data: {
          userId: ctx.session.user.id,
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

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // 🔒 Security Gate
      const charge = await ctx.prisma.recurringCharge.findUnique({ where: { id: input.id } });
      if (!charge || charge.userId !== ctx.session.user.id) {
        throw new Error("Acesso negado: recorrência não encontrada ou não pertence ao usuário.");
      }
      return ctx.prisma.recurringCharge.update({
        where: { id: input.id },
        data: { active: input.active },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(),  }))
    .mutation(async ({ ctx, input }) => {
      // 🔒 Security Gate
      const charge = await ctx.prisma.recurringCharge.findUnique({ where: { id: input.id } });
      if (!charge || charge.userId !== ctx.session.user.id) {
        throw new Error("Acesso negado: recorrência não encontrada ou não pertence ao usuário.");
      }
      return ctx.prisma.recurringCharge.delete({
        where: { id: input.id },
      });
    }),

  updateInstallment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newCurrentIndex: z.number().min(1),
        newTotal: z.number().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const charge = await ctx.prisma.recurringCharge.findUnique({ where: { id: input.id } });
      if (!charge || charge.userId !== ctx.session.user.id) {
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
