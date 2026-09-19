import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const vaultRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.vault.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        targetAmount: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await ctx.prisma.vault.findUnique({
        where: {
          userId_name: {
            userId,
            name: input.name,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Você já possui uma Caixinha com este nome.",
        });
      }

      return ctx.prisma.vault.create({
        data: {
          userId,
          name: input.name,
          targetAmount: input.targetAmount,
          color: input.color,
          icon: input.icon,
        },
      });
    }),

  addFunds: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.$transaction(async (tx) => {
        const vault = await tx.vault.findUnique({
          where: { id: input.id },
        });

        if (!vault || vault.userId !== userId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const updatedVault = await tx.vault.update({
          where: { id: vault.id },
          data: {
            balance: { increment: input.amount },
          },
        });

        // Register the transfer as a transaction
        await tx.transaction.create({
          data: {
            userId: ctx.session.user.id,
            motor: "MANUAL",
            section: "PESSOAL",
            kind: "TRANSFER", // Using TRANSFER to denote movement to vault
            status: "RECONCILED",
            rawDescription: `Aporte - ${vault.name}`,
            normalizedDescription: `Aporte para a caixinha ${vault.name}`,
            amount: input.amount,
            occurredAt: new Date(),
            vaultId: vault.id,
          },
        });

        return updatedVault;
      });
    }),
});
