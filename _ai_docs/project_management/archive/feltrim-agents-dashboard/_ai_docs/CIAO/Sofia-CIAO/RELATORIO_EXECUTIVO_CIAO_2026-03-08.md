# 👁️ RELATÓRIO EXECUTIVO C-LEVEL — CIAO (Sofia)
> **Classificação:** Estratégico / Decisional  
> **Data de Emissão:** 2026-03-08  
> **Versão:** 1.0  
> **Projeto:** MKP Flow v5.0 Masterclass  
> **Sprint Encerrada:** 7.5 (Stabilization & Security Hardening)  
> **Destinatário:** Rafael Feltrim (Titular / PO)  

---

## 📋 SUMÁRIO EXECUTIVO

Titular,

Este documento consolida três linhas de investigação estratégica conduzidas pela equipe nas últimas 48h e apresenta meu **veredito C-Level** sobre cada uma. As conclusões são claras: possuímos uma infraestrutura de IA funcional mas **financeiramente ineficiente**, um motor de scraping **operacionalmente comprometido**, e uma janela de oportunidade para corrigir ambos com investimento de esforço moderado.

**Resultado macro:**
- 💸 Estamos pagando **5.7x mais caro** do que o necessário na IA generativa
- 🚫 3 dos 4 scrapers estão **bloqueados** por anti-bot (Shopee, ML, Univerza/Shopee)
- ✅ A arquitetura de segurança (Sprint 7.5) está **sólida** — base correta para otimizar
- 🎯 Com **~8h de engenharia focada**, reduzimos custo de IA em até 70% e restauramos coleta de dados

---

## 🔍 SEÇÃO A — ANÁLISE DO DOCUMENTO "API IA: CUSTO-BENEFÍCIO 2026"

### A.1 Estado Atual da Infraestrutura de IA

| Componente | Arquivo | Função |
|---|---|---|
| Frontend Caller | `src/ai/callQwen.js` | Proxy client → `POST /api/ai/generate`, cache MD5 em localStorage |
| System Builder | `src/ai/buildSystem.js` | Combina 4 tones × 4 modes = 16 combinações de system prompt |
| Server Proxy | `src/server/scraper-api.js` | Express 5.2, porta 3001, rate-limit (20 req/min IA, 10 req/min scrape) |
| Gap Engine | `src/server/ai-gap-engine.js` | OpenAI SDK → DashScope, model `qwen-max`, temp 0.2, regras anti-canibalização |
| Consumers | `Optimizer.jsx`, `ContentHub.jsx`, `GapSuggestions.jsx` | 3 superfícies que consomem IA |

**Provedor atual:** Alibaba DashScope (Qwen Max)  
**Custo estimado:** ~$1.60/1M tokens input, ~$4.00/1M tokens output  

### A.2 GAPs Identificados

#### 🔴 GAP 1 — Overpaying 5.7x (CRÍTICO)
- **Diagnóstico:** Todo o tráfego de IA passa por `qwen-max` via DashScope. Em 2026, o DeepSeek V3.2 cobra **$0.28/1M tokens input** e **$1.10/1M output** com qualidade comparável para nossas tarefas (geração de títulos, descrições, fichas técnicas de marketplace).
- **Impacto financeiro:** Se consumimos 10M tokens/mês, pagamos ~$56 quando poderíamos pagar ~$10.
- **Veredito CIAO:** `INACEITÁVEL`. Migração obrigatória.

#### 🟡 GAP 2 — Cache Apenas no Frontend (ALTO)
- **Diagnóstico:** `callQwen.js` usa `localStorage` com hash MD5 para evitar chamadas duplicadas. Porém: (a) cada usuário/navegador tem cache isolado, (b) limpar dados do browser apaga tudo, (c) o servidor (`scraper-api.js`) não possui nenhum cache — chamadas idênticas de dois navegadores geram 2 cobranças.
- **Impacto:** Estimativa de 25-35% de chamadas redundantes em cenário multi-device.
- **Veredito CIAO:** `APROVAÇÃO CONDICIONAL`. Cache server-side com LRU é o próximo passo lógico.

#### 🟡 GAP 3 — Zero Roteamento por Complexidade (ALTO)
- **Diagnóstico:** Gerar um título de 60 caracteres e analisar gaps cross-marketplace usam o MESMO modelo (`qwen-max`). Títulos poderiam ser gerados por modelos 10x mais baratos (qwen-turbo, DeepSeek-lite).
- **Impacto:** ~40% das chamadas são "simples" e desperdiçam capacidade premium.
- **Veredito CIAO:** `REQUER AÇÃO`. Implementar router de complexidade.

