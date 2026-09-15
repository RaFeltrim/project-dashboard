/**
 * Tipos compartilhados utilizados pelos parsers e routers do Finance Hub.
 * Centralizado aqui para evitar duplicação de interfaces entre módulos.
 */

// ============================================
// Tipos de Transação Parseada (Parsers)
// ============================================

/**
 * Representa uma transação parseada de fontes externas (CSV, PDF).
 * Usada pelos parsers antes de ser persistida como Transaction no banco.
 */
export interface ParsedTransaction {
  /** Data no formato string original (ex: "16/04/2026" ou "10 AGO") */
  date: string;
  /** Descrição original extraída do extrato */
  description: string;
  /** Valor numérico (negativo = despesa, positivo = receita) */
  amount: number;
  /** Categoria sugerida automaticamente pelo categoryMapper */
  categoryGuess: string;
}

// ============================================
// Tipos do Nubank Rateio (Motor 3)
// ============================================

/** Stakeholders possíveis em uma fatura Nubank compartilhada */
export type NubankStakeholder = "SUB_PESSOAL" | "AP" | "TERCEIROS" | "MAE";

/** Item individual de uma fatura Nubank após parsing pela IA */
export interface NubankItem {
  date: string;
  gateway_string: string;
  item_real: string;
  amount: number;
  stakeholder: NubankStakeholder;
  parcela_atual: number | null;
  parcela_total: number | null;
  last_installment: boolean;
  reasoning: string;
}

/** Totais calculados pela IA para uma fatura Nubank */
export interface NubankTotais {
  ap_total: number;
  sub_pessoal_total: number;
  terceiros_total: number;
  mae_total: number;
  geral_filho: number;
}

/** Estrutura completa retornada pela IA para uma fatura Nubank */
export interface NubankParsedData {
  mes_referencia: string;
  totais: NubankTotais;
  itens: NubankItem[];
  whatsapp_report: string;
}

// ============================================
// Mapeamento Stakeholder → ExpenseSection
// ============================================

/**
 * Mapeamento canônico de stakeholders do Nubank para ExpenseSection do banco.
 * Centralizado aqui para ser a única fonte de verdade do mapeamento.
 */
export const STAKEHOLDER_TO_SECTION: Record<NubankStakeholder, string> = {
  AP: "CASA",
  TERCEIROS: "TERCEIROS",
  MAE: "MAE",
  SUB_PESSOAL: "PESSOAL",
} as const;
