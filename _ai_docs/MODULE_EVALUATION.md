# Finance Hub — Avaliação Completa de Módulos
> **Gerado por:** Esquadrão FF (Beatriz-TL · Rafael-QA · Aline-ARCH · Sofia-CIAO)  
> **Data:** Setembro 2026 | Sprint 1 — Fundação  
> **Status:** Documento Vivo — Atualizar a cada Sprint

---

## 🎯 Legenda de Avaliação

| Nota | Significado |
|---|---|
| ✅ Sólido | Produção-ready, sem débito técnico |
| 🟡 Funcional | Funciona, mas possui débito técnico mapeado |
| 🔴 Crítico | Requer ação antes de ir para produção |

---

## 📦 Módulo 1 — `src/lib/integrations/`

### `gemini.ts` — Cliente Gemini IA
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:**
- `temperature: 0.1` correto para saída determinística JSON.
- Limpeza de blocos markdown preventiva (`replace /\`\`\`json/`).
- `responseSchema` opcional — permite uso com e sem Schema.

**Débitos:**
- `TODO` visível no código: "Adicionar lógica de fallback entre modelos em caso de 503". Erro 503 afeta o usuário sem retry.
- `any` no return type — sem tipagem forte de saída.
- Modelo fixo como string literal `"gemini-3.6-flash"` — deveria ser uma constante exportável.

**Ação Requerida (João-Backend):**
```typescript
// Criar constants.ts ou env-vars:
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
// Adicionar retry com exponential backoff para 503
```

---

### `openai.ts` — Cliente OpenAI
**Avaliação:** 🔴 Crítico  
**Pontos Fortes:** Nenhum relevante além de inicializar o client.

**Débitos:**
- **O arquivo existe mas não é utilizado em nenhum lugar do sistema.** A integração real usa Gemini. A `openai` lib está no `package.json` como dependency, gerando custo de bundle desnecessário.
- `docs/ARCHITECTURE.md` menciona "OpenAI gpt-4o-mini" como motor do Nubank — documento desatualizado.

**Ação Requerida:**
1. Remover `openai.ts` da pasta `integrations/` (ou mover para `deprecated/`).
2. Remover `openai` do `package.json` `dependencies`.
3. Atualizar `docs/ARCHITECTURE.md` para refletir Gemini como LLM real.

---

### `mercadoPago.ts` — Cliente Mercado Pago
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** Encapsula a chamada HTTP ao MP de forma isolada.  
**Débitos:** Sem tratamento de erros HTTP específicos (401, 429 rate-limit). Sem tipagem forte do response.

---

## 📦 Módulo 2 — `src/lib/parsers/`

### `csvParser.ts` — Parser de CSV Santander
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:**
- Lida com separador `;` (padrão PT-BR).
- Parsing de número BR (`1.200,50 → 1200.50`) correto.
- Validação de data por regex antes de processar.

**Débitos:**
- Interface `ParsedTransaction` definida localmente — deveria estar em `src/types/`.
- Não testa linha de header diferenciado (Santander pode ter 3–5 linhas de cabeçalho antes dos dados).
- Sem teste unitário para edge cases: arquivo vazio, separador errado, valor com parênteses (ex: `(150,00)` para negativo).

---

### `pdfParser.ts` — Extrator de Texto PDF
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** Abstrai a biblioteca `pdf-parse` em função única.  
**Débitos:**
- Sem tratamento de PDFs protegidos por senha.
- Sem limite de tamanho de arquivo validado antes de extrair.

---

### `categoryMapper.ts` — Mapeador de Categorias por Palavras-chave
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:**
- Dicionário de 11 categorias cobre os principais casos PT-BR.
- Case-insensitive com `.toLowerCase()`.

**Débitos:**
- A chave `"amazon"` aparece em dois grupos diferentes (`Assinaturas` e `Educação`) — ambiguidade latente. A primeira matched sempre vencerá, potencialmente errado.
- Chaves como `"br"` e `"dia"` são genéricas demais — podem causar falsos positivos (ex: "Farmácia do **Dia**" → Transporte).
- Não tem teste unitário. Este é o tipo de função que mais se beneficia de testes parametrizados.

---

## 📦 Módulo 3 — `src/lib/ai/`

### `nubank-prompt.ts` — Prompt IA para Nubank
**Avaliação:** ✅ Sólido  
**Pontos Fortes:**
- Schema estruturado (`NUBANK_SCHEMA`) garante output determinístico.
- Regras explícitas numeradas (REGRA 1 a 5) — fácil de manter e auditar.
- `mes_referencia`, `totais`, `itens`, `whatsapp_report` — estrutura completa e mapeável.
- REGRA 4 garante formatação WhatsApp (`\n` explícito).

**Débitos:**
- Nenhum crítico. Melhoria futura: adicionar campo `confianca` (0–1) por item para rastrear incerteza da IA.

---

### `santander-prompt.ts` — Prompt IA para Santander PDF
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** Schema simples e funcional para extrair transações do PDF.  
**Débitos:**
- Menos robusto que o Nubank prompt — sem regras numeradas ou SCHEMA declarado como constante exportada para o validator.
- Sem campo de `total_detectado` para conferência de soma.

