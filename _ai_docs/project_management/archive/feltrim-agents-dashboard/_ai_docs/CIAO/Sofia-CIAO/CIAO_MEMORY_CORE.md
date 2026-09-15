# 🧠 CIAO CORE MEMORY (Registro Permanente de Decisões)

> **AVISO DO SISTEMA:** Este documento atua como o Hipocampo Virtual da Persona 8 (CIAO). Nele, guardo o "Estado da Arte", as diretrizes irrefutáveis e o histórico de VETOS ou APROVAÇÕES na Infraestrutura. O modelo AI deve SEMPRE carregar este arquivo ao entrar em "Modo C-Level".

---

## 🏛️ ESTADO ATUAL DO SQUAD (Status Global: "Green Light")

- **Data da Última Sincronização:** 2026-03-08
- **Versão do Projeto:** V5.0 Masterclass
- **Percentual de Entrega:** ~97%
- **Fase de Combate Atual:** Sprint 7.5 (Stabilization & Security Hardening) — **CONCLUÍDA** (14/18 stories). Próxima: Sprint 8 (IA Cost Optimization + Scraper Recovery).
- **Hard Blockers:** Sprints 5 e 6 permanecem "🧊 FROZEN" (Dependem estritamente do Titular fornecer chaves API Master MIV/Magalu/Amazon e Listas EAN).

---

## 🛡️ DECISÕES ARQUITETURAIS C-LEVEL (CIAO)

### 1. Injeção RLS (Row Level Security) - Supabase
- **Contexto:** A tabela `scrape_results` e `products` estavam operando sem proteção hermética no servidor.
- **Veredito CIAO:** `APROVADO`.
- **Ação Executada:** Script `supabase_debt_mitigation_c.sql` executado no Painel da Nuvem (SQL Editor).
- **Protocolo de Segurança Ativo:** Conforme diretriz C-Level, NENHUM SCRIPT RODA SEM BACKUP ANTES. Uma cópia lógica completa via "Database Copy" é obrigatória antes da Injeção SQL.

### 2. Indexes GIN para Inteligência Artificial
- **Contexto:** A Qwen IA retorna Gaps profundos em formato JSONB nas colunas `content`. O Supabase faria "Table Scans" (lentidão massiva) sem indexação reversa (`GIN Indexes`).
- **Veredito CIAO:** `APROVADO`. (Faz parte do mesmo script de mitigação acima).

### 3. Pipeline Vercel e Variáveis de Ambiente
- **Contexto:** Para o Deploy contínuo do Github funcionar (Playwright testar em Prod real), precisamos integrar chaves (Supabase URL, Qwen Key, Anon Key) dentro dos "Project Settings" da Vercel.
- **Veredito CIAO:** `CRÍTICO/PRIORIDADE MAXIMA`. Um código lindo cai se a nuvem fechar a porta.

### 4. Sprint 7.5 — Security Hardening Batch (2026-03-07)
- **Contexto:** Peterson (SE) realizou auditoria exaustiva e encontrou 8 vulnerabilidades + 10 dívidas de arquitetura + 6 features faltantes. Sprint 7.5 executou as 14 correções sem blocker externo.
- **Veredito CIAO:** `APROVADO COM LOUVOR`.
- **Ações Executadas:**
  - 7 chaves/credenciais hardcoded removidas (test_qwen, fixAuth, importar_miv, callQwen, supabase.js)
  - Proxy Qwen server-side (`POST /api/ai/generate`) — API key nunca exposta no client
  - Rate limiting Express (scrapeLimiter 10/min, aiLimiter 20/min)
  - HMAC signature verification no webhook ML
  - RLS `store_credentials` com 4 policies por `auth.uid()`
  - Proxy morto Gemini removido do `vite.config.js`
  - Validação de schema no Import JSON
  - 3 bugs corrigidos (B1 Magazine Luiza, B2 URL UNV ML, B3 banner demo)
