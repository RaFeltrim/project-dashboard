import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { MotorType, InvoiceStatus, ExpenseSection, Prisma } from "@prisma/client";
import { parseCSV } from "../../lib/parsers/csvParser";
import { extractTextFromPDF } from "../../lib/parsers/pdfParser";
import { callGeminiJSON } from "../../lib/integrations/gemini";
import { NUBANK_RATEIO_SYSTEM_PROMPT, buildNubankPrompt } from "../../lib/ai/nubank-prompt";
import { SANTANDER_SYSTEM_PROMPT, buildSantanderPrompt } from "../../lib/ai/santander-prompt";

export const invoiceRouter = createTRPCRouter({
  // 1. Receber upload e processar o parser
  uploadAndParse: protectedProcedure
    .input(
      z.object({
        motor: z.nativeEnum(MotorType),
        fileName: z.string(),
        content: z.string(), // Texto da fatura, CSV ou Base64 de PDF
      })
    )
    .mutation(async ({ ctx, input }) => {
      let parsedData: Prisma.InputJsonValue | null = null;
      let status: InvoiceStatus = InvoiceStatus.PENDING;
      let errorMessage: string | null = null;

      try {
        if (input.motor === MotorType.SANTANDER && input.fileName.endsWith(".csv")) {
          parsedData = parseCSV(input.content) as unknown as Prisma.InputJsonValue;
          status = InvoiceStatus.PARSED;
        } else if (input.motor === MotorType.SANTANDER && input.fileName.endsWith(".pdf")) {
          const buffer = Buffer.from(input.content, 'base64');
          const pdfText = await extractTextFromPDF(buffer);
          
          const result = (await callGeminiJSON(SANTANDER_SYSTEM_PROMPT, buildSantanderPrompt(pdfText))) as { items?: unknown[] } | null;
          if (result?.items) {
            parsedData = result.items as unknown as Prisma.InputJsonValue;
            status = InvoiceStatus.PARSED;
          } else {
            status = InvoiceStatus.ERROR;
            errorMessage = "A IA não retornou conteúdo para o Santander";
          }
        } else if (input.motor === MotorType.NUBANK_RATEIO) {
          let textToParse = input.content;
          
          if (input.fileName.endsWith(".pdf")) {
            const buffer = Buffer.from(input.content, 'base64');
            textToParse = await extractTextFromPDF(buffer);
          }

          const result = (await callGeminiJSON(NUBANK_RATEIO_SYSTEM_PROMPT, buildNubankPrompt(textToParse))) as { itens?: unknown[] } | null;
          if (result && result.itens) {
            parsedData = result as unknown as Prisma.InputJsonValue; // Store the ENTIRE object (totals, items, report)
            status = InvoiceStatus.PARSED;
          } else {
            status = InvoiceStatus.ERROR;
            errorMessage = "A IA não retornou o esquema JSON esperado";
          }
        }
      } catch (err: unknown) {
        status = InvoiceStatus.ERROR;
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      return ctx.prisma.invoice.create({
        data: {
          userId: ctx.session.user.id,
          motor: input.motor,
          fileName: input.fileName,
          rawContent: input.content,
          status,
          errorMessage,
          parsedData: parsedData ? parsedData : undefined,
        },
      });
    }),

  // 2. Buscar invoice pendente
  getParsedInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
      });
    }),

  // 3. Confirmar a listagem (transformar em transações reais)
  confirmInvoice: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        targetMonth: z.number().optional(), // 0 a 11
        targetYear: z.number().optional(),
        transactions: z.array(
          z.object({
            date: z.string(),
            description: z.string(),
            amount: z.number(),
            categoryName: z.string().optional(), // Stakeholder name
            vaultId: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId }
      });

      if (!invoice) throw new Error("Invoice não encontrada");

      // 🔒 LGPD Security Gate: verificar propriedade da invoice
      if (invoice.userId !== ctx.session.user.id) {
        throw new Error("Acesso negado: esta fatura não pertence ao usuário informado.");
      }

      // Use a Prisma transaction to ensure Vault deductions are ACID
      return ctx.prisma.$transaction(async (tx) => {
        const createdTxs = [];
        
        for (const t of input.transactions) {
          // Parse data
          let dateObj = new Date();
          if (t.date.includes("/")) {
            const parts = t.date.split("/");
            if (parts.length === 3) {
              dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else if (parts.length === 2) {
              dateObj = new Date(new Date().getFullYear(), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          } else if (t.date.includes(" ")) {
            // Nubank format "10 AGO"
            const parts = t.date.split(" ");
            const months: Record<string, number> = { JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11 };
            if (parts.length === 2 && months[parts[1]] !== undefined) {
              dateObj = new Date(new Date().getFullYear(), months[parts[1]], parseInt(parts[0]));
            }
          }

          // Use target date if provided (forces all items to e.g. Sep 1st 2026), else use parsed date
          if (input.targetMonth !== undefined && input.targetYear !== undefined) {
            dateObj = new Date(Date.UTC(input.targetYear, input.targetMonth, 1, 12, 0, 0));
          }

          // Mapear Stakeholder (categoryName) para ExpenseSection
          const STAKEHOLDER_TO_SECTION: Record<string, ExpenseSection> = {
            AP: ExpenseSection.CASA,
            TERCEIROS: ExpenseSection.TERCEIROS,
            MAE: ExpenseSection.MAE,
            SUB_PESSOAL: ExpenseSection.PESSOAL,
          };
          const sectionVal = STAKEHOLDER_TO_SECTION[t.categoryName ?? ""] ?? ExpenseSection.PESSOAL;

          // Create transaction
          const createdTx = await tx.transaction.create({
            data: {
              userId: ctx.session.user.id,
              motor: invoice.motor,
              section: sectionVal,
              rawDescription: t.description,
              normalizedDescription: t.description,
              amount: t.amount,
              occurredAt: dateObj,
              vaultId: t.vaultId,
            }
          });
          createdTxs.push(createdTx);

          // Se escolheu abater da caixinha, reduz o saldo (note que expense normalmente é positiva ou negativa, dependendo da convenção. Assumindo que expenses são POSITIVAS no Nubank, diminuímos o balance)
          // Se for Santander, amount é negativo, então SOMAMOS o amount negativo no saldo (diminui).
          if (t.vaultId) {
            const amountToDeduct = t.amount < 0 ? Math.abs(t.amount) : t.amount;
            await tx.vault.update({
              where: { id: t.vaultId },
              data: { balance: { decrement: amountToDeduct } }
            });
          }
        }

        // Atualiza Invoice
        await tx.invoice.update({
          where: { id: input.invoiceId },
          data: { status: InvoiceStatus.CONFIRMED },
        });

        return createdTxs;
      });
    }),
});
