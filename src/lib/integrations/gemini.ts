import { GoogleGenerativeAI, Schema } from "@google/generative-ai";

// Inicializa o client do Google Gemini
// Requer que GEMINI_API_KEY esteja configurada no .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Envia um prompt para o Gemini Flash e retorna o JSON parseado.
 * Suporta Schema nativo (Structured Outputs) para garantir 100% de match.
 */
export async function callGeminiJSON(
  systemPrompt: string, 
  userPrompt: string,
  responseSchema?: Schema
): Promise<any> {
  // TODO: Adicionar lógica de fallback entre modelos em caso de 503
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash", // Utilizando versão atual (2026) que suporta Schema
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1, // Reduzido para maior determinismo matemático
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
