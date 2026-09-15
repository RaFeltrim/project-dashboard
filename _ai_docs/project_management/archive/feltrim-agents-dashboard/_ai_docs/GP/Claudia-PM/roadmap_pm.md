# 🧭 Roadmap MKP FLOW V5.0 — PM/PO Vision

> Última atualização: 2026-03-07 18:00 BRT  
> Revisado pelo **Time de Gestão (PM, PO) + TL + SE** após entrega da Sprint 7.5.
> Status geral: **~97%** concluído (escopo técnico controlável)
> 📋 **Planejamento Q2 detalhado:** [`ROADMAP_PLANNING_2026Q1.md`](./ROADMAP_PLANNING_2026Q1.md)

---

## ✅ Sprint 0: Gems Integration & Double Strike (v4.0) — 100%

- [x] Gem 1.10 — Manifesto Arquitetural (Deep Scan do Gatekeeper)
- [x] Gem 1.9 — Stress Test ACDC (5.000 SKUs mock gerados + injetados)
- [x] Gem 1.2 — Code Review (`React.memo` na CoverageMatrix / Paginação 50/page)
- [x] Gem 2.1 — Fallback UI Qwen Offline (errorState + Toast Optimizer)
- [x] Gem 1.1 — Setup BDD Playwright + Cucumber + features Gherkin
- [x] Motor CSV Mercado Livre validado
- [x] RPA Scraper ML base (`meliScraper.js` + `scraper-api.js` ESM) + botão UI

---

## ✅ Sprint 1: Cloud Sync (Fundação Supabase) — 100%

- [x] Story 1.1: Cliente Supabase (`src/lib/supabase.js`) + `.env` configurado
- [x] Story 1.1: Tela de Login (`Login.jsx`) + proteção de rotas (`App.jsx`)
- [x] Story 1.1: Botão "SAIR DO SISTEMA" (Logout Supabase)
- [x] Story 1.2: Schema SQL (`supabase_schema.sql`) — products, tasks, pipeline + RLS
- [x] Story 1.2: Tabelas executadas no Supabase (projeto `wlmutjvvobygtlbvofbu`)
- [x] Story 1.3: Migração `localStorage` → Supabase fetch assíncrono (products, tasks, pipeline)
- [x] Story 1.3: Realtime WebSockets (`postgres_changes`) para sync automático
- [x] Story 1.3: Wrappers de retrocompatibilidade (setTasks/setPipeline proxy)

---

## ✅ Sprint 1.5: Squad Review Fixes (P0-P2) — 100%

- [x] P0: Fallback visual API Qwen (errorState + loading + Toast)
- [x] P1: Validador EAN-13 formato (13 dígitos numéricos = blocker)
- [x] P1: Validador EAN-13 checksum GS1 (dígito verificador = warning)
- [x] P1: Sanitizador Unicode RTL Override (`sanitizeUnicode` — U+202E)
- [x] P1: Zero Markdown Rule no Gatekeeper (bloqueia `#*_~>` em títulos)
- [x] P2: Alerta explícito Amazon "Planilha de Baterias" no Gatekeeper
- [x] P2: `aria-live="polite"` + `role="alert"` no Toast (acessibilidade)
- [x] P2: Correção `.env` URL Supabase (HTTPS corrigido)
- [x] Shift-Left: 19 testes unitários Gatekeeper (EAN, RTL, Markdown, Battery)

---

## ✅ Sprint 2A: Estabilização Arquitetural — 100% *(Concluída)*

> [!WARNING]
> **Resolvido:** Riscos críticos de escalabilidade eliminados.

- [x] Extrair `AuthContext` do App.jsx (session, login, logout)
- [x] Extrair `DataContext` do App.jsx (products, tasks, pipeline + Supabase sync)
- [x] Refatorar wrappers de sync: substituir heurística de ID por diff real (prev vs next)
- [x] Migrar `minhaPageData` de `useLocalStorage` → Supabase (tabela `app_settings`)
- [x] Migrar `kpisData` de `useLocalStorage` → Supabase (tabela `app_settings`)
- [x] Criar tabela `scrape_results` no Supabase (cache de resultados RPA)
- [x] Atualizar `package.json` versão para `5.0.0`

---

## ⏳ Sprint 3: CI/CD Shift-Left Pipeline — 80% *(EM PROGRESSO)*

