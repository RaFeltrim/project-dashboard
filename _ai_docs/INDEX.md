# Finance Hub — INDEX.md
> **Framework:** Feltrim's Framework v1.0  
> **Projeto:** Finance Hub — Automação Financeira Pessoal  
> **Sprint Atual:** Sprint 1 — Fundação + Core Engines  
> **Status:** 🟡 Em Execução

---

## 🏛️ Esquadrão Ativo

| Persona | Cargo | Status |
|---|---|---|
| 🦅 Orquestrador | Rafael Feltrim (Human Director) | ✅ Ativo |
| 👁️ Sofia | CIAO — Chief AI Officer | ✅ Ativa |
| 📋 Marlon | Product Owner SR | ✅ Ativo |
| 🗂️ Claudia | Project Manager | ✅ Ativa |
| 🏗️ Aline | Software Architect SR | ✅ Ativa |
| ⚡ Beatriz | Tech Lead | ✅ Ativa |
| 🎨 Laura | UI/UX Designer SR | 🟡 Demandada |
| 💻 Fabio | Frontend SR | 🟡 Demandada |
| ☕ João | Backend SR | ✅ Ativo |
| 📱 Cleber | Mobile SR | ⏳ Pendente |
| 🧪 Rafael-QA | SDET / QA SR — PONTO PRINCIPAL | ✅ Ativo |
| 🔄 Emerson | Data Engineer SR | ✅ Ativo |
| 🛢️ Pedro | DBA SR | ✅ Ativo |
| 🚀 Camila | DevOps / SRE | ⏳ Pendente |
| 🧠 Mariana | Prompt & AI Ops | ✅ Ativa |

---

## 📦 Mapa de Artefatos do Framework

- `_ai_docs/INDEX.md` → Este arquivo
- `_ai_docs/KNOWLEDGE_BASE.md` → Erros resolvidos e decisões tombadas
- `_ai_docs/SDD.md` → Software Design Document (Arquitetura viva)
- `_ai_docs/sprint/SPRINT_01.md` → Backlog, Stories, BDD Cenários e QA Gate
- `_ai_docs/CIAO/RESOLUCAO_SPRINT01.md` → Diretivas C-Level da Sofia
- `_ai_docs/CIAO/AUDITORIA_PROJETO_E_MODELOS.md` → Auditoria de execução e métricas dos modelos (Claude vs Gemini)
- `_ai_docs/project_management/` → Diretório de arquivo (atas, docs legados) e controle de escopo

---

## 🗺️ Estrutura de Pastas do Projeto

```
finance-hub/
├── src/
│   ├── app/                   — Pages (Next.js App Router)
│   │   ├── page.tsx           — Dashboard Home
│   │   ├── motores/           — M1 (MP), M2 (Santander), M3 (Nubank), M4 (Cartão Tia)
│   │   ├── transacoes/        — CRUD + Filtros de Transações
│   │   └── gestao/            — Caixinhas, Categorias, Contas
│   ├── server/routers/        — tRPC Endpoints (API)
│   ├── lib/ai/                — Prompts Gemini (Nubank, Santander)
│   ├── lib/parsers/           — PDF e CSV Parsers
│   └── tests/                 — QA Loop Validator (BDD Mocks)
├── prisma/schema.prisma       — Schema do Banco de Dados
├── scripts/                   — Seeds e Deduplication Scripts
└── _ai_docs/                  — ← FELTRIM'S FRAMEWORK BRAIN
```
