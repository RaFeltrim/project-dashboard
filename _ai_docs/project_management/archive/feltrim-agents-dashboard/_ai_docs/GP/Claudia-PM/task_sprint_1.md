# 🎯 Backlog V5.0: Sprint 1 - Cloud Sync (Fundação Supabase)

## Story 1.1: Autenticação em Nuvem (Supabase Auth)
- [x] Criar o cliente de conexão Supabase (`src/lib/supabase.js`).
- [x] Adicionar placeholders no `.env` para `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [x] Criar tela simples de Login e proteger as rotas principais no `App.jsx`.

## Story 1.2: Modelagem do Database
- [x] Criar o script SQL `supabase_schema.sql` com as tabelas de `products`, `tasks`, `pipeline`, etc. e a estrutura de Role-Based Access Control (RLS).
- [x] O PO/Dev deve executar este script na interface SQL do Supabase.

## Story 1.3: Migração de Persistência (React State)
- [x] Substituir as instâncias de `useLocalStorage` na raiz do `App.jsx` por chamadas assíncronas padrão (CRUD) ou hooks de cache usando a API `supabase.from()`.
- [x] Sincronizar criação de tasks e pipeline em tempo real com o backend.
