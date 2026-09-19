import assert from "assert";
import { Schema, SchemaType } from "@google/generative-ai";
import { SANTANDER_SCHEMA } from "../lib/ai/santander-prompt";
import { NUBANK_SCHEMA } from "../lib/ai/nubank-prompt";

// Helper function to validate objects against our Google GenAI Schema format
// This simulates what the Gemini backend does when using responseSchema
function validateAgainstSchema(data: unknown, schema: Schema): boolean {
  if (schema.type === SchemaType.OBJECT) {
    if (typeof data !== "object" || data === null) return false;
    const obj = data as Record<string, unknown>;
    for (const req of schema.required || []) {
      if (!(req in obj)) return false;
    }
    for (const key in obj) {
      if (schema.properties && schema.properties[key]) {
        if (!validateAgainstSchema(obj[key], schema.properties[key])) return false;
      }
    }
    return true;
  }
  if (schema.type === SchemaType.ARRAY) {
    if (!Array.isArray(data)) return false;
    if (!schema.items) return true;
    return data.every(item => validateAgainstSchema(item, schema.items as Schema));
  }
  if (schema.type === SchemaType.STRING) return typeof data === "string";
  if (schema.type === SchemaType.NUMBER) return typeof data === "number";
  if (schema.type === SchemaType.BOOLEAN) return typeof data === "boolean";
  return true;
}

// BDD Mocks - Payload "Sujo" (o que a IA tentaria devolver antes da blindagem)
const mockSantanderSujo = {
  transacoes: [
    { data: "16/04", descricao: "SUPERMERCADO ABC", valor: -150.00 }
  ]
};

// Payload "Limpo" (Forçado pelo Schema)
const mockSantanderLimpo = {
  items: [
    { date: "16/04", description: "SUPERMERCADO ABC", amount: -150.00 }
  ]
};

const mockNubankLimpo = {
  mes_referencia: "AGOSTO",
  totais: {
    ap_total: 44.98,
    sub_pessoal_total: 150.86,
    terceiros_total: 26.85,
    mae_total: 0.00,
    geral_filho: 222.69
  },
  itens: [
    { date: "10 AGO", gateway_string: "Mlp*Magalu-123 Comprou", item_real: "Monitor", amount: 150.86, stakeholder: "SUB_PESSOAL", parcela_atual: 7, parcela_total: 8, last_installment: false, reasoning: "Dicionario" },
  ],
  whatsapp_report: "🟢 MÊS (AGOSTO)..."
};

console.log("=== INICIANDO LOOP DE VALIDAÇÃO QA (BDD) ===");

try {
  // Cenário 1: Simulando o parser rejeitando payload sujo
  console.log("Cenário 1: Rejeitar payload do Santander sem schema correto...");
  const isValidSujo = validateAgainstSchema(mockSantanderSujo, SANTANDER_SCHEMA);
  assert.strictEqual(isValidSujo, false, "O payload sujo passou indevidamente!");
  console.log("✅ PASSOU: Payload sujo foi bloqueado pelo Schema.");

  // Cenário 2: Simulando o parser aceitando payload limpo
  console.log("Cenário 2: Aceitar payload formatado perfeitamente para Santander...");
  const isValidLimpo = validateAgainstSchema(mockSantanderLimpo, SANTANDER_SCHEMA);
  assert.strictEqual(isValidLimpo, true, "O payload limpo do Santander foi rejeitado!");
  console.log("✅ PASSOU: Payload limpo do Santander foi aceito.");

  // Cenário 3: Validando Schema complexo do Nubank
  console.log("Cenário 3: Aceitar payload formatado perfeitamente para Nubank...");
  const isNubankValid = validateAgainstSchema(mockNubankLimpo, NUBANK_SCHEMA);
  assert.strictEqual(isNubankValid, true, "O payload limpo do Nubank foi rejeitado!");
  console.log("✅ PASSOU: Payload limpo do Nubank foi aceito.");
  
  console.log("=== SUCESSO: CÓDIGO VALIDADO POR TODAS AS PERSONAS ===");
  process.exit(0);
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("❌ FALHA NO BDD:", msg);
  process.exit(1);
}