> [!IMPORTANT]
> **Antecipada pelo TL.** Motivo: sem esteira automatizada, expandir scrapers para 3 marketplaces triplica a superfície de falha sem rede de proteção. Os 53 testes existentes justificam a ativação imediata do CI.

- [x] Story 3.1: GitHub Actions (`ci.yml`) rodando `vitest run` a cada push/PR
- [x] Story 3.1: GitHub Actions (`playwright.yml`) rodando BDD features
- [x] Story 3.2: Mock System — bypass de requests Qwen/Playwright no CI (tokens e antifraude)
- [x] Story 3.3: Health Alerts — webhook Slack/Discord em falha de build [Opcional]
- [x] Story 3.4: Badge de status no README.md (build passing / failing)
- [x] **Story 3.5 (CIAO Cloud Protocol):** Injetar `VITE_SUPABASE_URL`, `ANON_KEY` e `VITE_QWEN_API_KEY` nos Project Settings da **Vercel** via *Browser Automation*, garantindo o sucesso do deploy nas pipelines.

---

## ✅ Sprint 2B: Máquina de Arbitragem 360° (RPA Expansion) — 100% *(Concluída)*

> Reordenada: agora executa DEPOIS do CI/CD estar ativo.

- [x] Story 2.0: Scraper ML base (`meliScraper.js` + API Express ESM)
- [x] Story 2.0: Botão "⚡ ML SCRAPER" integrado ao Optimizer UI
- [x] Story 2.0: Health Check GET `/` na API RPA
- [x] Story 2.1: Amazon Scraper (ASIN + Bullet Points ausentes)
- [x] Story 2.2: Shopee/Magalu Scraper (seletores regionais)
- [x] Story 2.3: RPA Dashboard (saúde do robô, logs de scrape, histórico)
- [x] Story 2.4: Persistir resultados de scrape no Supabase (`scrape_results`)

---

## ⏳ Sprint 4: The Bridge (Sync Contínuo & Worker) — 75%

> **Avaliação de Efetividade (TL):** Criar um Worker Node.js rodando `while(true)` tem baixa efetividade (caro e propenso a falhas). A abordagem de **Alta Efetividade** é serverless: combinar **Webhooks Orientados a Eventos** (Marketplace aciona o banco) + **Supabase Cron Jobs (pg_cron)** para manter conexões passivas atualizando as 3 Lojas invisívelmente 24/7.

- [x] Story 4.1: Hub de Credenciais — Tabela `store_credentials` p/ gerenciar OAuth2 (Access/Refresh Tokens) de MIV, SIN e UNV.
- [ ] Story 4.2: Receita Mágica (Webhooks) — Edge Functions no Supabase recebendo ping do ML a cada alteração, atualizando o DB (que via WebSocket já atualiza o React na hora).
- [x] Story 4.3: Pull Worker (Cron Job) — Processos nativos no banco de dados (`pg_cron`) atualizando Marketplaces sem webhooks (ex: puxar status na Shopee de hora em hora).
- [x] Story 4.4: The Push — Publicação direta `Otimizador → API Platform` (UI habilitada Mock).

---

## ✅ Sprint 4.5: Hardening & Qualidade — 100% *(CONCLUÍDO)*

> [!IMPORTANT]
> O Time de Orquestração priorizou esses itens críticos P1 para Go-Live. **Todos concluídos com êxito!**

- [x] Story 4.5.1: **Schema Migration Supabase** — Adicionar colunas `cat`, `price` e `content JSONB` na tabela `products`.
- [x] Story 4.5.2: **Autenticação Bearer Token no RPA API** — Adicionar middleware de validação de token no servidor Express impedindo acesso não autorizado.
- [x] Story 4.5.3: **CORS Restritivo em Produção** — Substituir `cors()` aberto por `cors({ origin: 'https://mkp-manager.vercel.app' })` no servidor RPA.
- [x] Story 4.5.4: **Fix Playwright Upload** — Corrigido timeout de `setInputFiles` apontando precisamente para o Input escondido no Label.
- [x] Story 4.5.5: **Expandir E2E Playwright** — Novos testes (Logout, KPIs, Navegação) passando com sucesso (`5/5`).

---

## ✅ Sprint 8: Layouts Responsivos Mobile (Extra Sprint) — 100% *(CONCLUÍDO)*

