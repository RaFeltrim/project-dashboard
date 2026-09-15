# Finance Hub — KNOWLEDGE_BASE.md
> **Atualização Contínua:** A cada Bug resolvido ou Decisão Crítica, este arquivo é atualizado.  
> **Responsável:** Beatriz-TL / Toda a equipe  

---

## 🐛 Bugs Resolvidos

### BUG-001 — Nubank não aparecia no Dashboard
**Sprint:** 1  
**Causa:** As transações confirmadas do Nubank eram gravadas com a data original da compra (ex: `10 AGO`), que caía em meses anteriores. O filtro `THIS_MONTH` do Dashboard não as capturava.  
**Solução:** Implementado seletor de "Mês de Competência" na tela do Motor 3. O usuário escolhe o mês/ano e todas as transações são gravadas com `occurredAt = 01/{mês}/{ano}`.  
**Arquivos afetados:** `invoice.ts (confirmInvoice)`, `nubank-rateio/page.tsx`

---

### BUG-002 — Transações Duplicadas (Santander e Nubank)
**Sprint:** 1  
**Causa:** PDF lido múltiplas vezes ou regex capturava linhas duplicadas da fatura.  
**Solução:** Script `scripts/deduplicate.ts` — elimina transações com mesmo `motor + dia + amount`. Mantém a com descrição mais longa (inclui parcela ex: "01/03").  
**Arquivos afetados:** `scripts/deduplicate.ts` (novo)

---

### BUG-003 — Gastos da Mãe e Terceiros inflavam o totalExpense
**Sprint:** 1  
**Causa:** Todos os itens da fatura Nubank (incluindo MAE e TERCEIROS) eram somados no totalExpense do Dashboard.  
**Solução:** Adicionado `MAE` e `TERCEIROS` ao enum `ExpenseSection`. No `confirmInvoice`, mapeamos o stakeholder da IA para a Section. No `dashboardRouter`, filtros excluem `section !== "MAE" && section !== "TERCEIROS"`.  
**Arquivos afetados:** `schema.prisma`, `invoice.ts`, `dashboard.ts`

---

### BUG-004 — Dados históricos do AP injetados com valor inteiro (não meia)
**Sprint:** 1  
**Causa:** Script `seed-ap.ts` injetou os valores totais das contas fixas (Aluguel, Energia, etc.) sem dividir pela metade (Rafael paga 50%).  
**Solução:** Script `scripts/deduplicate.ts` detecta os valores "grandes" conhecidos e divide por 2 automaticamente.  
**Arquivos afetados:** `scripts/deduplicate.ts`, `scripts/seed-ap.ts`

---

## 📐 Decisões de Arquitetura Tombadas

### DECISÃO-001 — Timezone nas datas (Seeders)
**Decisão:** Datas em scripts de seed devem usar `T12:00:00Z` (meio-dia UTC) para evitar que timezone `-03:00` (Brasília) faça a data recuar para o dia anterior no banco.  
**Regra:** NUNCA usar `new Date('2026-03-05')` em seeds. SEMPRE usar `new Date('2026-03-05T12:00:00Z')`.

---

### DECISÃO-002 — Motor Nubank usa `section` em vez de `categoryId`
**Decisão:** A classificação de stakeholder (SUB_PESSOAL, AP, TERCEIROS, MAE) é salva no campo `section` da transaction, não na tabela `Category`. Isso evita criação de categorias fantasmas no banco.  
**Mapeamento:** SUB_PESSOAL → PESSOAL | AP → CASA | TERCEIROS → TERCEIROS | MAE → MAE

---

### DECISÃO-003 — Paginação (Pendente)
**Decisão:** O endpoint `transaction.getAll` atualmente usa `take: 100` como limite fixo. Isso é aceitável no MVP, mas em Sprint 2 deve ser migrado para cursor-based pagination com parâmetros `cursor` e `limit`.  
**Status:** ⏳ Pendente — João-Backend

---

### DECISÃO-004 — Cálculos no JavaScript vs SQL
**Decisão atual:** `totalExpense`, `statsByMotor` e agrupamentos temporais são calculados em JavaScript após o `findMany`. Isso funciona com volume baixo (<500 transações/mês).  
**Decisão futura:** Migrar para `prisma.transaction.aggregate` e `prisma.transaction.groupBy` em Sprint 2 (Emerson-DE).

---

## ⚠️ Riscos Ativos

| ID | Risco | Probabilidade | Impacto | Ação |
|---|---|---|---|---|
| R-001 | `confirmInvoice` sem validação de propriedade | Alta | Crítico (LGPD) | João-Backend — Sprint 2 |
| R-002 | Zero cobertura Vitest | Alta | Alto | Rafael-QA — Sprint 2 |
| R-003 | Parsing de data Nubank falha na virada de ano | Média | Médio | João-Backend — Sprint 3 |
| R-004 | API Gemini 503 não tem retry automático | Média | Médio | Mariana-Prompt — Sprint 2 |
