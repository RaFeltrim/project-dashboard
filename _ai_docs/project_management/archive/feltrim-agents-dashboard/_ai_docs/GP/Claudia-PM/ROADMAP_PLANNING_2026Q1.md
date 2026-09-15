# 🗺️ Reunião de Planejamento de Roadmap — Q1/Q2 2026

> **Data:** 2026-03-06  
> **Participantes:** Claudia (PM), Marlon (PO), Beatriz (TL)  
> **Formato:** Revisão de Status + Planejamento Tático Q2  
> **Referência:** Resultados da Reunião de Visualização (05/03) + GAP_ANALYSIS_REPORT.md  

---

## 1. 📊 PAINEL DE STATUS CONSOLIDADO (AS-IS)

### Sprints Concluídas ✅
| Sprint | Nome | Status | Observações |
|--------|------|--------|-------------|
| 0 | Gems Integration & Double Strike (v4.0) | **100%** ✅ | Motor CSV ML, RPA base, BDD setup |
| 1 | Cloud Sync (Fundação Supabase) | **100%** ✅ | Auth, Schema, Realtime, Migrations |
| 1.5 | Squad Review Fixes (P0-P2) | **100%** ✅ | EAN-13, RTL, Markdown, Acessibilidade |
| 2A | Estabilização Arquitetural | **100%** ✅ | Contexts, Supabase sync, scrape_results |
| 2B | Máquina de Arbitragem 360° (RPA) | **100%** ✅ | 4 scrapers, Dashboard RPA, Persistência |
| 4.5 | Hardening & Qualidade | **100%** ✅ | Bearer Token, CORS, E2E expandido |
| 8 | Layouts Responsivos Mobile | **100%** ✅ | AppShell, Grid Mobile-First |
| 9 | Hiper-Performance CIAO | **100%** ✅ | Windowing, Code Splitting, Cluster, Caching |

### Sprints Em Progresso ⏳
| Sprint | Nome | Status | Blocker |
|--------|------|--------|---------|
| 3 | CI/CD Shift-Left Pipeline | **80%** | Story 3.5 (CIAO Cloud Protocol — injeção de secrets Vercel) pendente |
| 4 | The Bridge (Sync Contínuo) | **75%** | Story 4.2 (Webhooks ML) depende de chaves API |
| 7 | Loja Scraper + Gap Intelligence | **~95%** | Fase A ✅, Fase B ✅, Fase C ✅, **Hotfixes B1/B2/B3 ✅** |
| 7.5 | Stabilization & Security Hardening | **100%** ✅ | 14 entregas: bugs, segurança, rate limiting, RLS, proxy Qwen |

### Sprints Congeladas 🧊
| Sprint | Nome | Status | Blocker Externo |
|--------|------|--------|-----------------|
| 5 | The Bridge Online | **0%** | Chaves API Master dos Marketplaces (titular da conta) |
| 6 | Catálogo MIV Full | **0%** | Planilhas EAN-13 do fabricante Made in Vale |

---

## 2. 🗣️ DISCUSSÃO — CLAUDIA (PM)

**Claudia:** Vamos ao que interessa. Olhando o painel consolidado, estamos em **~95% do escopo técnico controlável**. Temos 8 sprints fechadas, 3 em progresso e 2 congeladas por **blockers externos** fora do nosso controle. 

O que mudou desde a última reunião tática:

1. **Sprint 7 Fase C (Debt Mitigation)** — Concluída com sucesso. Os P0 da auditoria anti-bot foram implementados: cascade selectors Magalu, ScrapingAuditor, Poisson delays, remoção do playwright-extra morto.

2. **Bugs Novos Descobertos na Visualização (05/03):**
   - **B1 (Severidade Alta):** Title fallback no deep scrape retorna "Magazine Luiza" em vez do nome real do produto → SIN Magalu DEGRADED 100%
   - **B2 (Severidade Média):** URL da UNV no ML está incorreta em `run_scraping_job.mjs` → 0 produtos
   - **B3 (Severidade Baixa):** 27 produtos mock em `products.js` carregam sem banner "DEMONSTRAÇÃO"

