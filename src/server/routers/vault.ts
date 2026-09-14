import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const vaultRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.vault.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1),
        targetAmount: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.vault.findUnique({
        where: {
          userId_name: {
            userId: input.userId,
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
          userId: input.userId,
          name: input.name,
          targetAmount: input.targetAmount,
          color: input.color,
          icon: input.icon,
        },
      });
    }),

  addFunds: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const vault = await tx.vault.findUnique({
          where: { id: input.id },
        });

        if (!vault || vault.userId !== input.userId) {
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
            userId: input.userId,
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