#### 🟠 GAP 4 — Fricção Cambial (IOF sobre USD) (MÉDIO)
- **Diagnóstico:** Todo pagamento de API é em dólar americano. Para operações brasileiras, incide IOF (~6.38% em compras internacionais) + spread cambial (~2-4%). A cada $10 gastos, ~$1 é imposto/câmbio.
- **Impacto:** 8-10% de overhead invisível em cada fatura.
- **Veredito CIAO:** `MONITORAR`. Soluções PIX existem mas ainda são experimentais.

### A.3 Recomendações de Engenharia (R1–R5)

| ID | Ação | Esforço | Impacto | Prioridade |
|---|---|---|---|---|
| **R1** | Multi-provider proxy em `scraper-api.js` (DeepSeek V3.2 como primário, Qwen como fallback) | 2h | -60% custo IA | 🔴 P0 |
| **R2** | Server-side LRU cache com TTL 24h no endpoint `/api/ai/generate` | 1h | -30% chamadas | 🔴 P0 |
| **R3** | Router de complexidade: `title/csv_ml` → modelo lite, `ficha/gaps` → modelo premium | 3h | -40% custo adicional | 🟡 P1 |
| **R4** | OpenRouter como gateway universal (fallback gratuito Claude 3.5 Haiku, DeepSeek, Qwen) | 2h | Resiliência + opção PIX | 🟡 P1 |
| **R5** | AI Studio Free Tier para ambiente dev/staging (zero custo em testes) | 30min | -100% custo dev | 🟢 P2 |

**Projeção de economia combinada (R1+R2+R3):** De ~$56/mês para ~$8-12/mês (redução de **78-85%**).

---

## 🕷️ SEÇÃO B — ANÁLISE DA CONVERSA RAFAEL + DOUGLAS (08/03/2026) — BLOCKERS DE SCRAPING

### B.1 Contexto Operacional

O motor de scraping (`storeScraper.js`, ~400 linhas) utiliza Playwright Chromium com técnicas anti-detecção para coletar dados de lojas em ML, Magalu, Shopee e Amazon. Consulta realizada com Douglas Feltrim (desenvolvedor sênior externo, experiência em automação web) revelou bloqueios sistêmicos.

### B.2 Diagnóstico por Marketplace

#### 🔴 Shopee — BLOQUEIO TOTAL
- **Mecanismo:** Slide puzzle captcha (anti-bot visual) dispara **antes** do XHR carregar os dados do JSON de produtos.
- **Consequência:** O `page.on('response')` de network interception nunca recebe o payload de produtos.
- **Estado atual do código:** Tenta interceptar `https://shopee.com.br/api/v4/search/search_items` mas o captcha impede a request de ocorrer.
- **Evidência no GAP Report:** `SINAL | Shopee → Falha`, `UNIVERZA | Shopee → Falha`.

#### 🟡 Mercado Livre — BLOQUEIO PARCIAL
- **Mecanismo:** Fingerprinting avançado que vai além da detecção de `navigator.webdriver`. Detecta: resolução de canvas, WebGL renderer hash, timing de eventos de mouse, e provavelmente TLS fingerprint (JA3/JA4).
- **Consequência:** Funciona intermitentemente (MIV OK, UNIVERZA ML → falha).
- **Defesas atuais insuficientes:** Apenas `Object.defineProperty(navigator, 'webdriver', {get: () => false})` e 4 User-Agents fixos.

#### 🟢 Magalu — OPERACIONAL (com degradação)
- **Mecanismo:** Proteção mais leve, baseada em rate-limit e headers.
- **Consequência:** Funciona, mas extrai títulos genéricos ("Magazine Luiza" em vez do nome real do produto) quando seletores CSS mudam.
- **Evidência no GAP Report:** `SINAL | Magalu → DEGRADED (100% falha — 3/3 inválidos)`, títulos capturados: "Magazine Luiza" × 3.

#### ⚪ Amazon — NÃO TESTADO
- **Status:** Scraper `amazonScraper.js` existe mas nunca foi executado em produção (MIV Amazon = "missing").

### B.3 Problemas Técnicos no Código

| # | Problema | Arquivo | Impacto |
|---|---|---|---|
| 1 | Apenas 4 User-Agents hardcoded | `storeScraper.js` | Fingerprint trivial (4 assinaturas rotativas = padrão detectável) |
| 2 | `waitForTimeout(ms)` em vez de `waitForSelector()` | `storeScraper.js` | Espera fixa que falha em conexões lentas e não detecta conteúdo dinâmico |
| 3 | Sem retry com backoff exponencial | `storeScraper.js` | Uma falha = resultado vazio, sem segunda chance |
| 4 | Anti-detection superficial | `storeScraper.js` | Apenas webdriver override; falta canvas/WebGL spoofing, timezone, locale |
| 5 | Sem proxy rotation | Infraestrutura | Mesmo IP = ban progressivo garantido |

### B.4 Recomendação Estratégica de Douglas

> *"Vê se não dá pra fazer por API... scraping é gambiarra, API é contrato."*