- **Resultado:** 53/53 testes passando, zero regressão. `express-rate-limit` adicionado às dependências.

### 4. Motor Backend "Gap Intelligence" (Story 7.6)
- **Contexto:** A UI do aplicativo está pronta para chamar APIs, mas o cérebro puramente Backend que analisa estoques contra Marketplaces não possui a lógica analítica completa para as regras 2026.
- **Veredito CIAO:** Segundo Passo Lógico após garantir a Nuvem segura.

### 5. Relatório Executivo Tri-Dimensional (2026-03-08)
- **Contexto:** Análise consolidada de 3 vetores estratégicos: (a) Custo-Benefício de APIs de IA 2026, (b) Blockers de Scraping (conversa com Douglas Feltrim), (c) Gateway PIX e fricção cambial brasileira.
- **Veredito CIAO:**
  - `APROVADO — EXECUÇÃO IMEDIATA`: Otimização de custo IA (R1+R2+R3 = economia de 78-85%)
  - `APROVADO COM RESSALVA`: Scraping dual-track (stealth patch + migração API oficial)
  - `ADIADO`: Gateway PIX (revisão em Sprint 12)
- **Documento:** `RELATORIO_EXECUTIVO_CIAO_2026-03-08.md`

### 6. Sprint 8 — IA Cost Optimization (R1+R2+R3+R5) (2026-03-08)
- **Contexto:** Implementação das 4 primeiras ações do roadmap Sprint 8, conforme aprovação da Decisão #5. Criado módulo centralizado `ai-provider.js` com multi-provider (DeepSeek V3 primário, Qwen fallback), cache LRU server-side (500 entradas, TTL 24h), roteamento por complexidade (lite/premium), e mock mode para dev.
- **Veredito CIAO:** `IMPLEMENTADO COM SUCESSO`.
- **Ações Executadas:**
  - Criado `src/server/ai-provider.js` (160 linhas) — cérebro central da IA
  - Reescrito `POST /api/ai/generate` em `scraper-api.js` — delega ao ai-provider
  - Novo endpoint `GET /api/ai/stats` — monitoramento do cache
  - Migrado `ai-gap-engine.js` de OpenAI SDK direto para `chatCompletion()`
  - Frontend `callQwen.js` aceita 3º parâmetro `mode` para roteamento
  - `ContentHub.jsx` e `Optimizer.jsx` passam `mode` correto (title→lite, gaps→premium)
- **Economia projetada:** ~87% (de ~$56/mês para ~$7/mês em 10M tokens)
- **Backward compatibility:** 100% — sem `DEEPSEEK_API_KEY`, funciona igual à Sprint 7.5
- **Resultado:** 53/53 testes passando, 138 módulos compilados, zero regressão.
- **Documento:** `SPRINT8_CHANGELOG_IA_OPTIMIZATION.md`

---

## 🚀 ROADMAP DE ATAQUE (AÇÃO NAVEGADOR)

Com a **"Luz Verde" recebida em 04/03/2026**, as ordens executadas pelo CIAO são as seguintes (Em Ordem Cronológica Intransponível):

1. **AÇÃO BROWSER 1 (SUPABASE):** O CIAO assumirá o controle do Navegador (Browser Automation do Usuário) para logar no `supabase.com/dashboard/`, navegar até o Projeto MKP Flow, abrir o SQL Editor, injetar o `supabase_debt_mitigation_c.sql` e executá-lo. *Sucesso = Segurança de Dados de Nível de Estado.*
2. **AÇÃO BROWSER 2 (VERCEL):** O CIAO manterá o controle do Navegador navegando para `vercel.com`, puxando as Variáveis de Ambiente Críticas e colando-as para destravar o Pipeline E2E.
3. **AÇÃO CÓDIGO (BACKEND IA):** Limpas as fundações da infra, todos os agentes voltam pro VSCode para codificar a API "Gap Intelligence" de Arbitragem Cross-Company (Story 7.6).
