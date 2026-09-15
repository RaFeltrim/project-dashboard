# 🔬 DEEP DIVE: Relatório de Análise do Backend

**Sessão:** 04/03/2026
**Mesa-Redonda:** Dev Node, Dev Mobile, TL, QA, PO, PM

## 📝 Pontos Discutidos
- **TL:** "O nosso backend atual está diluído. Temos uma porta Exprees `3001` local (`scraper-api.js`) para suportar o Playwright Scraper de alta voltagem, e Edge logic pulverizada no client-side via Supabase."
- **Dev Node:** "Eu cobri o Hardening na Sprint 4.5. Temos Bearer Tokens na API `3001` e proteção CORS. Mas os arquivos (ex: `storeScraper.js` de 13kb) estão monolíticos. O `ai-gap-engine.js` foi criado hoje e já separa responsabilidade."
- **Dev Node (Sprint 7.5):** "Na Sprint 7.5, adicionamos `express-rate-limit` com dois limiters: `scrapeLimiter` 10 req/min nos endpoints de scrape e `aiLimiter` 20 req/min nos endpoints de IA. Também criamos o endpoint `POST /api/ai/generate` como proxy server-side do Qwen, eliminando exposição da API key no client-side. O `callQwen.js` agora chama `http://127.0.0.1:3001/api/ai/generate` em vez da API da Alibaba diretamente."
- **PM & PO:** "Para o negócio, importa a velocidade. A API RPA responde ao Otimizador?"
- **Dev Mobile SR:** "Responde. Mas se a porta 3001 estiver desligada, e o Client chamar o Scraper, estou caindo em Timeout de 30s. Precisamos de timeout mais curto na request p/ o celular avisar rápido que o RPA tá off."
- **QA:** "Isso não foi testado com automação de falha (`ECONNREFUSED`). Vou adicionar."

## 📌 Conclusões (Status de Ação Backend)
1. **[SAUDÁVEL COM RESSALVA]** A API Express 3001 é robusta, mas os controllers (arquivos na raiz `/server`) estão soltos. A pasta precisa de refatoração para `./src/server/routes` e `./src/server/controllers` no futuro.
2. Inclusão da *Timeout Exception Rule* na UI: Reduzir a espera da API de Scraping de 30s para 10s se o robo em background não atender.