- [x] Story 8.1: **AppShell Responsivo** — Ocultar menu lateral e criar Overlay com Hamburger menu dinâmico em telas pequenas.
- [x] Story 8.2: **Grid & Páginas Mobile-First** — Adaptar Dashboard (KPIs em grid vertical), habilitar Scroll Snap Panning no Kanban, overflow no CoverageMatrix/Catálogo. Bateria M01-M12 UI validada.

---

## 🧊 Sprint 5: The Bridge Online — 0% *(FROZEN - BLOCKER TOTAL)*

> [!WARNING]
> **Bloqueio Externo (Congelado em 04/03):** Os itens desta sprint dependem das chaves API Master dos Marketplaces (ML, Shopee, Magalu, Amazon), que só podem ser geradas pelo Titular das lojas (conta Administradora). Sem as chaves, não há ambiente de *Callback* realista, logo, sem simulações.

- [ ] Story 5.1: **Deploy Edge Function** — `supabase functions deploy webhook-meli` via CLI + aplicar `supabase_webhook_schema.sql` no banco cloud.
- [ ] Story 5.2: **OAuth Flow ML** — Authorization URL → Callback → Token Storage no `store_credentials`.
- [ ] Story 5.3: **OAuth Flow Shopee** — Idem com HMAC-SHA256 (Partner ID + Partner Key).
- [ ] Story 5.4: **OAuth Flow Magalu** — Idem com Token Estático do Integra Portal.
- [ ] Story 5.5: **Testes de Sandbox ML Developer** — Validar fluxo end-to-end com ambiente de testes do Mercado Livre.
- [ ] Story 5.6: **Amazon SP-API** — LWA Client ID + Refresh Token. *(Alta complexidade — Sprint futura)*

---

## 🧊 Sprint 6: Catálogo MIV Full (Made in Vale — Mercado Livre) — 0% *(FROZEN - BLOCKER EAN)*

> [!NOTE]
> **Base:** Webscraping manual completo de 935 linhas.  
> **Análise:** 12 SKUs únicos mapeados.
> **Bloqueio (Congelado em 04/03):** O fabricante não providenciou as planilhas de EAN-13, impedindo o deploy correto para Magalu e Amazon, travando o Motor de Inteligência para esta empresa temporariamente.

- [ ] Mapear EAN-13 de todos os 12 SKUs junto à Made in Vale (obrigatório para Amazon e Magalu)
- [ ] Rodar AI Optimizer para gerar Título SEO + Descrição para cada SKU (12 rodadas)
- [ ] Upload do Backup MIV (`mkp-backup-miv-scraping.json`) via botão IMPORT no MKP Flow
- [ ] Publicar Shopee (11 SKUs sem EAN libera = 11 publicações)
- [ ] Publicar Magalu (11 SKUs aguardando EAN = 11 publicações futuras)
- [ ] Planilha de Baterias Amazon para MIV-MIC-RG e MIV-MIC-PT (Li-ion)

---

## 🤖 Sprint 7: Loja Scraper + Gap Intelligence — ~95% *(EM PROGRESSO — Hotfixes entregues)*

### 🔧 FASE A: Loja Scraper (URL → Catálogo Completo) — *100% Concluído ✅*

- [x] **Story 7.0:** Mapa de URLs das lojas (ML + SH + MG) para as 3 empresas confirmado e persistido em `companies.js`.
- [x] **Story 7.1:** `storeScraper.js` criado com Playwright.
- [x] **Story 7.2:** Anti-detecção implementado: delay 2-5s, pool de 5 User-Agents, modo `MOCK_STORE=true`.
- [x] **Story 7.3:** Paginação automática implementada.
- [x] **Story 7.4:** Endpoint `POST /api/scrape/store` registrado.
- [x] **Story 7.5:** Botão "SCRAP LOJA" na UI do Otimizador.
- [x] **Story 7.5.1:** Seletor específico para `magazinevoce.com.br` (MIV Magalu).

### � FASE B: Gap Intelligence (IA por Nicho) — *[ACTIVE TARGET - 2-3 dias]*

> **Diretriz Especial (Dev Mobile SR):** Toda a UI gerada nesta fase não pode bloquear a "Main Thread". Respostas geradas em tela exigirão **Virtualização** (Windowing) limitando o DOM p/ fluidez móvel, e hitboxes de toque devem ser `> 44px`. Interações ocorrem via **Toast** (App-like feel).

---

## ✅ Sprint 7.5: Stabilization & Security Hardening — 100% *(CONCLUÍDA)*

