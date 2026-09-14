export function mapCategory(description: string): string {
  const descLower = description.toLowerCase();

  // Mapeamento de termos para nomes de categorias
  // O retorno deve ser similar ao nome salvo no Seed (ex: "Alimentação", "Transporte")
  const mappings: { keys: string[]; category: string }[] = [
    {
      keys: ["ifood", "uber eats", "rappi", "mcdonalds", "bk", "burger king", "padaria", "restaurante", "lanchonete", "pizza", "café"],
      category: "Alimentação",
    },
    {
      keys: ["uber", "99", "cabify", "inDrive", "posto", "ipiranga", "shell", "br", "petrobras", "estacionamento", "pedagio", "sem parar"],
      category: "Transporte",
    },
    {
      keys: ["farmacia", "drogasil", "droga raia", "pague menos", "hospital", "unimed", "consulta", "exame", "dentista", "psicologo"],
      category: "Saúde",
    },
    {
      keys: ["netflix", "spotify", "amazon prime", "hbo", "disney", "apple", "globo", "cinema", "ingresso", "sympla"],
      category: "Assinaturas",
    },
    {
      keys: ["supermercado", "carrefour", "pao de acucar", "extra", "dia", "atacadao", "assai", "mercado"],
      category: "Mercado",
    },
    {
      keys: ["petz", "cobasi", "veterinario", "pet shop", "racao"],
      category: "Pets",
    },
    {
      keys: ["enel", "sabesp", "copel", "sanepar", "light", "energia", "agua", "luz"],
      category: "Contas Básicas",
    },
    {
      keys: ["vivo", "claro", "tim", "oi", "internet", "telefone"],
      category: "Internet e Celular",
    },
    {
      keys: ["smart fit", "bluefit", "academia", "crossfit", "esporte", "centauro", "decathlon"],
      category: "Esportes e Lazer",
    },
    {
      keys: ["udemy", "alura", "coursera", "faculdade", "escola", "curso", "livro", "amazon", "kindle"],
      category: "Educação",
    },
    {
      keys: ["renner", "riachuelo", "cea", "zara", "dafiti", "shein", "shopee", "mercado livre", "roupa", "vestuario"],
      category: "Compras",
    },
  ];

  for (const mapping of mappings) {
    if (mapping.keys.some((key) => descLower.includes(key))) {
      return mapping.category;
    }
  }

  return "Outros"; // Categoria genérica caso não encontre
}
