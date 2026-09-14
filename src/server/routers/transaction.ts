import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { MotorType, ExpenseSection } from "@prisma/client";

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ userId: z.string(), take: z.number().optional().default(50) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.transaction.findMany({
        where: { userId: input.userId },
        orderBy: { occurredAt: "desc" },
        take: input.take,
        include: {
          category: true,
          fundingSource: true,
        }
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.transaction.delete({
        where: { id: input.id },
      });
    }),
});
