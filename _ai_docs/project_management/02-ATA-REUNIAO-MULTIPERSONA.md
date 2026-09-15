# ATA — Reuniao Multiagente (Alta Prioridade)

Data: 2026-04-07
Projeto: Dashboard Financeiro
Formato: Sessao de analise e planejamento com framework Feltrim

## Participantes
- Marlon-PO
- Claudia-PM
- Beatriz-TL
- Joao-Backend
- Emerson-Supabase
- Pedro-DBA
- Fabio-Frontend
- Laura-UI
- Rafael-QA
- Camila-DevOps
- Sofia-CIAO (auditoria executiva)

## Convergencias
1. MVP deve priorizar autenticacao, CRUD de despesas e visao de saldo.
2. Validacao precisa ser simetrica entre frontend e backend (Zod).
3. Isolamento por usuario e seguranca de sessao sao obrigatorios desde o inicio.
4. Pipeline minimo com gates de qualidade deve entrar ainda no Sprint 1.
5. Projeto precisa de trilha clara de deploy com rollback documentado.

## Divergencias
1. Camada de dados:
- Posicao A: Prisma predominante para produtividade.
- Posicao B: maior uso de Supabase SQL para controle de RLS/performance.
Resolucao: abordagem hibrida com decisao ADR formal.

2. Renderizacao:
- Posicao A: SSR desde inicio.
- Posicao B: SPA primeiro para reduzir complexidade inicial.
Resolucao: iniciar com SPA + API protegida; reavaliar SSR apos metricas.

3. Escopo da Sprint 1:
- Posicao A: incluir receitas e contas completas.
- Posicao B: focar somente despesas no primeiro corte.
Resolucao: despesas no nucleo do Sprint 1; receitas/contas entram na esteira seguinte.

## Riscos destacados
1. Vazamento de segredo por configuracao incorreta de ambiente.
2. Cobertura de testes insuficiente para fluxo critico.
3. Falha de ownership em update/delete de registros.
4. Scope creep durante a implementacao da UI.

## Action Items (com dono e data)
1. Formalizar ADR de dados (Prisma hibrido com Supabase/RLS)
Dono: Beatriz-TL + Emerson
Data: 2026-04-08

2. Congelar escopo de Sprint 1 no P0 da task-list
Dono: Marlon-PO + Claudia-PM
Data: 2026-04-07

3. Montar base do projeto e iniciar implementacao tecnica
Dono: Fabio-Frontend + Joao-Backend
Data: 2026-04-07

4. Definir checklist de release/rollback
Dono: Camila-DevOps + Rafael-QA
Data: 2026-04-09

5. Revisao executiva de prontidao
Dono: Sofia-CIAO
Data: 2026-04-11

## Decisoes pendentes de Rafael
1. Confirmar estrategia de hospedagem inicial:
- Opcao A: Vercel + Supabase
- Opcao B: VPS com deploy containerizado

2. Confirmar objetivo de curto prazo:
- Opcao A: MVP funcional interno
- Opcao B: MVP pronto para piloto externo

3. Confirmar politica de custo mensal alvo para a stack inicial.

## Encaminhamento final
Aprovado iniciar o projeto imediatamente com execucao focada em P0, mantendo governanca por task-list, gate de qualidade e auditoria executiva antes de release.
