import { PDFParse } from "pdf-parse";

/**
 * Extrai texto de um buffer PDF usando pdf-parse v2.
 * Retorna o texto concatenado de todas as páginas.
 * Aceita uma senha opcional para PDFs criptografados (ex: Fatura Santander).
 */
export async function extractTextFromPDF(buffer: Buffer, password?: string): Promise<string> {
  const options: any = { data: new Uint8Array(buffer) };
  
  if (password) {
    options.password = password;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parser: any = new PDFParse(options);
  await parser.load();
  
  const result = await parser.getText();
  parser.destroy();
  
  return result?.text || "";
}
