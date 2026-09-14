import OpenAI from "openai";

// Inicializa o client da OpenAI
// Requer que OPENAI_API_KEY esteja configurada no .env
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