3. **Shopee Totalmente Bloqueada (0/3 lojas):** Cloudflare Bot Management impede até o carregamento da SPA. A pesquisa profunda confirmou que scraping não é viável aqui sem proxy residencial pago ou API oficial.

**Minha recomendação:** Antes de avançar para novas features, precisamos de uma **Sprint 7.5 "Stabilization & Demo Readiness"** para:
- Zerar os bugs B1/B2/B3
- Definir a estratégia oficial para Shopee (CSV Import ou API)
- Preparar o produto para demonstração ao stakeholder (Raiad)

---

## 3. 🗣️ DISCUSSÃO — MARLON (PO)

**Marlon:** Concordo com a Claudia na sprint de estabilização, mas quero trazer a perspectiva de **valor de negócio** para priorizar o Q2.

### Análise de Valor por Blocker:

| Blocker | Impacto no Negócio | Probabilidade de Desbloqueio Q2 | Ação |
|---------|--------------------|---------------------------------|------|
| Chaves API (Sprint 5) | **Altíssimo** — sem APIs, sem publicação automática | **Média** — depende do titular | Escalar cobrança com plano B (CSV manual) |
| EAN-13 MIV (Sprint 6) | **Alto** — trava Magalu e Amazon para MIV | **Baixa** — fabricante sem resposta | Publicar sem EAN onde possível (Shopee, ML) |
| Shopee Bloqueada | **Alto** — 33% do market share perdido | **Alta** — CSV Import é factível | **P1 Prioritário**: Motor CSV Shopee |

### Business Value Stack-Rank para Q2:

1. **🔴 P0 — Hotfixes B1 + B2** (Esforço: 1 dia)
   - Sem isso, o relatório GAP não tem credibilidade para apresentação
   - SIN Magalu DEGRADED 100% = dados inúteis para decisão

2. **🟠 P1 — Motor CSV Shopee Import** (Esforço: 3-4 dias)
   - Desbloqueio imediato da Shopee sem depender do scraping
   - Seller Center da Shopee permite exportar CSV gratuitamente
   - ROI: recupera 33% da cobertura de marketplace

3. **🟠 P1 — Shopee Open Platform API** (Esforço: 5-8 dias)
   - Gratuita (HMAC-SHA256, Partner ID + Partner Key)
   - Automação real: listar produtos, atualizar preços, verificar estoque
   - **Pré-requisito:** Partner Account aprovada (2-5 dias úteis de review)

4. **🟡 P2 — Magalu Devs API** (Esforço: 4-6 dias)
   - API gratuita (OAuth2 via Magalu ID CLI)
   - Elimina o risco do Bug B1 (títulos "Magazine Luiza") permanentemente
   - Dados primários: catálogo real, preços, estoque

5. **🟡 P2 — Demo Readiness (B3 + Tooltips)** (Esforço: 1-2 dias)
   - Banner "DADOS DE DEMONSTRAÇÃO" quando `products.js` mock ativo
   - Tooltip no badge DEGRADED com detalhes
   - Polimento visual para stakeholder review

6. **🔵 P3 — The Bridge Online (Sprint 5)** (Esforço: 15+ dias)
   - Depende inteiramente de chaves API — **não é acionável pelo time**
   - Ação: criar "Ready-Check Template" para que o titular saiba exatamente quais credenciais gerar

7. **🔵 P3 — Catálogo MIV Full (Sprint 6)** (Esforço: 3 dias após desbloqueio)
   - Depende de EAN-13 — **não é acionável pelo time**
   - Ação: enviar checklist formal para a Made in Vale com deadline

---

## 4. 🗣️ DISCUSSÃO — BEATRIZ (TL)

**Beatriz:** Vou trazer a visão técnica e os riscos de engenharia para cada item do stack-rank do Marlon.

### Avaliação Técnica:

#### B1 — Fix "Magazine Luiza" Deep Scrape
- **Root Cause:** `scrapeProductDetail()` no `storeScraper.js` usa `page.title()` como fallback quando nenhum seletor `h1` encontra o produto. Em Magalu, o `<title>` da aba é literalmente "Magazine Luiza".
- **Fix:** Rejeitar título se `.includes('Magazine Luiza')` ou `.includes('Magalu')`. Manter título original da listagem (já extraído no index scrape).
- **Risco:** Baixo. Mudança pontual, coberta por teste unitário.
- **Estimativa:** 1-2h

