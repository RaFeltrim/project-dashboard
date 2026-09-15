/**
 * @deprecated Este módulo não é utilizado no sistema.
 * O Finance Hub utiliza exclusivamente o Google Gemini (src/lib/integrations/gemini.ts).
 * Este arquivo será removido na Sprint 2 após confirmar que não há nenhuma referência restante.
 *
 * TODO(Sprint 2): Remover este arquivo e a dependência `openai` do package.json
 */
import OpenAI from "openai";

// Inicializa o client da OpenAI
// Requer que OPENAI_API_KEY esteja configurada no .env
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
