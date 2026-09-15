# 💻 Documentação de Desenvolvimento e Arquitetura

**Autoria:** TL (Tech Lead) e Desenvolvedores Sêniores  
**Objetivo:** Centralizar padrões de código, fluxos de arquitetura e decisões de engenharia para o time de Dev.

---

## 🏗️ Topologia da Arquitetura (MERN + Supabase)

### Frontend (React 19 + Vite)
- **State Management:** Desacoplado do Redux. Utilizamos Context API (`AuthContext`, `DataContext`) plugados via Event Listeners do `supabase.channel` (Realtime Postgres).
- **Estilização:** Vanilla CSS Modules / Global CSS variables (Glass UI Dark Mode). Não utilizamos Frameworks pesados como Tailwind ou Bootstrap para manter o CSS Parsing Runtime em sub-20ms. Componentes flexíveis protegidos por Media Queries puras (`.mobile-col`, `.mobile-scroll-x`).

### Backend (Node.js + Edge Functions)
- **RPA Motor Local:** Express na porta `3001` rodando *Playwright Chromium* headless para o Web Harvesting (Marketplaces). Protegido por autenticação de Token, CORS restrito e **rate limiting** (`express-rate-limit`: scrapeLimiter 10 req/min, aiLimiter 20 req/min). Extrai dom DOM e converte para JSON em memória.
- **Qwen AI Proxy:** Endpoint `POST /api/ai/generate` serve como proxy server-side para a API Qwen (Alibaba DashScope). A chave `DASHSCOPE_API_KEY` nunca sai do servidor. O client (`callQwen.js`) consome apenas o proxy local.
- **Cloud Motor (Serverless):** O Supabase serve o Backend primário com Edge Functions Deno para receber Webhooks OAuth (ML/Shopee). Webhook ML verifica assinatura HMAC `x-signature` antes de processar.

## 🧠 AI Engine (Qwen Integration)
- A lógica de Prompt está encapsulada nos hooks customizados e services isolados (`/src/lib/qwen-api.js`). 
- **Memoização de Inteligência:** Se uma copy já foi gerada para um SKU, a SDK não bate apanha na China (Qwen). O resultado está em cache no *Database* (`content` JSONB da coluna `products`).

## 📜 Padrões de Código

1. **SOLID & Pure Components:** Telas (Ex: `Pipeline.jsx`) não misturam chamadas de banco. Elas consomem o Contexto puramente.
2. **Defensive Code (Error Boundaries):** O frontend não quebra diante de um undefined. Usamos Optional Chaining `?.` e Nullish Coalescing `??` intensamente. Se a API falhar visualmente, exibe Toast Error e volta para a UI Fallback Offiline.
3. **Hardening:** Nunca confie no Front. O Backend (mesmo o Express RPA local) rejeita acessos se o Origin Header não for o Front end oficial, além de barrar requisições C/Token Inválido enviando `403 Forbidden`.