---

## 📦 Módulo 4 — `src/server/routers/`

### `dashboard.ts` — Router do Dashboard
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:**
- `timeRange` e `statusFilter` como enum inputs — type-safe.
- Filtros MAE/TERCEIROS corretos em `totalExpense`, `statsByMotor` e `groupedByDay/Month/Year`.
- Retorna estrutura completa: historyByDay, historyByMonth, historyByYear, upcomingCharges, pendingInvoices.

**Débitos:**
- `findMany` sem `take` limit no query principal — **R-004 no Risk Register**.
- `monthlyBudget = 3000` hardcoded — deveria ser configurável por usuário.
- Todos os cálculos (somas, agrupamentos) acontecem em JS/TS, não em SQL — ineficiente para grandes volumes.
- `statusFilter` faz um merge não-intuitivo de `dateFilter` e `statusFilter` no mesmo campo `occurredAt` → pode haver conflito se `PAGAR` + `THIS_MONTH` forem usados juntos (query teria `gte: firstDayOfMonth` E `gt: now` — redundante mas funcional).

---

### `invoice.ts` — Router de Faturas (Motores 2 e 3)
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:**
- `prisma.$transaction` garantindo ACID no `confirmInvoice`.
- Parsing de datas multi-formato (`DD/MM/YYYY`, `DD AGO`, etc.).
- Mapeamento de stakeholder → `ExpenseSection` implementado.
- `targetMonth/Year` para Mês de Competência implementado.

**Débitos:**
- 🔴 **BLOQUEANTE (LGPD):** `confirmInvoice` não verifica se `invoice.userId === input.userId`. Qualquer usuário com `invoiceId` pode confirmar a fatura de outro usuário.
- Parsing de data `"10 AGO"` usa `new Date().getFullYear()` — falha em Janeiro ao processar fatura de Dezembro do ano anterior.
- O `status as any` no cast `sectionStr as any` indica falta de tipagem forte local.

---

### `transaction.ts` — Router de Transações
**Avaliação:** ✅ Sólido  
**Pontos Fortes:**
- Filtros por `motor`, `search`, `sortBy`, `sortOrder` implementados corretamente.
- `take: 100` como default razoável para MVP.
- `createInstallments` com data `Date.UTC` — timezone-safe.
- `createMany` em batch — eficiente.

**Débitos:**
- `status: "POSTED"` como string literal hardcoded — deveria usar `TransactionStatus.POSTED` do enum Prisma.
- Sem validação de `userId` proprietário no `delete` — qualquer usuário pode deletar qualquer transação por ID.

---

### `vault.ts` — Router de Caixinhas
**Avaliação:** ✅ Sólido  
**Pontos Fortes:**
- `addFunds` usa `prisma.$transaction` — ACID correto.
- Verifica propriedade: `vault.userId !== input.userId` antes de atualizar — **modelo correto de autorização** (o `invoice.ts` deveria seguir este padrão!).
- Aporte registra transação de `kind: TRANSFER` — rastreável no histórico.

**Débitos:** Nenhum crítico.

---

### `recurringCharge.ts` — Router de Recorrências
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** CRUD completo com `toggleActive`.  
**Débitos:**
- Sem verificação de propriedade em `toggleActive` e `delete` — qualquer usuário pode desativar ou deletar recorrência de outro.
- `nextChargeAt` calculado de forma simplificada — não considera meses com 28/30/31 dias corretamente (usar `date-fns` seria mais seguro).

---

### `fastChat.ts` — Router de Lançamento Rápido
**Avaliação:** ✅ Sólido  
**Pontos Fortes:**
- Regex `([+-]?\d+...)` cobre casos de `+100 pix` e `-50 ifood`.
- Lógica de assumir despesa quando sem sinal explícito é inteligente e TDAH-friendly.
- Retorna `categoryGuess` para feedback imediato ao usuário.

**Débitos:** Nenhum crítico. Melhoria futura: suportar data customizada (`-50 ifood 10/09`).

---

### `category.ts` — Router de Categorias
**Avaliação:** 🟡 Funcional (não inspecionado completamente — arquivo pequeno 1KB)  
**Ação:** Verificar se possui verificação de `userId` proprietário nas mutations de update/delete.

---

## 📦 Módulo 5 — `src/app/` (Frontend / Pages)

### `layout.tsx` — Layout Raiz + Sidebar
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** Sidebar com cores distintas por motor (Azul/Vermelho/Roxo/Amarelo/Verde).  
**Débitos:**
- Nome do usuário hardcoded: `Rafael Feltrim` — deveria ser dinâmico via `session.user.name`.
- Sidebar não responsiva no mobile — sem comportamento hambúrguer.
- Sem `aria-label` nos links de navegação — acessibilidade.
- `<h1>` no Sidebar não deveria ser h1 — seria `<span>` ou `<p>` (o h1 real está nas páginas internas).

---

