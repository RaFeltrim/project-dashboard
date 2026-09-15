# Analise Financeira Ativa - Dashboard Financeiro

Data: 2026-04-07
Status: Aplicacao ativa com metricas gerais + metricas anuais/KPI

## 1. Estado Atual Validado

- Usuario ativo: rafael@dashboard.local
- Fonte de dados: PostgreSQL via Docker (porta 5433)
- Dashboard operacional:
  - Saldo geral
  - Receitas gerais
  - Despesas (inclui contas)
  - Contas em aberto
- Dashboard avancado implementado:
  - Receita anual
  - Despesa anual (inclui contas)
  - Saldo anual
  - Taxa de poupanca
  - Ticket medio de despesas
  - Media mensal de despesas
  - Contas vencidas (qtd/valor)
  - Projecao de saldo anual
  - Serie mensal por ano
  - Top categorias de gasto

## 2. Regras de Negocio Recomendadas

### 2.1 Regime de Caixa vs Competencia

- Caixa:
  - Receita quando recebida (income.date)
  - Despesa quando realizada (expense.date)
- Competencia:
  - Conta a pagar pela data de vencimento (bill.dueDate)

Padrao recomendado para home:
- KPI operacional (dia a dia): Caixa
- KPI analitico (ano/mensal): Caixa + Competencia (com sinalizacao explicita)

### 2.2 Definicoes

- Receita total periodo = sum(incomes.amount no periodo)
- Despesa total periodo = sum(expenses.amount no periodo) + sum(bills.amount no periodo)
- Saldo periodo = Receita total - Despesa total
- Taxa de poupanca = Saldo periodo / Receita total
- Contas vencidas = bills.paid=false e dueDate < now

## 3. Melhorias de Maior Impacto (Prioridade)

## P0 (1-2 semanas)

- Filtro global de periodo (mes, trimestre, ano, custom)
- Toggle de regra de despesa:
  - so despesas
  - despesas + contas pagas
  - despesas + todas contas
- KPI de risco:
  - liquidez de 7 dias
  - razao divida/renda
  - runway (dias)
- Testes de regressao para formulas de KPI

## P1 (2-4 semanas)

- Orcamento por categoria e desvio vs real
- Metas financeiras (reserva, quitacao, poupanca)
- Alertas proativos:
  - conta vencida
  - gasto anomalo por categoria
  - saldo projetado negativo em 30 dias
- Exportacao PDF/CSV de relatorio mensal

## P2 (4-8 semanas)

- Importacao OFX/CSV com categorizacao automatica
- Conciliacao de transacoes duplicadas
- Dashboard de tendencia (12 meses) com sazonalidade
- Score de saude financeira (0-100)

## 4. Integracao Bancaria (Brasil)

## Fase 1

- OFX/CSV (baixo risco, baixo custo)
- Criterio de aceite: 95% parse sem erro, 80% categorizacao correta

## Fase 2

- Open Finance (agregador): Pluggy, Belvo, Quanto, etc.
- Requisitos:
  - consentimento LGPD
  - trilha de auditoria
  - revogacao de acesso

## Fase 3

- Enriquecimento:
  - conciliacao automatica
  - recomendacoes personalizadas
  - previsao de caixa baseada em historico

## 5. Criterios de Aceite para Dashboard Completo

- Usuario escolhe periodo e todos KPIs respeitam o filtro
- KPI explica formula (tooltip simples)
- Diferenca entre caixa e competencia visivel
- Alertas com acao sugerida (nao apenas aviso)
- Tempo de carregamento < 1.5s em ambiente local com dados de 12 meses

## 6. Riscos e Mitigacoes

- Risco: KPI ambiguo gerar decisao errada
  - Mitigacao: explicitar formula e origem de dados em cada card
- Risco: duplicidade entre bill e expense
  - Mitigacao: regra de consolidacao configuravel por usuario
- Risco: timezone em datas
  - Mitigacao: padronizar UTC para storage e local para exibicao

## 7. Proximo Passo Recomendado

Implementar um modulo de "Periodo + Regra de Consolidacao" e travar os KPIs com testes automatizados de formula.
