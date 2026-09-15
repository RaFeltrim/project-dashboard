# Finance Hub — RESOLUCAO_SPRINT01.md
> **Persona:** Sofia — CIAO (Chief Intelligence & AI Officer)  
> **Sprint Avaliada:** Sprint 1 — Fundação + Core Engines  
> **Data:** Setembro 2026

---

# 🦅 RESOLUÇÃO EXECUTIVA DA CIAO

**Veredito Oficial:** ✅ APROVADA COM RESSALVAS CRÍTICAS

---

## 1. O Racional Executivo

A Sprint 1 entregou valor de negócio real e mensurável. O core de extração inteligente via IA (Motores 2 e 3), o rateio de apartamento com segregação de stakeholders (MAE/TERCEIROS), e os filtros temporais do Dashboard estão funcionais e bem arquitetados. A decisão de usar tRPC com tipagem end-to-end garante um contrato sólido entre Frontend e Backend — decisão premium de Tech Lead que aprovo integralmente.

**Contudo, identifico 2 (duas) ameaças de Risco Extremo que IMPEDEM qualquer raciocínio de Produção:**

### 🔴 DIRETRIZ BLOQUEANTE #1 — Falha de Autorização no `confirmInvoice`
O endpoint `confirmInvoice` recebe `invoiceId` e `userId` no body da requisição, mas **não valida se o `userId` do token de sessão é o proprietário da invoice**. Qualquer usuário autenticado pode confirmar a fatura de outro usuário simplesmente conhecendo o `invoiceId`. Este é um vazamento de dados crítico — LGPD violation em potencial.

**Ação Requerida:** João-Backend deve adicionar verificação `invoice.userId !== session.userId → throw FORBIDDEN` antes de processar qualquer mutation sensível.

### 🔴 DIRETRIZ BLOQUEANTE #2 — Zero Cobertura de Testes Automatizados
O `qa_loop_validator.ts` é um validador de schema isolado — útil, mas não é um test runner real integrado ao `package.json`. O `vitest` está instalado nas devDependencies mas sem nenhum arquivo `.spec.ts` ou `.test.ts` criado. O projeto entra em produção sem rede de segurança de regressão.

**Ação Requerida:** Rafael-QA deve implementar os scaffolds do `SPRINT_01.md` como arquivos Vitest reais e registrar o script `"test": "vitest run"` no `package.json`. Sem isso, nenhum merge para `main` é autorizado.

---

## 2. Ação Requerida — Próximos Passos do Esquadrão

**João-Backend (Prioridade Bloqueante):**
- [ ] Adicionar verificação de propriedade de `invoice` em `confirmInvoice` usando a sessão autenticada
- [ ] Implementar `cursor-based pagination` em `transaction.getAll` (take + cursor input)
- [ ] Substituir filtro hardcoded `section !== "MAE"` por parâmetro configurável `excludedSections[]`

**Rafael-QA (Prioridade Bloqueante):**
- [ ] Criar `src/tests/unit/dashboard.spec.ts` com os cenários BDD mapeados
- [ ] Criar `src/tests/unit/installments.spec.ts` para valiar datas das parcelas
- [ ] Adicionar script `"test": "vitest run"` no `package.json`
- [ ] Registrar `"test:e2e": "playwright test"` como passo futuro de pipeline

**Beatriz-TL (Prioridade Alta):**
- [ ] Revisar e aprovar todos os PRs após os fixes do João e Rafael
- [ ] Garantir que o `prisma.$transaction` em `confirmInvoice` está cobrindo todos os rollbacks necessários

**Fabio-Frontend + Laura-UIUX (Prioridade Alta — Sprint 2):**
- [ ] Implementar skeleton loaders em todos os componentes do Dashboard e Transações
- [ ] Integrar `recharts` para gráfico de barras (historyByMonth) e rosca (statsByMotor)
- [ ] Responsividade: Menu hambúrguer no mobile, tabelas com scroll horizontal protegido

**Camila-DevOps (Prioridade Média — Sprint 2):**
- [ ] Configurar GitHub Actions: `lint → test → build` a cada Pull Request para `main`
- [ ] Configurar deploy automático na Vercel após aprovação na branch `main`

**Emerson-DE (Prioridade Média):**
- [ ] Migrar `totalExpense` de JS reduce para Prisma `aggregate` com `_sum` nativo
- [ ] Migrar `statsByMotor` para Prisma `groupBy` com `_sum(amount)`

---

## 3. Diretriz Operacional de Nuvem

Vercel deploy SUSPENSO até resolução dos Bloqueantes #1 e #2.

Após aprovação dos fixes pela Beatriz-TL e publicação no GitHub:
1. Acesse `vercel.com` → Projeto `finance-hub`
2. Vá em **Settings → Environment Variables**
3. Confirme que `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `GEMINI_API_KEY` estão configuradas no ambiente `Production`
4. Clique em **Deploy → Trigger Deployment** na branch `main`

---

## 4. CIAO Directives Finais (Leis Perenes do Projeto)

> Estas diretivas são inegociáveis e se aplicam a todas as Sprints futuras:

1. **Toda mutation tRPC sensível DEVE validar que `session.userId === recurso.userId`** antes de executar.
2. **Nenhum merge para `main` sem ao menos 1 teste Vitest passando** para cada nova feature backend.
3. **Nenhuma chamada IA (Gemini) sem schema de validação estruturado** (como o NUBANK_SCHEMA e SANTANDER_SCHEMA existentes).
4. **O Dashboard NUNCA deve carregar transações sem `take` limit** — proteção contra degradação de performance.
5. **Cada Sprint termina com atualização do `KNOWLEDGE_BASE.md`** com os learnings e bugs resolvidos.

---

*Sofia — CIAO | Finance Hub | Sprint 1 | Setembro 2026*
