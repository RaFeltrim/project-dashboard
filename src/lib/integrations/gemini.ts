import { GoogleGenerativeAI, Schema } from "@google/generative-ai";

// Inicializa o client do Google Gemini
// Requer que GEMINI_API_KEY esteja configurada no .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Modelo Gemini utilizado para extração de faturas.
 * Centralizado aqui para facilitar upgrades de versão.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

/**
 * Envia um prompt para o Gemini e retorna o JSON parseado.
 * Suporta Schema nativo (Structured Outputs) para garantir 100% de match.
 *
 * @param systemPrompt - Instrução de sistema (persona e regras do modelo)
 * @param userPrompt - Prompt com o conteúdo a ser processado (texto da fatura, etc.)
 * @param responseSchema - Schema opcional para forçar formato de saída estruturado
 * @returns JSON parseado da resposta do modelo
 *
 * @todo Sprint 2 (Mariana-Prompt): Adicionar retry com exponential backoff para erros 503.
 */
export async function callGeminiJSON(
  systemPrompt: string, 
  userPrompt: string,
  responseSchema?: Schema
): Promise<unknown> {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1, // Baixo para maior determinismo matemático
      responseMimeType: "application/json",
      ...(responseSchema ? { responseSchema } : {}),
    },
  });

  const result = await model.generateContent(userPrompt);

  let text = result.response.text();
  // Limpeza preventiva de blocos markdown caso o modelo ainda assim os retorne
  text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  return JSON.parse(text);
}