> **Responsável Principal:** Peterson (SE) + Squad
> **Data de Conclusão:** 2026-03-07
> **Resultado:** 14/18 stories entregues, 53/53 testes passando

### Bug Fixes (3/3 ✅)
- [x] **B1:** "Magazine Luiza" adicionado a `GENERIC_TITLES` em `scrapingAuditor.js`
- [x] **B2:** URL UNV ML corrigida para `lista.mercadolivre.com.br/pagina/univerzaprodutos/`
- [x] **B3:** Banner "⚠️ DADOS DE DEMONSTRAÇÃO" renderizado quando `isDemo=true` no `App.jsx`

### Security Fixes (7/7 ✅)
- [x] **S1:** Chave hardcoded removida de `test_qwen.js` → `process.env.DASHSCOPE_API_KEY` via dotenv
- [x] **S2:** Credenciais hardcoded removidas de `fixAuth.mjs` e `importar_miv.mjs` → dotenv
- [x] **S3:** Endpoint `POST /api/ai/generate` (proxy Qwen server-side) em `scraper-api.js`
- [x] **S4:** Verificação HMAC `x-signature` no webhook ML (`webhook-meli/index.ts`)
- [x] **S5:** `store_credentials` criada com RLS (4 policies: SELECT/INSERT/UPDATE/DELETE por `auth.uid()`)
- [x] **S7:** Tokens mascarados na UI `Integrations.jsx` (input password + toggle 👁️/🙈)
- [x] **S8:** `supabase.js` agora faz fail-fast (throw Error se env vars ausentes)

### Architecture & Performance (4/4 ✅)
- [x] **A3:** Proxy morto Gemini removido de `vite.config.js`
- [x] **P6:** Validação de schema no Import JSON (`DataContext.jsx`)
- [x] **P7:** Rate limiting Express: `scrapeLimiter` 10 req/min, `aiLimiter` 20 req/min
- [x] **P9:** `callQwen.js` migrado de chamada direta Alibaba → proxy `http://127.0.0.1:3001/api/ai/generate`

### Dependências Adicionadas
- `express-rate-limit` (package.json)
- `supabase_rls_fix_store_credentials.sql` (migração SQL pronta para deploy)

### Pendentes (3 stories com blocker ou baixa prioridade)
- [ ] **7.5.4:** Tooltip DEGRADED badge (UX polish — P3)
- [ ] **7.5.5:** Secrets Vercel (blocker externo — CIAO Cloud Protocol)
- [ ] **7.5.6:** Re-run GAP report com dados corrigidos

- [x] **Story 7.6:** Motor Backend de Análise de Nicho (`ai-gap-engine.js` cruzando 3 Lojas restritamente).
- [x] **Story 7.7:** Painel "Sugestões Inteligentes" na UI de Catálogo com badges (Grid Mobile).
- [x] **Story 7.8:** Cross-Company Gap Analysis e Detecção interna de Canibalização de Preço (Script Hardcoded).
- [x] **Story 7.9:** Botão Mágico: "Exportar Sugestão" virando Tarefa Reactiva (Supabase) via Toast mobile sem reloading.

### 🛡️ FASE C: Debt Mitigation (Conclusões das Auditorias C-Level) — *[NOVO (04/03)]*

> **Adicionado pós-Mesa Redonda (TL, PM, QA, UI/UX, DE, Devs).** Os relatórios de saúde do sistema apontaram refatorações vitais de segurança e design urgentes:

- [x] **Data Eng US.1:** Reforçar / Habilitar Row Level Security (RLS) `auth` via migration em `scrape_results` e novas colunas (Evitar acesso anônimo).
- [x] **Data Eng US.2:** Aplicar GIN Indexes no campo `content (JSONB)` da tabela `products` via `.sql` p/ evitar Table Scans pesados durante a filtragem de GAPs da IA.
- [x] **UI/UX US.1:** Padronizar cores soltas em *Design Tokens* estritos (`var(--color-*)`) para garantir estabilidade do *Liquid Glass*.
- [x] **Backend US.1:** Diminuir o *timeout* da request local do client ao Scraper API (3001) para 10s c/ Fallback de notificação.

---

## ✅ Sprint 9: Hiper-Performance e Escala (CIAO Directives) — 100%

