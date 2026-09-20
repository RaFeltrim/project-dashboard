import { NextRequest, NextResponse } from "next/server";
import { GmailService } from "../../../../server/services/gmailService";
import { extractTextFromPDF } from "../../../../lib/parsers/pdfParser";
import { PrismaClient, MotorType, InvoiceStatus, Prisma } from "@prisma/client";
import { callGeminiJSON } from "../../../../lib/integrations/gemini";
import { NUBANK_RATEIO_SYSTEM_PROMPT, buildNubankPrompt, NUBANK_SCHEMA } from "../../../../lib/ai/nubank-prompt";
import { SANTANDER_SYSTEM_PROMPT, buildSantanderPrompt, SANTANDER_SCHEMA } from "../../../../lib/ai/santander-prompt";

const prisma = new PrismaClient();

// Vercel Cron Functions max duration
export const maxDuration = 60; 

export async function GET(req: NextRequest) {
  try {
    const gmailService = new GmailService();

    // 1. Pegar o usuário admin (assumindo rafeltrim@gmail.com)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'rafeltrim@gmail.com' },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const processedLogs: string[] = [];

    // ============================================
    // PROCESSAR NUBANK (Mãe: gislainefeltrim@gmail.com)
    // ============================================
    const nubankEmails = await gmailService.listMessages('from:gislainefeltrim@gmail.com has:attachment');
    for (const msg of nubankEmails) {
      if (!msg.id) continue;

      const fileName = `Nubank_Gmail_${msg.id}.pdf`;
      const existing = await prisma.invoice.findFirst({ where: { fileName } });
      if (existing) continue; // Pula se já importou

      const fullMsg = await gmailService.getMessageDetails(msg.id);
      const pdfBuffer = await gmailService.getPdfAttachment(fullMsg.id!, fullMsg.payload!);
      if (pdfBuffer) {
        const pdfText = await extractTextFromPDF(pdfBuffer);
        
        let parsedData: unknown = null;
        let status: InvoiceStatus = InvoiceStatus.PENDING;
        let errorMessage: string | null = null;

        if (!pdfText || pdfText.trim().length < 10) {
          status = InvoiceStatus.ERROR;
          errorMessage = "Não foi possível extrair texto do PDF Nubank via Gmail.";
        } else {
          try {
            const userPrompt = buildNubankPrompt(pdfText, undefined); // Personal expenses opcional aqui
            const result = (await callGeminiJSON(NUBANK_RATEIO_SYSTEM_PROMPT, userPrompt, NUBANK_SCHEMA)) as Record<string, unknown>;
            if (Array.isArray(result?.itens)) {
              parsedData = result;
              status = InvoiceStatus.PARSED;
            } else {
              status = InvoiceStatus.ERROR;
              errorMessage = "IA não retornou itens válidos para Nubank.";
            }
          } catch (err: any) {
            status = InvoiceStatus.ERROR;
            errorMessage = "Erro na IA (Nubank): " + err.message;
          }
        }

        await prisma.invoice.create({
          data: {
            userId: adminUser.id,
            motor: MotorType.NUBANK_RATEIO,
            fileName,
            rawContent: pdfText || "(Sem texto extraído)",
            status,
            errorMessage,
            parsedData: parsedData ? (parsedData as Prisma.InputJsonValue) : undefined,
          },
        });

        // Marcar como lido
        await gmailService.markAsRead(msg.id!);
        processedLogs.push(`Processado Nubank MsgID: ${msg.id}`);
      }
    }

    // ============================================
    // PROCESSAR SANTANDER
    // ============================================
    const santanderEmails = await gmailService.listMessages('from:faturaporemail@santander.com.br has:attachment');
    for (const msg of santanderEmails) {
      if (!msg.id) continue;

      const fileName = `Santander_Gmail_${msg.id}.pdf`;
      const existing = await prisma.invoice.findFirst({ where: { fileName } });
      if (existing) continue; // Pula se já importou

      const fullMsg = await gmailService.getMessageDetails(msg.id);
      const pdfBuffer = await gmailService.getPdfAttachment(fullMsg.id!, fullMsg.payload!);
      if (pdfBuffer) {
        // Usa a senha definida no ENV (o CPF)
        const password = process.env.SANTANDER_INVOICE_PASSWORD; 
        const pdfText = await extractTextFromPDF(pdfBuffer, password);
        
        let parsedData: unknown = null;
        let status: InvoiceStatus = InvoiceStatus.PENDING;
        let errorMessage: string | null = null;

        if (!pdfText || pdfText.trim().length < 10) {
          status = InvoiceStatus.ERROR;
          errorMessage = "Não foi possível extrair texto do PDF Santander. Senha incorreta?";
        } else {
          try {
            const userPrompt = buildSantanderPrompt(pdfText);
            const result = (await callGeminiJSON(SANTANDER_SYSTEM_PROMPT, userPrompt, SANTANDER_SCHEMA)) as Record<string, unknown>;
            if (Array.isArray(result?.items)) {
              parsedData = result.items;
              status = InvoiceStatus.PARSED;
            } else {
              status = InvoiceStatus.ERROR;
              errorMessage = "IA não retornou itens válidos para Santander.";
            }
          } catch (err: any) {
            status = InvoiceStatus.ERROR;
            errorMessage = "Erro na IA (Santander): " + err.message;
          }
        }

        await prisma.invoice.create({
          data: {
            userId: adminUser.id,
            motor: MotorType.SANTANDER,
            fileName,
            rawContent: pdfText || "(Sem texto extraído)",
            status,
            errorMessage,
            parsedData: parsedData ? (parsedData as Prisma.InputJsonValue) : undefined,
          },
        });

        // Marcar como lido
        await gmailService.markAsRead(msg.id!);
        processedLogs.push(`Processado Santander MsgID: ${msg.id}`);
      }
    }

    return NextResponse.json({ success: true, processedLogs });

  } catch (error: any) {
    console.error("[cron/process-invoices] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
