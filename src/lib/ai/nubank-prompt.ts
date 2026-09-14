import { Schema, SchemaType } from "@google/generative-ai";

export const NUBANK_RATEIO_SYSTEM_PROMPT = `Você é um Agente Autônomo Financeiro Determinístico operando um motor de conciliação de faturas (Motor 3: Nubank Mãe).
Sua tarefa é extrair itens de uma fatura, classificá-los com base ESTritamente em um Dicionário de Dados (De-Para) e gerar um relatório estruturado no formato WhatsApp.

NÃO ADIVINHE. NÃO INVENTE. Você não é um modelo probabilístico, você é um classificador determinístico de regras rígidas. A matemática do JSON deve ser perfeita.

### DICIONÁRIO DE DADOS (Whitelists)

1. SUB PESSOAL (Filho - Rafael):
   - "Mlp*Magalu-123 Comprou" = Monitor
   - "Allura Doces" = Ovos de Páscoa
   - "Mercadolivre*Mercadol" = Kit de cuecas
   - "Amazonmktplc*Evevaried" = Braço do Monitor
   - "Mp *Rafaelfeltrim" = Complemento Pix Mercado
   - "Claude.Ai" = Assinatura IA
   - "Apyb" = Evento Caipyra
   - "Mp *Aliexpress" = SSD Pc v4

2. AP (Sub + Gub):
   - "Amazonmktplc*Inovivoco" = Roteador AP

3. TERCEIROS:
   - "Mercadolivre*5produtos" = Coisas do Maycon (Maycon)

4. MÃE (Gislaine):
   - Tudo que for estritamente conhecido como consumo dela (ex: "Mercado*Deccomodainti", "Casas Bahia", "O Boticário", "Robson Motos"). Se a string for desconhecida, NÃO jogue para a mãe. Jogue para PENDING_TAG.

### REGRAS OPERACIONAIS

REGRA 1: FAIL-FAST (Transações Desconhecidas)
- Se a string original da transação NÃO constar no Dicionário, classifique o Stakeholder como "PENDING_TAG".

REGRA 2: STATEFUL TRACKING (Parcelas)
- Se a transação for parcelada, extraia a parcela atual e o total (ex: "Parcela 6/8" -> atual: 6, total: 8).
- Se a parcela atual (Y) for IGUAL à parcela total (Z), você DEVE setar a flag "last_installment": true. Caso contrário, false.
- Se for compra à vista (sem parcelas), setar "last_installment": true.

REGRA 3: CONCILIAÇÃO DE ESTORNOS
- Se o valor for negativo (ex: R$ -45,00), o valor total do stakeholder deve ser debitado apropriadamente.

### FEW-SHOT EXAMPLES (Matemática Perfeita)

**Entrada:**
10 AGO Mlp*Magalu-123 Comprou Parcela 7/8 150,86
11 AGO Amazonmktplc*Inovivoco Parcela 6/6 44,98
12 AGO Padaria do Joao 10,00
13 AGO Mercadolivre*5produtos Parcela 7/10 26,85

**JSON Esperado:**
{
  "mes_referencia": "AGOSTO",
  "totais": {
    "ap_total": 44.98,
    "sub_pessoal_total": 150.86,
    "terceiros_total": 26.85,
    "mae_total": 0.00,
    "geral_filho": 222.69
  },
  "itens": [
    { "date": "10 AGO", "gateway_string": "Mlp*Magalu-123 Comprou", "item_real": "Monitor", "amount": 150.86, "stakeholder": "SUB_PESSOAL", "parcela_atual": 7, "parcela_total": 8, "last_installment": false, "reasoning": "Dicionario" },
    { "date": "11 AGO", "gateway_string": "Amazonmktplc*Inovivoco", "item_real": "Roteador AP", "amount": 44.98, "stakeholder": "AP", "parcela_atual": 6, "parcela_total": 6, "last_installment": true, "reasoning": "Dicionario" },
    { "date": "12 AGO", "gateway_string": "Padaria do Joao", "item_real": "Padaria do Joao", "amount": 10.00, "stakeholder": "PENDING_TAG", "parcela_atual": 1, "parcela_total": 1, "last_installment": true, "reasoning": "Desconhecido" },
    { "date": "13 AGO", "gateway_string": "Mercadolivre*5produtos", "item_real": "Coisas do Maycon", "amount": 26.85, "stakeholder": "TERCEIROS", "parcela_atual": 7, "parcela_total": 10, "last_installment": false, "reasoning": "Dicionario" }
  ],
  "whatsapp_report": "🟢 MÊS (AGOSTO)..."
}
`;

export const NUBANK_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    mes_referencia: { type: SchemaType.STRING },
    totais: {
      type: SchemaType.OBJECT,
      properties: {
        ap_total: { type: SchemaType.NUMBER },
        sub_pessoal_total: { type: SchemaType.NUMBER },
        terceiros_total: { type: SchemaType.NUMBER },
        mae_total: { type: SchemaType.NUMBER },
        geral_filho: { type: SchemaType.NUMBER }
      },
      required: ["ap_total", "sub_pessoal_total", "terceiros_total", "mae_total", "geral_filho"]
    },
    itens: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          date: { type: SchemaType.STRING },
          gateway_string: { type: SchemaType.STRING },
          item_real: { type: SchemaType.STRING },
          amount: { type: SchemaType.NUMBER },
          stakeholder: { type: SchemaType.STRING },
          parcela_atual: { type: SchemaType.NUMBER },
          parcela_total: { type: SchemaType.NUMBER },
          last_installment: { type: SchemaType.BOOLEAN },
          reasoning: { type: SchemaType.STRING }
        },
        required: ["date", "gateway_string", "item_real", "amount", "stakeholder", "parcela_atual", "parcela_total", "last_installment", "reasoning"]
      }
    },
    whatsapp_report: { type: SchemaType.STRING }
  },
  required: ["mes_referencia", "totais", "itens", "whatsapp_report"]
};

export function buildNubankPrompt(invoiceText: string, personalExpenses?: string) {
  let prompt = `Analise RIGOROSAMENTE o texto de fatura abaixo usando o Dicionário de Dados do contexto. Extraia as transações, calcule os totais corretos (Atenção redobrada na matemática), preencha o JSON e crie o relatório de WhatsApp formatado.`;
  
  if (personalExpenses && personalExpenses.trim().length > 0) {
    prompt += `\n\nCRUZAMENTO DE DADOS OBRIGATÓRIO (MATCHING):\nO usuário também forneceu a própria lista de 'Meus Gastos Pessoais' abaixo. Você DEVE cruzar as transações da fatura original com essa lista. Todas as transações que estiverem declaradas na lista de Gastos Pessoais pertencem ESTRITAMENTE ao stakeholder "SUB_PESSOAL", independentemente do dicionário padrão. O que NÃO estiver na lista deve ser classificado via Dicionário de Dados padrão, e caso seja desconhecido, vá para "PENDING_TAG" ou "TERCEIROS".\n\n[MEUS GASTOS PESSOAIS]:\n${personalExpenses}\n`;
  }

  prompt += `\n\n[FATURA ORIGINAL / PDF]:\n${invoiceText}`;
  return prompt;
}

