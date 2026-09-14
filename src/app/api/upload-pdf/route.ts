import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "../../../lib/parsers/pdfParser";
import { PrismaClient, MotorType, InvoiceStatus } from "@prisma/client";
import { callGeminiJSON } from "../../../lib/integrations/gemini";
import { NUBANK_RATEIO_SYSTEM_PROMPT, buildNubankPrompt, NUBANK_SCHEMA } from "../../../lib/ai/nubank-prompt";
import { SANTANDER_SYSTEM_PROMPT, buildSantanderPrompt, SANTANDER_SCHEMA } from "../../../lib/ai/santander-prompt";

const prisma = new PrismaClient();

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const motor = formData.get("motor") as MotorType;
    const personalExpenses = formData.get("personalExpenses") as string | null;

    if (!file || !userId || !motor) {
      return NextResponse.json({ error: "Missing file, userId or motor" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    
    let parsedData: any = null;
    let status: InvoiceStatus = InvoiceStatus.PENDING;
    let errorMessage: string | null = null;

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(buffer);

    if (!pdfText || pdfText.trim().length < 10) {
      status = InvoiceStatus.ERROR;
      errorMessage = "Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser um PDF de imagem.";
    } else {
      // Choose prompt based on motor
      let systemPrompt: string;
      let userPrompt: string;
      let responseSchema: any = undefined;

      if (motor === MotorType.SANTANDER) {
        systemPrompt = SANTANDER_SYSTEM_PROMPT;
        userPrompt = buildSantanderPrompt(pdfText);
        responseSchema = SANTANDER_SCHEMA;
      } else if (motor === MotorType.NUBANK_RATEIO) {
        systemPrompt = NUBANK_RATEIO_SYSTEM_PROMPT;
        userPrompt = buildNubankPrompt(pdfText, personalExpenses || undefined);
        responseSchema = NUBANK_SCHEMA;
      } else {
        return NextResponse.json({ error: "Motor não suportado para PDF" }, { status: 400 });
      }

      try {
        const result = await callGeminiJSON(systemPrompt, userPrompt, responseSchema);
        
        if (motor === MotorType.SANTANDER && result?.items) {
          parsedData = result.items;
          status = InvoiceStatus.PARSED;
        } else if (motor === MotorType.NUBANK_RATEIO && result?.itens) {
          parsedData = result; // Store entire object
          status = InvoiceStatus.PARSED;
        } else {
          status = InvoiceStatus.ERROR;
          errorMessage = "A IA não retornou o esquema JSON esperado";
        }
      } catch (aiErr: any) {
        status = InvoiceStatus.ERROR;
        errorMessage = "Erro na IA: " + aiErr.message;
      }
    }

    // Save to DB (store text extracted, not the raw binary)
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        motor,
        fileName,
        rawContent: pdfText || "(PDF sem texto extraído)",
        status,
        errorMessage,
        parsedData: parsedData ? parsedData : undefined,
      },
    });

    return NextResponse.json(invoice);
  } catch (err: any) {
    console.error("[upload-pdf] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