#### B2 — Fix URL UNV ML
- **Root Cause:** `run_scraping_job.mjs` linha 9 usa `/pagina/univerzaprodutos` enquanto `companies.js` tem `/vendedor/univerzaprodutos/anuncios`. A URL correta é a do `companies.js`.
- **Fix:** Trocar a URL. Uma linha.
- **Risco:** Zero.
- **Estimativa:** 5min

#### Motor CSV Shopee Import
- **Arquitetura Proposta:**
  ```
  [Seller Center Shopee] → Export CSV → Upload no MKP Flow
       ↓
  src/server/shopee-csv-parser.js  (parse, validação, normalização)
       ↓
  Merge com scrape_results existentes → persist Supabase
       ↓
  UI: Botão "IMPORTAR CSV SHOPEE" no Optimizer
  ```
- **Complexidade:** Media. O CSV da Shopee tem encoding UTF-8 BOM, separador `;`, cabeçalhos em PT-BR variáveis por versão. Precisa de parser resiliente.
- **Risco:** O formato CSV pode mudar sem aviso. Defensiva: validar headers, Toast de erro claro.
- **Estimativa:** 3-4 dias (parser + endpoint + UI + testes)

#### Shopee Open Platform API
- **Arquitetura Proposta:**
  ```
  src/server/shopee-api-client.js  (auth HMAC-SHA256, refresh tokens)
       ↓
  Edge Function ou Express endpoint
       ↓
  /api/shopee/products → GET produto list
  /api/shopee/sync    → POST atualizar preço/estoque
  ```
- **Riscos Técnicos:**
  - Tokens expiram a cada 4h → precisa de refresh automático
  - SLA da Shopee é 90% (10% de downtime aceitável) → fallback para CSV
  - Partner Account review pode demorar 2-5 dias úteis
- **Estimativa:** 5-8 dias (OAuth setup + endpoints + retry + testes)

#### Magalu Devs API
- **Arquitetura:**
  ```
  src/server/magalu-api-client.js (OAuth2 Magalu ID)
       ↓
  /api/magalu/catalog → GET catálogo real
  /api/magalu/orders  → GET vendas recentes
  ```
- **Vantagem:** Elimina scraping Magalu 100%. Dados primários, sem risco de anti-bot.
- **Risco:** OAuth flow exige redirect URI configurada no Magalu Devs Portal.
- **Estimativa:** 4-6 dias

### Análise de Dívida Técnica Atual:

| Item | Tipo | Severidade | Sprint Alvo |
|------|------|-----------|-------------|
| `page.title()` fallback Magalu | Bug | Alta | 7.5 |
| URL UNV ML incorreta | Bug | Média | 7.5 |
| 27 mocks sem banner visual | UX Debt | Baixa | 7.5 |
| `playwright-extra` removida mas `playwright-cluster` ainda importa | Tech Debt | Info | Futura |
| Story 3.5 CIAO Cloud Protocol | Incompleto | Média | 3 (fechar) |
| Story 4.2 Webhooks ML | Bloqueado | Alta | 5 (vinculada) |
| Shopee 0% cobertura scraping | Limitação | Crítica | 10 (CSV/API) |

### Proposta de Bateria de Testes Q2:

A cada sprint nova, exijo:
- **Unit tests** via Vitest para toda lógica de parser/normalização
- **Integration tests** para endpoints Express novos
- **Smoke test** manual do flow completo (CSV upload → ver no catálogo)
- **Manter 53+ testes sem regressão** (atualmente 53/53 passing)

---

## 5. 📋 ROADMAP CONSOLIDADO Q2-2026

### Sprint 7.5: Stabilization & Demo Readiness *(1 semana)*
> **Prioridade:** 🔴 CRÍTICA — Sem isso, o produto não é apresentável

