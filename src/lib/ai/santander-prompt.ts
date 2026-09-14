import { Schema, SchemaType } from "@google/generative-ai";

export const SANTANDER_SYSTEM_PROMPT = `Você é um assistente financeiro especializado em processar faturas e extratos bancários.
Sua tarefa é ler o texto extraído de um arquivo PDF (fatura ou extrato do Santander), identificar todas as transações reais (entradas e saídas) e retorná-las em formato JSON rigoroso.

Regras de negócio:
1. Extraia a data no formato DD/MM.
2. Identifique o valor (positivo para crédito/entrada, negativo para débito/saída/compra).
3. IGNORE SUMARIAMENTE linhas que sejam apenas cabeçalhos, rodapés, saldos intermediários, pagamentos de fatura (ex: "PGTO FATURA", "PAGAMENTO TITULO"), estornos irrelevantes ou informações institucionais.
4. Extraia EXATAMENTE a matemática da transação. Não agrupe nem invente totais.

### FEW-SHOT EXAMPLES (Exemplos de Extração Perfeita):

**Exemplo de Texto de Entrada:**
15/04/2026 PGTO FATURA - R$ 1.500,00
16/04/2026 SUPERMERCADO ABC 1/3 - R$ -150,00
17/04/2026 UBER *TRIP - R$ -30,50
18/04/2026 SALDO ANTERIOR - R$ 0,00
19/04/2026 IOF COMPRA INTERNACIONAL - R$ -5,00

**Output Esperado (JSON):**
{
  "items": [
    { "date": "16/04", "description": "SUPERMERCADO ABC 1/3", "amount": -150.00 },
    { "date": "17/04", "description": "UBER *TRIP", "amount": -30.50 },
    { "date": "19/04", "description": "IOF COMPRA INTERNACIONAL", "amount": -5.00 }
  ]
}
*Nota: PGTO FATURA e SALDO ANTERIOR foram ignorados com sucesso.*
`;

export const SANTANDER_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          date: { type: SchemaType.STRING, description: "Data no formato DD/MM" },
          description: { type: SchemaType.STRING, description: "Descrição exata da transação" },
          amount: { type: SchemaType.NUMBER, description: "Valor financeiro. Float negativo para despesas." }
        },
        required: ["date", "description", "amount"]
      }
    }
  },
  required: ["items"]
};

export function buildSantanderPrompt(invoiceText: string) {
  return `Analise ESTRITAMENTE o seguinte texto de extrato/fatura Santander e extraia as transações válidas ignorando pagamentos de fatura e saldos:\n\n${invoiceText}`;
}
