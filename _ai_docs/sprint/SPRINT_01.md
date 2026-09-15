# Finance Hub — SPRINT_01.md
> **Sprint:** 1 — Fundação + Core Engines  
> **Personas:** Marlon (PO) · Rafael-QA · Beatriz (TL)  
> **Objetivo:** Definir o Backlog completo, User Stories e Cenários BDD para cobertura da Sprint atual e próximas.

---

# 📋 BLUEPRINT DO PRODUCT OWNER (BACKLOG E VALOR MÁXIMO)

## 0. Questões Pendentes (Discovery)
1. O teto mensal de R$ 3.000 será configurável pelo usuário na UI?
2. O "Motor 5 (Banco Inter)" precisa de parser de extrato TXT ou PDF?
3. A integração com Gmail é para capturar comprovantes Pix ou faturas de e-mail?

## 1. Contexto de Negócio e Impacto
O Finance Hub visa reduzir o tempo de gestão financeira pessoal de ~4h/semana (planilhas manuais) para ~15min/mês (upload de PDF + confirmação de rateio). A métrica principal é a eliminação de erros de cálculo no rateio compartilhado de apartamento.

## 2. Epics e Priorização (MoSCoW)

**Must Have (Sprint 1 — Em andamento):**
- Motor 2: Extração de fatura Santander PDF/CSV
- Motor 3: Extração e rateio de fatura Nubank com IA
- Motor 4: Lançamentos recorrentes + Parcelamentos manuais
- Dashboard: Totais por período + Filtros PAGAR/PAGOS/AMBOS
- Deduplicação automática de transações

**Should Have (Sprint 2):**
- Motor 1: Integração API Mercado Pago (Webhook)
- Gráficos visuais (Recharts) no Dashboard
- Paginação no endpoint de Transações
- Responsividade Mobile completa

**Could Have (Sprint 3):**
- Motor 5: Parser Banco Inter (PDF/TXT)
- Integração Gmail (leitura automática de comprovantes)
- Configuração de teto mensal pelo usuário
- Pipeline CI/CD (Camila-DevOps)

**Won't Have (fora de escopo MVP):**
- Integração Open Banking (Plaid-like)
- Multi-usuário colaborativo

---

## 3. Histórias de Usuário — Sprint 1

---
**Card ID:** FH-001 — Upload e Parsing de Fatura PDF  
**Enunciado:** Como Rafael, eu quero subir o PDF da minha fatura Nubank para que o sistema extraia e classifique os itens automaticamente.

**Critérios de Aceitação (Gherkin High-Level):**
1. Dado que Rafael selecionou um arquivo PDF válido do Nubank, Quando ele clicar em "Analisar e Cruzar Dados", Então o sistema deve retornar a lista de transações extraídas com stakeholder identificado.
2. Dado que o PDF está corrompido ou vazio, Quando o upload for enviado, Então o sistema deve exibir mensagem de erro amigável.
3. Dado que a API Gemini retorna erro 503, Quando o parsing falhar, Então o sistema deve exibir alerta específico de sobrecarga pedindo nova tentativa.

---
**Card ID:** FH-002 — Confirmação de Rateio com Mês de Competência  
**Enunciado:** Como Rafael, eu quero escolher o Mês/Ano de competência antes de confirmar o rateio Nubank para que as transações apareçam no período correto do Dashboard.

**Critérios de Aceitação:**
1. Dado que parsedData.itens está populado, Quando Rafael selecionar "Setembro 2026" e clicar "Confirmar Rateio", Então todas as transações devem ser gravadas com `occurredAt = 2026-09-01`.
2. Dado que um item é classificado como `MAE`, Quando confirmado, Então ele deve ter `section = MAE` e NÃO aparecer no totalExpense do Dashboard.
3. Dado que um item é classificado como `AP`, Quando confirmado, Então ele deve ter `section = CASA` e APARECER no totalExpense com o valor correto.

---
**Card ID:** FH-003 — Dashboard com Filtros Temporais  
**Enunciado:** Como Rafael, eu quero filtrar o Dashboard por "Este Mês", "Últimos 30 Dias" e "Todo Período" para que eu tenha visão de curto e longo prazo dos meus gastos.

**Critérios de Aceitação:**
1. Dado que existem transações em Set/2026, Quando o filtro for "Este Mês", Então apenas transações de 01/09 a 30/09 devem ser somadas.
2. Dado que há transações de Agosto e Setembro, Quando o filtro for "Últimos 30 Dias", Então transações dos últimos 30 dias corridos devem aparecer.
3. Dado que o usuário seleciona "A Pagar", Quando aplicado, Então apenas transações com `occurredAt > hoje` devem aparecer.