| # | Story | Owner | Esforço | Status |
|---|-------|-------|---------|--------|
| 7.5.1 | **Hotfix B1:** Fix title fallback "Magazine Luiza" no deep scrape | João (Backend) | 2h | ✅ Concluído |
| 7.5.2 | **Hotfix B2:** Corrigir URL UNV ML em `run_scraping_job.mjs` | João (Backend) | 5min | ✅ Concluído |
| 7.5.3 | **Hotfix B3:** Banner "DADOS DE DEMONSTRAÇÃO" quando mock ativo | Fabio (Frontend) | 4h | ✅ Concluído |
| 7.5.4 | Tooltip DEGRADED badge com `invalidCount/total` | Fabio (Frontend) | 2h | 🟡 To-Do |
| 7.5.5 | Fechar Sprint 3 — Story 3.5 (secrets Vercel) | Camila (DevOps) | 4h | 🟡 To-Do |
| 7.5.6 | Atualizar GAP_ANALYSIS_REPORT.md com dados corrigidos (re-run) | Rafael (QA) | 2h | 🟡 To-Do |
| 7.5.7 | Teste de regressão completo (53+ testes verdes) | Rafael (QA) | 1h | ✅ Concluído (53/53) |
| 7.5.8 | **[SEC] S1:** Remover chave hardcoded `test_qwen.js` → `dotenv` | Peterson (SE) | 30min | ✅ Concluído |
| 7.5.9 | **[SEC] S2:** Remover creds hardcoded `fixAuth.mjs` / `importar_miv.mjs` | Peterson (SE) | 30min | ✅ Concluído |
| 7.5.10 | **[SEC] S3:** Proxy server-side Qwen (`POST /api/ai/generate`) | Peterson (SE) | 2h | ✅ Concluído |
| 7.5.11 | **[SEC] S4:** Verificação HMAC webhook ML (`x-signature`) | Peterson (SE) | 1h | ✅ Concluído |
| 7.5.12 | **[SEC] S5:** RLS `store_credentials` (CREATE TABLE + 4 policies) | Peterson (SE) | 1h | ✅ Concluído |
| 7.5.13 | **[SEC] S7:** Mascarar tokens na UI Integrations (input password + 👁️) | Peterson (SE) | 1h | ✅ Concluído |
| 7.5.14 | **[SEC] S8:** Supabase client fail-fast (throw se env vars ausentes) | Peterson (SE) | 30min | ✅ Concluído |
| 7.5.15 | **[ARCH] A3:** Remover proxy morto Gemini do `vite.config.js` | Peterson (SE) | 15min | ✅ Concluído |
| 7.5.16 | **[PERF] P7:** Rate limiting Express (scrapeLimiter 10/min, aiLimiter 20/min) | Peterson (SE) | 1h | ✅ Concluído |
| 7.5.17 | **[PERF] P9:** `callQwen.js` migrado para proxy server-side | Peterson (SE) | 1h | ✅ Concluído |
| 7.5.18 | **[VALID] P6:** Validação de schema no Import JSON (`DataContext`) | Peterson (SE) | 30min | ✅ Concluído |

**Critério de Saída:** Todos os bugs B1/B2/B3 resolvidos, Sprint 3 100%, relatório GAP limpo, demo pronta.

> **✅ RESULTADO (2026-03-07):** Sprint 7.5 entregou **14 de 18 stories** (78%). Os 3 bugs (B1/B2/B3) foram corrigidos, 8 vulnerabilidades de segurança eliminadas, rate limiting ativado, proxy Qwen server-side implementado, RLS store_credentials criada. **53/53 testes passando sem regressão.** Pendentes: Story 7.5.4 (tooltip DEGRADED), 7.5.5 (secrets Vercel — blocker externo), 7.5.6 (re-run GAP report).

---

### Sprint 10: Shopee Recovery (Motor CSV + Open Platform) *(2-3 semanas)*
> **Prioridade:** 🟠 ALTA — Recupera 33% de cobertura de marketplace