### `page.tsx` — Dashboard Home
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:**
- Filtros `timeRange` e `statusFilter` funcionais.
- FastChat inline — excelente UX para input rápido.
- `historyByMonth` e `historyByDay` renderizados como listas.

**Débitos:**
- **Sem gráficos visuais** — a lista de texto para histórico mensal é fraca visualmente.
- `data.totalExpense` exibido sem contexto de moeda formatada (`Intl.NumberFormat` BR seria ideal).
- Loading state usa apenas `animate-pulse` genérico — sem skeleton real.
- Componente de 285 linhas — deveria ser quebrado em sub-componentes.

---

### Motores (M1–M4) — Pages
**Avaliação Global:** 🟡 Funcional  
**Débitos Comuns:**
- Todas as pages de motor usam `alert()` nativo do browser para erros e confirmações — experiência de usuário fraca. Deveria ser substituído por `toast` notifications (ex: `react-hot-toast`).
- Nenhuma das páginas tem tratamento de estado vazio ("Nenhuma fatura processada ainda").
- `parsedData` tem tipagem `any` em todas as pages — sem interfaces TypeScript locais.

---

## 📦 Módulo 6 — `scripts/`

### `seed-ap.ts` — Seed de Dados AP (Histórico)
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** Injeta dados históricos mês a mês para o apartamento.  
**Débitos:** Valores injetados como inteiros (sem meia) — requer execução do `deduplicate.ts` após para corrigir. A regra de divisão deveria estar no próprio seed.

---

### `deduplicate.ts` — Script de Deduplicação
**Avaliação:** 🟡 Funcional  
**Pontos Fortes:** Resolve o problema de dados históricos duplicados com uma única execução.  
**Débitos:** Script de uso único — deveria ter proteção para não ser executado duas vezes (idempotência), ou ser refatorado como uma migration.

---

### `e2e-fsm-test.ts` — Teste FSM Manual
**Avaliação:** 🔴 Crítico  
**Débito:** Arquivo de teste manual (não integrado ao runner Vitest/Playwright). Provavelmente um artefato de desenvolvimento que deveria ser migrado para `src/tests/` ou deletado.

---

### `clear-data.ts` — Limpa dados do banco
**Avaliação:** 🔴 Crítico  
**Débito:** Script destrutivo sem confirmação explícita no código. Sem proteção de ambiente (`process.env.NODE_ENV !== 'production'`). Risco de uso acidental em produção.

---

## 📊 Scorecard Final — Sprint 1

| Módulo | Score | Prioridade de Ação |
|---|---|---|
| `integrations/gemini.ts` | 🟡 7/10 | Retry 503, constantes |
| `integrations/openai.ts` | 🔴 2/10 | **REMOVER — não utilizado** |
| `parsers/csvParser.ts` | 🟡 6/10 | Mover interfaces, testes |
| `parsers/categoryMapper.ts` | 🟡 6/10 | Resolver ambiguidade, testes |
| `ai/nubank-prompt.ts` | ✅ 9/10 | Manutenção contínua |
| `ai/santander-prompt.ts` | 🟡 7/10 | Alinhar ao padrão Nubank |
| `routers/dashboard.ts` | 🟡 7/10 | Limit no findMany, budget config |
| `routers/invoice.ts` | 🔴 6/10 | **FIX LGPD userId validation** |
| `routers/transaction.ts` | 🟡 8/10 | Fix enum literal, userId delete |
| `routers/vault.ts` | ✅ 9/10 | Referência de padrão ACID |
| `routers/fastChat.ts` | ✅ 9/10 | Manutenção contínua |
| `routers/recurringCharge.ts` | 🟡 6/10 | Ownership validation |
| `app/layout.tsx` | 🟡 6/10 | Responsividade, nome dinâmico |
| `app/page.tsx` | 🟡 6/10 | Gráficos, formatação, split |
| `scripts/clear-data.ts` | 🔴 3/10 | **Guard de ambiente obrigatório** |
| `scripts/e2e-fsm-test.ts` | 🔴 3/10 | Migrar ou deletar |

---

## 🏆 Ações Prioritárias (Sprint 2)

### 🔴 Bloqueantes (antes de produção)
1. **[invoice.ts]** Adicionar `if (invoice.userId !== input.userId) throw FORBIDDEN`
2. **[transaction.ts]** Adicionar verificação de propriedade no `delete`
3. **[recurringCharge.ts]** Adicionar verificação de propriedade em `toggleActive` e `delete`
4. **[openai.ts]** Remover arquivo e dependência do `package.json`
5. **[clear-data.ts]** Adicionar guard `if (process.env.NODE_ENV === 'production') throw`

### 🟡 Alta Prioridade (Sprint 2)
6. **[dashboard.ts]** Adicionar `take: 500` ou paginação real
7. **[categoryMapper.ts]** Resolver chaves ambíguas (`"br"`, `"dia"`, `"amazon"`)
8. **[layout.tsx]** Tornar nome do usuário dinâmico via session
9. **[page.tsx]** Quebrar em sub-componentes (`<DashboardHeader />`, `<MetricsGrid />`, etc.)
10. **[todos os motores]** Substituir `alert()` por toast notifications