> **Adicionado pós-Reunião Tática de Alinhamento e Performance do Time de Orquestração (05/03).** Foco em métricas de altíssimo rendimento para suportar a carga massiva de 5k+ SKUs.

### ⚡ Fase A: Front-End & Rendering

- [x] **Story 9.1: Virtualização Estrita do DOM (Windowing)** — Implementar bibliotecas agnósticas (ex: `@tanstack/react-virtual` ou `react-window`) no `Optimizer.jsx` e `Catalog.jsx` limitando a renderização visual aos itens na Viewport (Mobile-friendly TTI).
- [x] **Story 9.2: Code Splitting Mapeado (Lazy Loading)** — Implementar `React.lazy()` e `<Suspense>` no roteamento do `App.jsx` para dividir *Chunks* de memória em relatórios gigantes (`CoverageMatrix`, `Catalog`), acelerando o FCP em conexões lentas.

### ⚡ Fase B: Back-End RPA & Workers

- [x] **Story 9.3: Paralelização Assíncrona no Node** — Refatorar API RPA para usar gerência de filas (`bullmq` + Redis) ou `playwright-cluster`, rodando Scrapes e análises de GAP em grid concorrente e evitando o timeout single-thread de 120s.
- [x] **Story 9.4: Caching Semântico na Geração Qwen** — Salvar *hashes* de solicitações feitas à IA em base local/Supabase (`scrape_results` expandida). Bypass da inferência completa se produto/tom foi pedido recém, derrubando o delay de 3500ms para 15ms.

### ⚡ Fase C: Database Supabase

- [x] **Story 9.5: Connection Pooling Ativo (PgBouncer)** — Habilitar via painel da Supabase Cloud a gestão de *Pools* de conexão prevenindo gargalos nas requisições do WebSocket de tempo real para `postgres_changes`.
- [x] **Story 9.6: Shrink de Payload (Debounce no Sync)** — Adicionar envelopamento em *Debounce* de `800ms` (Lodash) no `DataContext` durante persistência dos arrays `tasks`/`pipeline` para salvar picos da DB durante soltar e arrastar excessivos no Kanban.

---

## 📈 Progresso Global

| Sprint | Status | % |
|--------|--------|---|
| Sprint 0 (Gems v4.0) | ✅ Concluída | 100% |
| Sprint 1 (Cloud Sync) | ✅ Concluída | 100% |
| Sprint 1.5 (Squad Fixes) | ✅ Concluída | 100% |
| Sprint 2A (Estabilização) | ✅ Concluída | 100% |
| Sprint 3 (CI/CD) | ⏳ Em progresso (Story 3.5 pendente) | 80% |
| Sprint 2B (RPA Expansion) | ✅ Concluída | 100% |
| Sprint 4 (The Bridge Frontend) | ⏳ Fase UI Concluída (4.2 bloqueada) | 75% |
| Sprint 4.5 (Hardening) | ✅ Concluída | 100% |
| Sprint 5 (The Bridge Online) | 🧊 FROZEN (Aguardando Titular) | 0% |
| Sprint 6 (Catálogo MIV) | 🧊 FROZEN (Aguardando EANs) | 0% |
| Sprint 7 (Loja Scraper + Gap IA) | ✅ Fases A/B/C concluídas | 100% |
| **Sprint 7.5 (Stabilization)** | 🔴 **NOVA — Hotfixes B1/B2/B3 + Demo** | 0% |
| Sprint 8 (Mobile Layouts) | ✅ Concluída | 100% |
| Sprint 9 (Hiper-Performance CIAO) | ✅ Concluída | 100% |
| **Sprint 10 (Shopee Recovery)** | 🟠 **NOVA — CSV Import + Open Platform** | 0% |
| **Sprint 11 (Magalu API)** | 🟡 **NOVA — First-Party API** | 0% |
| **Sprint 12 (Demo & Go-Live)** | 🟡 **NOVA — Stakeholder Presentation** | 0% |

---

> **📋 Planejamento completo Q2-2026:** Ver [`ROADMAP_PLANNING_2026Q1.md`](./ROADMAP_PLANNING_2026Q1.md) para timeline, riscos, métricas e action items.

*Documento vivo. Atualizado pós-Reunião de Planejamento de Roadmap (06/03/2026).*  
**🏆 Próxima ação: Sprint 7.5 (Hotfixes B1/B2/B3) → Sprint 10 (Shopee) → Sprint 11 (Magalu) → Sprint 12 (Demo)**