| # | Story | Owner | Esforço | Deps |
|---|-------|-------|---------|------|
| 10.1 | **Parser CSV Shopee** — `/server/shopee-csv-parser.js` (UTF-8 BOM, validação de headers, normalização) | João (Backend) | 2 dias | — |
| 10.2 | **Endpoint Express** — `POST /api/import/shopee-csv` (upload multipart, parse, merge) | João (Backend) | 1 dia | 10.1 |
| 10.3 | **UI: Botão "IMPORTAR CSV SHOPEE"** no Optimizer com drag-and-drop | Fabio (Frontend) | 1 dia | 10.2 |
| 10.4 | **Testes unitários** parser CSV (encoding, headers variáveis, dados corrompidos) | Rafael (QA) | 1 dia | 10.1 |
| 10.5 | **Partner Account Shopee** — Cadastro no Open Platform + aguardar aprovação | Marlon (PO) | 2-5 dias úteis | — |
| 10.6 | **Auth Client HMAC-SHA256** — `shopee-api-client.js` (sign, timestamp, refresh) | João (Backend) | 2 dias | 10.5 |
| 10.7 | **Endpoints Shopee API** — `GET /api/shopee/products`, `POST /api/shopee/sync` | João (Backend) | 2 dias | 10.6 |
| 10.8 | **UI: Indicador de Fonte** — Badge "VIA CSV" vs "VIA API" nos resultados | Laura (UIUX) | 4h | 10.3/10.7 |
| 10.9 | **Retry + Fallback** — Se API Shopee falhar (SLA 90%), fallback para CSV cache | Aline (Arch) | 4h | 10.7 |
| 10.10 | **Testes E2E** — Flow completo CSV upload → visualizar no catálogo | Rafael (QA) | 1 dia | 10.3 |

**Critério de Saída:** Shopee 3/3 lojas com dados (via CSV ou API), testes E2E passando.

---

### Sprint 11: Magalu API First-Party *(2 semanas)*
> **Prioridade:** 🟡 MÉDIA — Elimina scraping Magalu, dados primários

| # | Story | Owner | Esforço | Deps |
|---|-------|-------|---------|------|
| 11.1 | **Cadastro Magalu Devs** — criar app, configurar redirect URI, obter Client ID | Marlon (PO) | 1 dia | — |
| 11.2 | **Auth OAuth2 Client** — `magalu-api-client.js` (Magalu ID CLI, token storage) | João (Backend) | 2 dias | 11.1 |
| 11.3 | **Endpoint Catálogo** — `GET /api/magalu/catalog` (listar produtos reais com título, preço, marca) | João (Backend) | 2 dias | 11.2 |
| 11.4 | **Endpoint Vendas** — `GET /api/magalu/orders` (vendas recentes para KPIs) | João (Backend) | 1 dia | 11.2 |
| 11.5 | **Migração Scraper → API** — `storeScraper.js` usa API Magalu quando token disponível, fallback scrape | Beatriz (TL) | 1 dia | 11.3 |
| 11.6 | **Testes unitários + integration** OAuth flow + endpoints | Rafael (QA) | 1 dia | 11.3 |
| 11.7 | **UI: Badge "VIA API"** para resultados Magalu vindos da API oficial | Laura (UIUX) | 4h | 11.5 |

**Critério de Saída:** Magalu 3/3 lojas com dados via API (sem scraping), títulos reais (zero "Magazine Luiza"), testes passando.

---

### Sprint 12: Stakeholder Demo & Go-Live Prep *(1 semana)*
> **Prioridade:** 🟡 MÉDIA — Preparação para avaliação formal do Raiad

| # | Story | Owner | Esforço |
|---|-------|-------|---------|
| 12.1 | **Demo Script** — Roteiro guiado de demonstração (baseado no Stakeholder Evaluation Guide) | Claudia (PM) | 4h |
| 12.2 | **Seed Data Curada** — Substituir 27 mocks por dados reais scrapeados/importados | Marlon (PO) + João | 4h |
| 12.3 | **Polish UI** — Micro-animações finais, loading states, empty states | Laura (UIUX) + Fabio | 2 dias |
| 12.4 | **Performance Audit** — Lighthouse + WebPageTest (LCP < 2.5s, CLS < 0.1) | Cleber (Mobile) | 4h |
| 12.5 | **Full Regression** — Executar suíte completa (unit + E2E + BDD) | Rafael (QA) | 4h |
| 12.6 | **Ready-Check Template** — Documento para o titular com TODAS as credenciais necessárias para Sprint 5 | Claudia (PM) + Marlon | 2h |
| 12.7 | **Apresentação ao Stakeholder** — Reunião demonstrativa com Raiad | Claudia (PM) | 2h |

**Critério de Saída:** Stakeholder avaliou o produto, feedback documentado, credenciais solicitadas formalmente.

