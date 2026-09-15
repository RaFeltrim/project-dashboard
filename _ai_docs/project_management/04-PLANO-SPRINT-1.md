# Plano Sprint 1 — Dashboard Financeiro

Janela da sprint: 2026-04-07 a 2026-04-11
Objetivo: entregar MVP com autenticacao, despesas e dashboard de resumo

## Escopo da sprint
- Base do projeto web
- Autenticacao
- CRUD de despesas
- Dashboard com indicadores essenciais
- Baseline de testes e pipeline

## Caminho critico
1. Setup do projeto
2. Schema e migracoes
3. Autenticacao
4. API tRPC de despesas
5. Formulario de cadastro/edicao
6. Dashboard consumindo dados reais
7. Testes e quality gate

## Plano diario
### Dia 1
- Setup da aplicacao
- Definicao de padroes e estrutura
- ADR inicial de dados

### Dia 2
- Schema Prisma + migracoes
- Setup de autenticacao

### Dia 3
- Implementacao do router de despesas
- Implementacao do formulario com validacao

### Dia 4
- Dashboard de indicadores + listagem
- Ajustes de UX e mensagens de erro

### Dia 5
- Testes unitarios/integracao essenciais
- Pipeline minimo lint/test/build
- Reuniao de prontidao para proxima sprint

## Criterios de pronto da sprint
1. Usuario consegue autenticar.
2. Usuario consegue criar, listar, editar e remover despesas.
3. Dashboard mostra saldo, total receitas e total despesas.
4. Validacao bloqueia dados invalidos nos dois lados.
5. Testes minimos executam com sucesso no pipeline.

## Nao entra nesta sprint
1. Integracao bancaria.
2. Exportacao PDF avançada.
3. Analiticos avançados e previsoes.

## Dependencias externas
1. Definicao final de ambiente alvo de deploy.
2. Confirmacao de politicas de secrets por ambiente.
