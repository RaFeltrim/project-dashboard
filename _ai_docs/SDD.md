# Finance Hub — SDD (Software Design Document)
> **Versão:** 1.0 — Sprint 1  
> **Autor:** Aline (Arquiteta SR) + Beatriz (Tech Lead)  
> **Revisão CIAO:** Sofia ✅

---

## 1. Visão Geral do Sistema

O **Finance Hub** é uma aplicação web de gestão financeira pessoal que automatiza a extração, classificação e visualização de gastos oriundos de múltiplos bancos e cartões. A aplicação opera localmente e é implantada via Vercel + Supabase PostgreSQL.

### Objetivos de Negócio
- Centralizar gastos de 4 fontes (Mercado Pago, Santander, Nubank, Cartão Tia/AP)
- Automatizar o rateio de despesas compartilhadas (Condomínio, Aluguel, Água, Energia, Internet)
- Fornecer visão temporal de gastos (Dia, Mês, Ano) com filtros `PAGAR` / `PAGOS`
- Gerar relatório WhatsApp formatado do rateio do Nubank

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR + File-based routing |
| API | tRPC v11 | Type-safe end-to-end |
| Auth | NextAuth v4 | Session JWT |
| ORM | Prisma 6.x | Schema-first, type-safe |
| Banco | PostgreSQL (Supabase) | ACID, JSON, Indexes |
| IA / LLM | Gemini Flash (Google GenAI) | Extração de faturas PDF |
| PDF | pdf-parse | Extração de texto |
| Styles | TailwindCSS 4 | Utility-first |
| Testes E2E | Playwright | Automação de browser |
| Testes Unit | Vitest + Testing Library | Unit e componentes |
| CI | — (pendente Sprint 2) | Camila-DevOps |

---

## 3. Arquitetura dos Motores (Core Engines)

```
┌─────────────────────────────────────────────────────────┐
│                   DASHBOARD (page.tsx)                  │
│          getConsolidatedData (tRPC query)                │
└──────────────────────┬──────────────────────────────────┘
                       │ (filtra MAE e TERCEIROS)
┌──────────────────────▼──────────────────────────────────┐
│              Transaction Table (Prisma)                 │
│    motor | section | amount | occurredAt | userId       │
└─────┬───────────┬──────────────┬────────────────────────┘
      │           │              │
   M1(MP)     M2(Sant.)     M3(Nubank)     M4(CartãoTia)
  API REST    PDF→Gemini   PDF→Gemini     RecurringCharge
  (webhook)   CSV→Parser   Rateio IA      + Parcelamento
```

### Regras de Seção (ExpenseSection)
| Stakeholder Nubank | Section no Banco |
|---|---|
| SUB_PESSOAL | PESSOAL |
| AP | CASA |
| TERCEIROS | TERCEIROS (excluído do Dashboard) |
| MAE | MAE (excluído do Dashboard) |

### Regra de Data — "Mês de Competência"
Ao confirmar rateio Nubank, o usuário escolhe o `targetMonth/Year`. Todas as transações são gravadas no dia `01/{targetMonth}/{targetYear}` para aparecerem corretamente no filtro `THIS_MONTH` do Dashboard.

---

## 4. Endpoints tRPC Registrados

| Router | Procedure | Tipo | Descrição |
|---|---|---|---|
| dashboard | getConsolidatedData | query | Totais, histórico, upcoming, motores |
| transaction | getAll | query | Lista paginável com filtros (motor, search, sort) |
| transaction | delete | mutation | Remove 1 transação |
| transaction | createInstallments | mutation | Gera N parcelas futuras |
| invoice | uploadAndParse | mutation | Dispara IA sobre PDF |
| invoice | confirmInvoice | mutation | Confirma rateio → cria transações |
| invoice | getParsedInvoice | query | Busca parsedData de uma invoice |
| recurringCharge | create | mutation | Cria recorrência fixa |
| recurringCharge | getAll | query | Lista recorrências ativas |
| recurringCharge | toggleActive | mutation | Ativa/Desativa recorrência |
| vault | getAll | query | Lista caixinhas |
| vault | create | mutation | Cria caixinha |
| category | getAll | query | Lista categorias |
| mercadoPago | — | — | Configuração de API |

---

## 5. Schema Prisma (Principais Modelos)

- **Transaction** — Transação financeira (qualquer motor). Campos chave: `motor`, `section`, `amount`, `occurredAt`, `userId`
- **Invoice** — Fatura importada via PDF. Status: PENDING → PARSED → CONFIRMED | ERROR
- **RecurringCharge** — Débito automático recorrente (Motor 4)
- **Vault** — Caixinha de poupança com saldo e meta
- **Category** — Categoria de despesa vinculada a transação

---

## 6. Débitos Técnicos Mapeados

| Prioridade | Débito | Responsável |
|---|---|---|
| 🔴 Crítico | Paginação no getAll (sem cursor-based pagination) | João-Backend |
| 🔴 Crítico | Cobertura BDD/E2E zero — só validator manual existe | Rafael-QA |
| 🟡 Alto | Dashboard hardcode de `section !== "MAE"` (não configurável) | João-Backend |
| 🟡 Alto | statsByMotor usa JS reduce em vez de SQL GROUP BY | Emerson-DE |
| 🟡 Alto | Sem skeleton loaders — UX falha em conexões lentas | Laura-UIUX + Fabio |
| 🟢 Médio | Sem gráficos visuais (Recharts) | Fabio-Frontend |
| 🟢 Médio | Responsividade mobile incompleta (Sidebar + Tabelas) | Cleber-Mobile |
| 🟢 Médio | Sem CI/CD pipeline | Camila-DevOps |
| 🟢 Médio | Motor 5 (Banco Inter / PDF) não implementado | João-Backend |
| 🟢 Médio | Gmail Integration (coleta automática de notas) | João-Backend |
