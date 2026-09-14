import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { ExpenseSection } from "@prisma/client";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findMany({
        where: { userId: input.userId },
        orderBy: { name: "asc" },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1),
        section: z.nativeEnum(ExpenseSection),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({
        where: { id: input.id },
      });
    }),
});