---

### Sprint 5 (Reativação): The Bridge Online *(3-4 semanas — após desbloqueio)*
> **Prioridade:** 🔵 BLOQUEADA — Requer chaves API do titular

| # | Story | Deps Externas |
|---|-------|--------------|
| 5.1 | Deploy Edge Function webhook-meli | CLI Supabase + ML App ID |
| 5.2 | OAuth Flow ML (Authorization URL → Token) | ML Client ID + Secret |
| 5.3 | OAuth Flow Shopee (HMAC-SHA256) | Open Platform aprovada (Sprint 10.5) |
| 5.4 | OAuth Flow Magalu | Magalu Devs app (Sprint 11.1) |
| 5.5 | Testes Sandbox ML Developer | ML Sandbox credentials |
| 5.6 | Amazon SP-API (LWA Client) | Plano Profissional R$19/mês + LWA |

**Trigger de Reativação:** Titular entrega pelo menos 1 par de credenciais API.

---

### Sprint 6 (Reativação): Catálogo MIV Full *(1 semana — após desbloqueio)*
> **Prioridade:** 🔵 BLOQUEADA — Requer EAN-13 da MIV

| # | Story | Deps Externas |
|---|-------|--------------|
| 6.1 | Mapear EAN-13 de 12 SKUs MIV | Planilha do fabricante |
| 6.2 | Rodar AI Optimizer (12 rounds Qwen) | — |
| 6.3 | Upload backup JSON via IMPORT | — |
| 6.4 | Publicar Shopee (11 SKUs sem EAN) | Open Platform ativa |
| 6.5 | Publicar Magalu (aguardando EAN) | 6.1 |
| 6.6 | Planilha Baterias Amazon (Li-ion) | — |

**Trigger de Reativação:** MIV entrega planilha com EAN-13 dos 12 SKUs.

---

## 6. 📅 TIMELINE VISUAL Q2-2026

```
MAR 2026        ABR 2026        MAI 2026        JUN 2026
W1  W2  W3  W4  W1  W2  W3  W4  W1  W2  W3  W4  W1  W2
├───┤                                                      Sprint 7.5 (Stabilization)
    ├───────────┤                                          Sprint 10 (Shopee Recovery)
                ├───────┤                                  Sprint 11 (Magalu API)
                        ├───┤                              Sprint 12 (Demo & Go-Live)
                            ├───────────────┤              Sprint 5* (Bridge Online) *se desbloqueada
                                        ├───┤              Sprint 6* (MIV Full) *se desbloqueada
```

---

## 7. 📊 MÉTRICAS DE ACOMPANHAMENTO (KPIs do Roadmap)

| Métrica | Atual (Mar/26) | Meta Q2 | Como Medir |
|---------|---------------|---------|------------|
| Cobertura de Marketplace (dados reais) | **55%** (5/9 lojas) | **89%** (8/9) | Lojas com HEALTHY no GAP Report |
| Taxa de DEGRADED | **12.5%** (1/8 scans) | **0%** | ScrapingAuditor zero DEGRADED |
| Testes automatizados | **53** | **75+** | `npx vitest run` count |
| Sprints fechadas | **8/13** | **12/13** | Roadmap tracker |
| Bugs abertos | **3** (B1,B2,B3) | **0** | Bug tracker |
| API Integrations ativas | **0** | **2+** (Shopee + Magalu) | Endpoints funcionais |
| Shopee Coverage | **0/3** lojas | **3/3** | CSV Import ou API |
| Tempo médio scrape (8 lojas) | **~110s** | **<60s** | `run_scraping_job.mjs` timer |

---

## 8. 🚨 RISCOS E MITIGAÇÕES

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| R1 | Titular não entrega chaves API em Q2 | Alta | Crítico | Ready-Check Template (Sprint 12.6) + Plano B com CSV |
| R2 | Aprovação Shopee Open Platform recusada | Baixa | Médio | CSV Import já é o Plano A (Sprint 10.1-10.4) |
| R3 | Cloudflare aumenta proteção em ML/Magalu | Média | Alto | APIs oficiais (Sprint 10/11) como caminho primário |
| R4 | Qwen API instável ou mudança de preço | Baixa | Alto | Cache md5 já implementado + fallback offline planejado |
| R5 | Formato CSV Shopee muda sem aviso | Média | Médio | Parser defensivo com validação de headers + error Toast |
| R6 | EAN-13 MIV nunca chega | Média | Médio | Publicar onde EAN não é obrigatório (ML, Shopee) |