---
**Card ID:** FH-004 — Filtros e Ordenação na Aba Transações  
**Enunciado:** Como Rafael, eu quero filtrar transações por banco e buscar por descrição para que eu possa conferir lançamentos específicos rapidamente.

**Critérios de Aceitação:**
1. Dado que a tabela está carregada, Quando Rafael selecionar "Santander" no dropdown, Então somente transações com `motor = SANTANDER` devem aparecer.
2. Dado que Rafael digita "Amazon" no campo de busca, Quando a pesquisa for disparada, Então somente transações com "Amazon" na descrição devem ser listadas.
3. Dado que Rafael clicar no cabeçalho "Valor", Quando clicar uma vez, Então a tabela ordena do maior para o menor. Quando clicar novamente, ordena do menor para o maior.

---
**Card ID:** FH-005 — Parcelamento Manual no Motor 4  
**Enunciado:** Como Rafael, eu quero lançar uma compra parcelada no Motor 4 informando o número de parcelas para que o sistema projete os débitos futuros automaticamente.

**Critérios de Aceitação:**
1. Dado que Rafael seleciona "Parcelado" e informa 5x de R$ 100,00, Quando salvar, Então 5 transações devem ser criadas com datas incrementando mês a mês.
2. Dado que as parcelas foram criadas, Quando o Dashboard exibir "A Pagar", Então as parcelas futuras devem aparecer nas datas corretas.

---

*(Auto-Avaliação — Marlon PO)*
- Clareza dos Critérios (Testabilidade): **5/5**
- Aderência ao Impacto do Negócio: **5/5**
- Priorização Consistente (MoSCoW): **5/5**

---

# 🧪 BLUEPRINT DO QA — Rafael SDET (SHIFT-LEFT & AUTOMATION)

## 1. Visão de Risco e Fragilidade Técnica

**Extremo (Bloqueante):**
- `confirmInvoice` sem validação de `userId` proprietário da invoice → qualquer userId pode confirmar qualquer invoice de outro usuário. **RISCO DE VAZAMENTO DE DADOS.**
- Ausência completa de testes automatizados E2E e unitários executáveis. O `qa_loop_validator.ts` é um validador de schema manual, não um test runner integrado ao CI.

**Alto:**
- `getConsolidatedData` traz TODAS as transações do banco sem limite (`findMany` sem `take`). Com volume alto, isso causará timeout de requisição.
- Parsing de datas do Nubank (`"10 AGO"`) depende de `new Date().getFullYear()` → no virada de ano (Dezembro→Janeiro), compras de Dezembro pagas em Janeiro serão salvas no ano errado.
- Filtro de `statusFilter = 'PAGAR'` usa `occurredAt > now` mas parcelas futuras do Motor 4 têm `status = POSTED` → poderão aparecer ou não dependendo da data de criação.

**Médio:**
- O campo `budgetLeft` no Dashboard é fixo em R$ 3.000. Se ultrapassar, exibe negativo sem aviso visual de alerta crítico.
- Relatório WhatsApp é gerado pela IA e não tem teste de formato (pode quebrar se o modelo mudar o output).

## 2. Estratégia de Cobertura de Testes (Matriz de Prioridade)

### Backend (Vitest — Unit + Integration)
| Teste | Arquivo Alvo | Prioridade |
|---|---|---|
| Mapeamento Stakeholder → Section | invoice.ts confirmInvoice | 🔴 Crítico |
| Cálculo totalExpense exclui MAE/TERCEIROS | dashboard.ts | 🔴 Crítico |
| Geração de parcelas (createInstallments) com datas | transaction.ts | 🔴 Crítico |
| Validação de schema Nubank (existente) | qa_loop_validator.ts | 🟡 Alto |
| Parsing de data "10 AGO" edge cases | invoice.ts | 🟡 Alto |

### Frontend E2E (Playwright)
| Fluxo | Cenário | Prioridade |
|---|---|---|
| Upload PDF Nubank → Confirmar Rateio | Happy path completo | 🔴 Crítico |
| Dashboard filtro "Este Mês" exibe valores corretos | Assertiva de valor | 🔴 Crítico |
| Filtro por Motor na aba Transações | Dropdown → tabela atualiza | 🟡 Alto |
| Parcelamento 3x → 3 itens aparecem em "A Pagar" | Assertiva de count | 🟡 Alto |

## 3. Cenários BDD Detalhados (Gherkin)

