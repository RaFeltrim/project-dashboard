import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MotorType } from "@prisma/client";
import { mapCategory } from "../../lib/parsers/categoryMapper";

export const fastChatRouter = createTRPCRouter({
  process: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Regra TDAH: -50 ifood ou +100 pix
      const regex = /^([+-]?\d+(?:[.,]\d{1,2})?)\s+(.+)$/i;
      const match = input.message.trim().match(regex);

      if (!match) {
        throw new Error("Formato inválido. Use algo como: -50 ifood");
      }

      const amountStr = match[1].replace(",", ".");
      let amount = parseFloat(amountStr);
      const description = match[2].trim();

      // Se não tiver sinal explícito, podemos assumir negativo (despesa)
      // Mas a regex já pega o sinal. Se amount > 0 mas o usuário quis dizer despesa
      // vamos ser inteligentes: se não tiver "+", assumimos despesa
      if (!amountStr.startsWith("+") && !amountStr.startsWith("-")) {
        amount = -Math.abs(amount);
      }

      const tx = await ctx.prisma.transaction.create({
        data: {
          userId: ctx.session.user.id,
          motor: MotorType.MANUAL,
          amount,
          rawDescription: description,
          normalizedDescription: description,
          occurredAt: new Date(),
        },
      });

      return { success: true, transaction: tx, categoryGuess: mapCategory(description) };
    }),
});