**Veredito CIAO:** `APROVADO COM ÊNFASE`. Douglas está **100% correto**. A direção estratégica é migração para APIs oficiais:

| Marketplace | API Status | Ação |
|---|---|---|
| **Mercado Livre** | ✅ API existente, webhook de notificações já integrado no app | Priorizar credencial OAuth e migrar dados via `/items` endpoint |
| **Magalu** | 🟡 API de Seller disponível, requer aprovação de parceiro | Solicitar acesso comercial ao programa de parceiros Magalu |
| **Shopee** | 🟡 Open Platform existe, requer conta de desenvolvedor ativa | Registrar app em `open.shopee.com` |
| **Amazon** | 🟡 SP-API (Selling Partner API) disponível | Requer registro de desenvolvedor + aprovação |

### B.5 Plano Dual-Track (Curto + Médio Prazo)

**Track A — Curto Prazo (Patch de Sobrevivência, ~4h):**
1. Integrar `playwright-extra` + `stealth plugin` (canvas, WebGL, timezone spoofing)
2. Expandir pool de User-Agents de 4 para 50+ (real browser fingerprints)
3. Substituir todos `waitForTimeout` por `waitForSelector` com fallback
4. Implementar retry com backoff exponencial (3 tentativas, delay 2s/4s/8s)
5. Adicionar serviço captcha-solver externo para Shopee (2Captcha ou Anti-Captcha, ~$2/1000 solves)

**Track B — Médio Prazo (Migração API, Sprint 10+):**
1. ML: OAuth2 flow → substituir `storeScraper.js` para ML por chamadas REST
2. Magalu: Solicitar credenciais parceiro → integrar Seller API
3. Shopee: Registrar developer app → integrar Open Platform API
4. Depreciar `storeScraper.js` progressivamente

---

## 💰 SEÇÃO C — ANÁLISE DE GATEWAY PIX E CUSTO OPERACIONAL BRASIL

### C.1 O Problema Cambial

Desenvolvedores brasileiros pagando APIs em USD enfrentam:
- **IOF:** 6.38% sobre compras internacionais com cartão
- **Spread bancário:** 2-4% sobre o câmbio
- **Total overhead:** ~8-10% de "imposto invisível" sobre cada centavo gasto em IA

Para um consumo de $50/mês em APIs, ~$5 são impostos e câmbio. Anualizado: **~$60/ano jogados fora**.

### C.2 Alternativas com PIX

| Solução | Modelo | Vantagem | Risco |
|---|---|---|---|
| **OpenRouter** | Gateway multi-modelo, aceita PIX como depósito | Acesso a 100+ modelos, fallback automático | Beta para pagamentos BR, suporte limitado |
| **Gateway PIX Fixo** (ex: Claudio API, BRCloud) | Assinatura mensal em R$ (~R$55-120/mês) | IOF zero, previsibilidade de custo | Catálogo de modelos limitado |
| **Hugging Face Inference** | Pay-per-use, aceita PIX via Stripe BR | Open-source models, sem vendor lock-in | Latência variável, cold-start |

### C.3 Veredito CIAO

`MONITORAR — NÃO AGIR AGORA`. O overhead cambial existe mas é proporcionalmente baixo frente ao potencial de economia de R1-R3 (mudar de modelo/cache economiza mais que mudar de gateway). Revisar em Sprint 12 quando o volume de API justificar assinatura fixa.

---

## 📊 SEÇÃO D — ESTADO OPERACIONAL DO PRODUTO (SNAPSHOT)

### D.1 Números Atuais

| Métrica | Valor |
|---|---|
| **Produtos cadastrados** | 37 (MIV: 7, SIN: 15, UNV: 15) |
| **Tarefas ativas** | 33 novas + backlog anterior |
| **Pipeline** | 5 itens em andamento |
| **Testes automatizados** | 53/53 Vitest ✅ + 6 E2E Playwright |
| **Build** | 138 módulos, 0 erros, 0 warnings |
| **Scraping funcional** | 1/4 marketplaces (apenas Magalu, degradado) |
| **IA generativa** | Operacional mas 5.7x mais cara que necessário |

### D.2 Saúde por Empresa × Marketplace

| | ML | Magalu | Shopee | Amazon |
|---|---|---|---|---|
| **MIV** | 🟢 13 anúncios, OK | 🟡 10 anúncios, títulos degradados | 🔴 9 anúncios INATIVOS (loja desativada) | ⚪ missing |
| **SIN** | 🟢 9+ anúncios | 🟡 7 anúncios, dados degradados | 🔴 13 anúncios (bloqueio captcha) | ⚪ N/A |
| **UNV** | 🟡 9+ anúncios (falha intermitente) | 🟢 6 anúncios | 🔴 7 anúncios (bloqueio captcha) | ⚪ N/A |

