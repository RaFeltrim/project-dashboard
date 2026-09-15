import { mapCategory } from "./categoryMapper";
import type { ParsedTransaction } from "../../types/finance";

export type { ParsedTransaction };

/**
 * Faz o parse de um CSV simples (ex: Data, Descrição, Valor)
 * ou do layout padrão exportado do Santander.
 */
export function parseCSV(csvContent: string): ParsedTransaction[] {
  const lines = csvContent.split("\n");
  const results: ParsedTransaction[] = [];

  // Pula header (assumindo que a primeira linha é header ou lixo do Santander)
  // O Santander normalmente tem um cabeçalho, então vamos pular até achar uma data válida
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";"); // O padrão BR no Excel/Santander costuma usar ponto-e-vírgula

    if (parts.length >= 3) {
      const rawDate = parts[0].trim();
      const rawDesc = parts[1].trim();
      const rawValue = parts[2].trim();

      // Checagem básica se a primeira coluna parece uma data (DD/MM/YYYY)
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (dateRegex.test(rawDate)) {
        // Parse valor numérico BR (1.200,50 -> 1200.50)
        // Remove pontos de milhar, troca vírgula por ponto
        let numStr = rawValue.replace(/\./g, "").replace(",", ".");
        const amount = parseFloat(numStr);

        if (!isNaN(amount)) {
          results.push({
            date: rawDate,
            description: rawDesc,
            amount: amount,
            categoryGuess: mapCategory(rawDesc),
          });
        }
      }
    }
  }

  return results;
}