---

## 9. ✍️ DELIBERAÇÕES E CONSENSO

### ✅ Aprovado por unanimidade:

**Claudia (PM):**
> "Sprint 7.5 é a prioridade zero. Não apresentamos produto com dados quebrados. Depois, a sequência 10 → 11 → 12 faz sentido porque cada sprint desbloqueada alimenta a próxima. A Sprint 10 (Shopee) tem o melhor ROI — recupera 33% de cobertura com esforço factível. Vou criar o Ready-Check Template para o titular já nesta semana."

**Marlon (PO):**
> "Concordo com o stack-rank. O CSV Shopee é o desbloqueador mais rápido — é a única ação 100% dentro do nosso controle que recupera marketplace perdido. Vou iniciar o cadastro da Partner Account na Shopee Open Platform hoje mesmo para que Sprint 10.5-10.7 não esperem por mim. Para a Sprint 12, preparo dados curados reais (substituindo os 27 mocks) que comprovem valor real ao Raiad."

**Beatriz (TL):**
> "Do ponto de vista técnico, B1 e B2 são hotfixes triviais — podem entrar hoje. O CSV parser Shopee precisa de atenção no encoding (UTF-8 BOM é traição clássica) e nos headers variáveis. Vou exigir testes unitários cobrindo no mínimo 5 variações de CSV antes de dar LGTM. Para a Magalu API, o OAuth2 é straightforward mas preciso da redirect URI configurada no portal. Minha preocupação maior é timing: se Sprint 5 não desbloquear em Q2, precisamos de um **Plano B de publicação semi-automatizado** (geração de planilhas prontas para upload manual nos portais)."

### 📌 Action Items Imediatos (Próximos 3 dias):

| # | Ação | Responsável | Deadline |
|---|------|-------------|----------|
| 1 | Implementar Hotfix B1 (title fallback Magalu) | João (Backend) | 06/03 |
| 2 | Implementar Hotfix B2 (URL UNV ML) | João (Backend) | 06/03 |
| 3 | Re-executar `run_scraping_job.mjs` e validar relatório GAP limpo | Rafael (QA) | 06/03 |
| 4 | Iniciar cadastro Shopee Open Platform Partner Account | Marlon (PO) | 07/03 |
| 5 | Criar branch `feat/shopee-csv-import` e skeleton do parser | João (Backend) | 08/03 |
| 6 | Preparar Ready-Check Template para titular (credenciais Sprint 5) | Claudia (PM) | 08/03 |
| 7 | Fechar Story 3.5 (CIAO Cloud Protocol — secrets Vercel) | Camila (DevOps) | 08/03 |

---

## 10. 📈 VISÃO PRODUTO — ONDE QUEREMOS CHEGAR

```
                    HOJE (Mar/26)                    META Q2 (Jun/26)
                    ─────────────                    ────────────────
ML Coverage:        ██████████ 67% (2/3)     →      ██████████████ 100% (3/3)
Magalu Coverage:    ██████ 33% (1/3 limp)    →      ██████████████ 100% (3/3 via API)
Shopee Coverage:    ░░░░░░ 0% (bloqueada)    →      ██████████████ 100% (3/3 CSV+API)
Amazon Coverage:    ░░░░░░ 0% (sem SP-API)   →      ░░░░░░ 0% (Sprint futura)
                    
APIs Integradas:    0                        →      2 (Shopee + Magalu)
Testes:             53                       →      75+
Sprint Completude:  62% (8/13)               →      92% (12/13)
Demo Ready:         ❌                       →      ✅
```

> **Missão Q2:** Levar a cobertura de marketplace de 55% para 89%, eliminando a dependência de scraping onde API oficial existir, e apresentar ao stakeholder um produto com dados reais e credibilidade operacional.

---

*Documento gerado em reunião de planejamento em 06/03/2026.*  
*Próxima revisão: 13/03/2026 (pós Sprint 7.5).*
