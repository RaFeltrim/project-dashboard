# 🕵️‍♀️ Matriz de Qualidade (Shift-Left & Automação)

**Autoria:** QA / SDET (Software Development Engineer in Test)  
**Objetivo:** Provar a efetividade da nossa blindagem, listando massas, cenários, acessos e os fluxos implementados de Garantia de Qualidade.

---

## ⚙️ Acessos e Ambientes

| Ambiente | URL | Credenciais de Teste Automatizado |
|----------|-----|-----------------------------------|
| **Local (CI)** | `http://localhost:5173` | `qa.tester@gmail.com` / `qa123` |
| **Produção** | `https://mkp-manager.vercel.app`| (Uso exclusivo do Titular) |
| **Supabase** | `wlmutjvvobygtlbvofbu.supabase.co` | Keys públicas no `.env.example` |

---

## 🧪 Shift-Left na Prática

A cultura de Shift-Left exige testes *assim que o código é escrito*. Nós dividimos em 3 camadas (Pirâmide de Testes):

### 1. Camada Unitária (Vitest)
Executamos o `Gatekeeper.spec.js`. A suíte de 53 testes intercepta lixos de unicode, erros de EAN ou falhas de Regex milissegundos após o Desenvolvedor salvar o arquivo e antes de o pipeline aprovar o PR.
*Prova de Efetividade:* O Gatekeeper é engatilhado no GitHub Actions bloqueando merges ruins.
*Última validação:* Sprint 7.5 (2026-03-07) — **53/53 testes passando** após 14 alterações de código (security fixes, bug fixes, rate limiting, proxy Qwen).

### 2. E2E (Playwright)
O arquivo `VerifyMIV.spec.js` automatiza o browser (WebKit, Firefox, Chromium). Ele acessa a tela, efetua login com credenciais de QA, verifica as navegações das abas, injeta "Inputs" nos file uploaders (testando importações `.json`), apaga chats fake e testa logout.
*Prova de Efetividade:* Testes manuais do M01-M12 foram completamente robotizados pelo subagent em vídeos estritos captos em artefatos anteriores da governaça.

### 3. Acessibilidade (Axe-Core)
Garante padrões WCAG. Contrastes estritos de cores (Dark Glassmorphism testado pra evitar letras invisíveis para baixa visão).

---

## 📦 Massas de Teste (Assets QA)

Os QAs possuem na pasta de documentação os assets de teste.
- O Payload de *Mock* `mkp-backup-miv-scraping.json` simula exatas 935 linhas massivas de scrapping do ML para atestar o estresse de interface (`c:\Users\Rafael Feltrim\Documents\mkp-manager\_ai_docs\webscraping-manual-made-in-vale-mercado-livre.txt`).

*(Documentação Gherkin escrita na pasta de features do QA).*
