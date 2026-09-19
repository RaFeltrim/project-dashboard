import { PDFParse } from "pdf-parse";

/**
 * Extrai texto de um buffer PDF usando pdf-parse v2.
 * Retorna o texto concatenado de todas as páginas.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parser: any = new PDFParse({ data: new Uint8Array(buffer) });
  await parser.load();
  
  const result = await parser.getText();
  parser.destroy();
  
  return result?.text || "";
}