### D.3 Sprints Congelados

- **Sprint 5 🧊:** Dependente de chaves API Master (MIV, Magalu, Amazon)
- **Sprint 6 🧊:** Dependente de listas EAN do Titular
- **Sprint 10:** Shopee Recovery (depende de Track A ou Track B da Seção B)

---

## 🎯 SEÇÃO E — ROADMAP DE AÇÃO (MATRIZ ESFORÇO × IMPACTO)

### E.1 Prioridade Imediata (Sprint 8 — próximas 2 semanas)

```
                        IMPACTO
                 Baixo          Alto
           ┌──────────────┬──────────────┐
    Baixo  │  R5 (30min)  │  R2 (1h)    │
  ESFORÇO  │  AI Free Dev │  Server Cache│
           ├──────────────┼──────────────┤
    Alto   │  R4 (2h)     │  R1 (2h)    │
           │  OpenRouter   │  Multi-Prov  │
           │              │  R3 (3h)     │
           │              │  Complexity  │
           └──────────────┴──────────────┘
```

### E.2 Ordem de Execução Recomendada

| Ordem | Ação | Esforço | Impacto Esperado |
|---|---|---|---|
| 1️⃣ | **R5** — AI Studio Free para dev/staging | 30min | Custo zero em desenvolvimento |
| 2️⃣ | **R2** — Server-side LRU cache | 1h | -30% chamadas à API |
| 3️⃣ | **R1** — DeepSeek V3.2 como provider primário | 2h | -60% custo por token |
| 4️⃣ | **R3** — Router de complexidade (lite vs premium) | 3h | -40% custo adicional |
| 5️⃣ | **Track A** — Stealth patch no scraper | 4h | Restaura coleta ML + possivelmente Magalu |
| 6️⃣ | **R4** — OpenRouter como gateway universal | 2h | Resiliência + fallback gratuito |

**Total estimado:** ~12.5h de engenharia para transformação significativa.

### E.3 O Que NÃO Mexer (Patrimônio Consolidado)

| Componente | Razão |
|---|---|
| Arquitetura de proxy server-side (`scraper-api.js`) | Segurança Sprint 7.5 — chave API nunca no client |
| Rate limiting Express | Proteção anti-abuso já calibrada (10/min scrape, 20/min IA) |
| Auth Supabase + RLS | Segurança de dados de nível enterprise |
| Validação pós-IA em `buildSystem.js` | NO_MARKDOWN_RULE + BIONICS_METHOD = qualidade de output |
| `scrapingAuditor.js` | Única linha de defesa contra dados corrompidos |

---

## 🏛️ VEREDITO FINAL DO CIAO

### Decisão 1: Otimização de Custo IA
**`APROVADO — EXECUÇÃO IMEDIATA`**  
R1+R2+R3 devem ser implementados na Sprint 8. A economia projetada de 78-85% é substancial demais para postergar. O proxy server-side já existente facilita a inserção de multi-provider + cache sem refatoração arquitetural.

### Decisão 2: Scraping — Track Dual
**`APROVADO COM RESSALVA`**  
Track A (stealth patch) é paliativo. Eu autorizo a execução como medida tática, mas Track B (APIs oficiais) é a direção estratégica obrigatória. Douglas estava certo: *scraping é gambiarra, API é contrato*. A cada sprint que passa sem API oficial, acumulamos dívida técnica que pode virar dívida de negócio (dados inconsistentes = decisões erradas).

### Decisão 3: Gateway PIX
**`ADIADO — REVISÃO EM SPRINT 12`**  
O overhead cambial (~10%) é real mas numericamente inferior ao overhead de modelo (~470%). Primeiro trocamos o modelo (R1), depois otimizamos o gateway de pagamento. Sequência lógica.

### Decisão 4: Sprints Congelados (5 e 6)
**`BLOQUEIO MANTIDO`**  
Sem chaves API Master e listas EAN do Titular, não há como descongelar. Esta decisão não é técnica — é operacional e depende exclusivamente de ação humana externa.

---

## 📎 ANEXOS DE REFERÊNCIA

- [GAP_ANALYSIS_REPORT.md](../../../GAP_ANALYSIS_REPORT.md) — Relatório detalhado de gaps por produto/marketplace
- [CIAO_MEMORY_CORE.md](CIAO_MEMORY_CORE.md) — Registro permanente de decisões arquiteturais
- Conversa Rafael + Douglas (08/03/2026) — Transcrita em sessão de análise
- Documento "API IA: Custo-Benefício 2026" — Analisado em sessão estratégica

---

> *"O pior desperdício não é gastar demais — é gastar no lugar errado enquanto o lugar certo está esperando."*  
> — Sofia, CIAO | MKP Flow v5.0  

**FIM DO RELATÓRIO — CIAO-REL-2026-03-08-v1.0**
