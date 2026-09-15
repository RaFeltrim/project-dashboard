# Task-List Prioritaria — Dashboard Financeiro

Data de abertura: 2026-04-07
Owner executivo: Rafael Feltrim

## Objetivo do ciclo atual
Entregar MVP funcional do Dashboard financeiro com autenticacao, CRUD de despesas, resumo financeiro e base de qualidade para evolucao.

## P0 — Must Have (ordem de execucao)
1. Definir decisao arquitetural oficial: Supabase central vs banco isolado
Responsavel: Beatriz-TL + Emerson-Supabase + Rafael
Prazo: 2026-04-08
Criterio de aceite: ADR registrada e aprovada

2. Scaffold da aplicacao Next.js com TypeScript e Tailwind
Responsavel: Fabio-Frontend
Prazo: 2026-04-08
Criterio de aceite: app sobe local com npm run dev

3. Configurar Prisma + schema inicial (User, Expense, Income, Bill)
Responsavel: Emerson-Supabase + Pedro-DBA
Prazo: 2026-04-09
Criterio de aceite: migrate/generate executam sem erro

4. Implementar autenticacao base (NextAuth Credentials)
Responsavel: Joao-Backend
Prazo: 2026-04-09
Criterio de aceite: login/logout funcionando com sessao valida

5. Implementar router tRPC de despesas (create/list/update/remove)
Responsavel: Joao-Backend
Prazo: 2026-04-10
Criterio de aceite: CRUD validado com usuario autenticado

6. Implementar formulario de despesa com React Hook Form + Zod
Responsavel: Fabio-Frontend + Laura-UI
Prazo: 2026-04-10
Criterio de aceite: mensagens de validacao consistentes frontend/backend

7. Implementar dashboard inicial (saldo, receitas, despesas, lista recente)
Responsavel: Fabio-Frontend
Prazo: 2026-04-11
Criterio de aceite: dados reais renderizados via tRPC

8. Criar baseline de testes unitarios/integracao
Responsavel: Rafael-QA
Prazo: 2026-04-11
Criterio de aceite: suite minima passando em CI local

9. Configurar pipeline minimo (lint, tests, build)
Responsavel: Camila-DevOps
Prazo: 2026-04-11
Criterio de aceite: pipeline bloqueia merge em falha

## P1 — Should Have (ja no backlog)
1. CRUD de receitas completo
Responsavel: Joao-Backend

2. CRUD de contas (bills) com status pago/vencido
Responsavel: Joao-Backend

3. Filtros por periodo e categoria
Responsavel: Fabio-Frontend

4. Exportacao CSV
Responsavel: Joao-Backend + Fabio-Frontend

## P2 — Could Have
1. Metas por categoria com status (ok/warning/critical)
2. Integracao de relatorio diario via n8n + OpenClaw
3. Grafico de tendencia por periodo

## Regras operacionais
- Sem feature nova fora de P0 antes de concluir P0.
- Sem merge sem testes minimos e sem validacao de seguranca.
- Toda mudanca de escopo deve passar por Marlon-PO + Claudia-PM.
