import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ExpenseSection } from "@prisma/client";

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const myId = ctx.session.user.id;
      return ctx.prisma.category.findMany({
        where: { userId: myId },
        orderBy: { name: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        section: z.nativeEnum(ExpenseSection),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({
        where: { id: input.id },
      });
    }),
});
