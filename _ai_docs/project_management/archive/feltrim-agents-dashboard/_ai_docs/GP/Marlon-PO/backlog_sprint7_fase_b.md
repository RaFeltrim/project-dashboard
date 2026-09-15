# 📋 Backlog de Operação: Sprint 7 (Fase B) & Sprint 3 (Remanescente)

**Autoria:** PM (Product Manager) e PO (Product Owner)  
**Objetivo:** Detalhar as User Stories (US) pendentes e desbloqueadas para que Desenvolvimento (TL/Dev) e Qualidade (QA/SDET) atuem em formato *Shift-Left*, entregando o **Motor de Gap Intelligence (IA)** e finalizando o **Pipeline de CI/CD**.

---

## 🚀 ÉPICO: Gap Intelligence IA (Sprint 7 - Fase B)

A Fase B visa transformar os dados puros extraídos pelo Scraper (Fase A) em **Inteligência Acionável de Negócios**, utilizando a IA (Qwen Max) para cruzar os portfólios das empresas (Made in Vale, Sinal, Univerza) com as restrições de nicho de cada uma.

### 📝 US-7.6: Motor Backend de Análise de Nicho (Qwen Prompting)
**História:** Como Estrategista de Vendas, quero que o backend envie os produtos extraídos via scraper para a API da IA, cruzando-os com as regras de nicho de cada Loja Oficial, para descobrir incompatibilidades ou potenciais de venda perdidos.
- **Regras de Negócio (PO):** 
  - A IA deve respeitar que a *Made in Vale* vende APENAS nicho Pet e Fazenda.
  - A IA deve respeitar que a *Sinal* vende APENAS nichos Eletrônicos, Áudio e Instrumentos.
  - A IA deve sugerir que produtos da MIV/SIN sejam replicados para a *Univerza* (que é multidepartamento), calculando margem ideal (ex: +20% se for para a Univerza).
- **Critérios de Aceite (QA / Shift-Left):**
  - [ ] Dado um JSON de produtos variados, o motor deve retornar um JSON estruturado contendo apenas as `suggestions`.
  - [ ] Deve existir um teste unitário (`vitest`) mockando o retorno da IA e garantindo que o motor não quebre se a API da Qwen falhar (Error Handling / Fallback).
- **Notas Técnicas (DEV):** Criar `src/server/ai-gap-engine.js` exportando a função de prompt massivo para a SDK da OpenAI/Qwen no backend.

### 📝 US-7.7: Painel "Sugestões Inteligentes" na UI Catálogo
**História:** Como Gestor, quero visualizar as sugestões geradas pela IA diretamente no meu Catálogo ou Otimizador, recebendo recomendações claras do que fazer com cada gap de mercado.
- **Regras de Negócio (PO):**
  - A interface deve exibir *Badges* (ex: "Transferir para Univerza", "Nicho Incorreto").
  - Deve mostrar a justificativa resumida gerada pela IA.
- **Critérios de Aceite (QA / Shift-Left):**
  - [ ] O painel deve ser *Mobile-Friendly* (Grid responsivo, aderente à Sprint 8).
  - [ ] Injetar o estado mockado contendo as sugestões e validar se a UI renderiza corretamente através do *Playwright*.

### 📝 US-7.8: Cross-Company Arbitrage (Cruzamento de Preços)
**História:** Como Gestor Financeiro, quero que o gap visual também me avise se o mesmo produto está com preços canibalizados entre as 3 empresas (ex: Sinal vendendo mais barato que Univerza no mesmo Marketplace).
- **Regras de Negócio (PO):**
  - Adicionar no prompt da Qwen uma regra para verificar matriz de preços entre MIV x SIN x UNV.
- **Critérios de Aceite (QA):**
  - [ ] Dado dois produtos idênticos com preços diferentes no JSON injetado, a UI deve mostrar um Alerta de Canibalização.

### 📝 US-7.9: Exportar Sugestões para Kanban de Tarefas
**História:** Como PO, quero poder transformar uma sugestão brilhante da IA em um ticket rastreável na "Fila de Tarefas" (Pipeline/Kanban) com apenas um clique.
- **Regras de Negócio (PO):**
  - Ao clicar em "Aceitar Sugestão", o sistema cria uma Task no Supabase atrelada à Loja sugerida.
- **Critérios de Aceite (QA):**
  - [ ] Teste E2E (Playwright): Clicar no botão "Aceitar Sugestão" e verificar se o contador de Tarefas no Dashboard aumentou de forma reativa (Supabase Realtime).

---

## 🛠️ ÉPICO: Finalização do Hardening CI/CD (Sprint 3)

### 📝 US-3.3: Webhooks de Health Alerts (Build Automation)
**História:** Como Tech Lead, quero que falhas críticas na esteira do GitHub Actions notifiquem o time via Webhook (Discord ou Slack), para que nenhum "código quebrado" passe despercebido.
- **Requisição (DEV):** Modificar o arquivo `.github/workflows/notify.yml` (e possivelmente injetar `secrets`) para fazer um POST em um webhook externo quando o Job de Testes falhar.
- **Critérios de Aceite (QA):** 
  - [ ] Forçar um teste a falhar numa branch isolada e confirmar nos logs do Actions se o passo de "Notify Discord/Slack" foi engatilhado com sucesso.

---
*Gerado por:** PM & PO Desk (MKP FLOW V5.0)*