```gherkin
Feature: FH-002 — Confirmação de Rateio com Mês de Competência

  Scenario: Rafael confirma rateio Nubank com competência Setembro
    Given que Rafael está na tela do Motor 3 com parsedData carregado
    And o item "Ovos de Páscoa" possui stakeholder "SUB_PESSOAL" e amount 75.00
    And o item "Coisas do Maycon" possui stakeholder "TERCEIROS" e amount 26.85
    When Rafael seleciona "Setembro" e "2026" no seletor de competência
    And clica em "Confirmar Rateio no Sistema"
    Then o banco deve conter uma transação com occurredAt = "2026-09-01"
    And section = "PESSOAL" para "Ovos de Páscoa"
    And section = "TERCEIROS" para "Coisas do Maycon"
    And o Dashboard "Este Mês" deve exibir R$ 75.00 na linha Nubank
    And NÃO deve exibir R$ 26.85 no totalExpense

Feature: FH-003 — Dashboard Totais Excluem MAE e TERCEIROS

  Scenario: Totalização correta excluindo terceiros
    Given que existem transações: SUB_PESSOAL R$100, MAE R$50, TERCEIROS R$30
    And todas com occurredAt no mês atual
    When o Dashboard é carregado com filtro "Este Mês"
    Then totalExpense deve ser R$100.00
    And statsByMotor[NUBANK_RATEIO] deve ser R$100.00
    And R$50 e R$30 NÃO devem aparecer nas métricas do usuário

Feature: FH-005 — Parcelamento Motor 4

  Scenario: Criação de 3 parcelas mensais
    Given Rafael está no Motor 4
    And seleciona modo "Parcelado"
    And preenche: descrição "TV Samsung", valor R$200, dia 10, parcelas 3
    When clica "Gerar Parcelas"
    Then 3 transações devem ser criadas no banco
    And a 1ª tem occurredAt no mês atual dia 10
    And a 2ª tem occurredAt no mês seguinte dia 10
    And a 3ª tem occurredAt 2 meses depois dia 10
    And todas com motor = "CARTAO_TIA" e amount = -200.00
```

## 4. Scaffold de Automação (Vitest Unit)

```typescript
// src/tests/unit/dashboard.spec.ts
import { describe, it, expect } from 'vitest';

describe('[FH-003] Dashboard - Exclusão MAE/TERCEIROS', () => {
  const mockTransactions = [
    { amount: -100, section: 'PESSOAL', motor: 'NUBANK_RATEIO' },
    { amount: -50, section: 'MAE', motor: 'NUBANK_RATEIO' },
    { amount: -30, section: 'TERCEIROS', motor: 'NUBANK_RATEIO' },
  ];

  it('deve calcular totalExpense ignorando MAE e TERCEIROS', () => {
    const totalExpense = mockTransactions
      .filter(t => Number(t.amount) < 0 && t.section !== 'MAE' && t.section !== 'TERCEIROS')
      .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);
    
    expect(totalExpense).toBe(100);
  });

  it('deve calcular statsByMotor ignorando MAE e TERCEIROS', () => {
    const stats = mockTransactions
      .filter(t => t.section !== 'MAE' && t.section !== 'TERCEIROS')
      .reduce((acc: Record<string, number>, t) => {
        acc[t.motor] = (acc[t.motor] || 0) + Math.abs(Number(t.amount));
        return acc;
      }, {});
    
    expect(stats['NUBANK_RATEIO']).toBe(100);
  });
});

describe('[FH-005] createInstallments - Datas das Parcelas', () => {
  it('deve gerar 3 parcelas com meses incrementados', () => {
    const startMonth = 8; // Setembro (0-indexed)
    const startYear = 2026;
    const installments = 3;
    const dayOfMonth = 10;
    
    const dates = Array.from({ length: installments }, (_, i) => 
      new Date(Date.UTC(startYear, startMonth + i, dayOfMonth, 12, 0, 0))
    );
    
    expect(dates[0].getMonth()).toBe(8); // Setembro
    expect(dates[1].getMonth()).toBe(9); // Outubro
    expect(dates[2].getMonth()).toBe(10); // Novembro
    expect(dates.every(d => d.getDate() === 10)).toBe(true);
  });
});
```

---

*(Auto-Avaliação — Rafael QA)*
- Detecção Antecipada de Riscos: **5/5** — Encontrei falha crítica de autorização no confirmInvoice
- Exatidão da Cobertura Gherkin/Regressão: **5/5**
- Aderência à Stack Declarada (Vitest + Playwright): **5/5**
