# 📱 Estratégia Mobile-First e Análise de UX/UI (V5.0)

**Autoria Principal:** Dev Mobile SR (Especialista Frontend & Performance)
**Colaboradores:** PM, PO e TL
**Objetivo:** Analisar as entregas atuais e os próximos passos do MKP Flow (com foco especial na nova feature de "Gap Intelligence IA") sob a ótica restrita da usabilidade mobile e performance em dispositivos móveis.

---

## 🏛️ Reunião de Alinhamento (Kick-off Mobile)

### 👨‍💼 Visão do Negócio (PM & PO)
**A Dor:** O gestor das lojas precisa conseguir aceitar sugestões da Inteligência Artificial ou olhar se um preço está canibalizado de dentro do Uber, no meio de uma viagem de negócios (telas estreitas de 390px, redes possivelmente lentas, operando com o polegar).
**A Regra:** *A tela não pode causar acidentes.* Se o botão de "Aceitar Sugestão da IA" for muito perto do botão "Descartar", um clique acidental pode lançar uma tarefa errada no Kanban.

### 🏗️ Visão da Arquitetura (Tech Lead)
**O Desafio:** A Qwen Max vai cuspir até 50 sugestões de GAPs cruzando 3 Lojas Oficiais. Trazer isso para o Client-Side e renderizar 50 *Cards de Glassmorphism* de uma vez numa thread de bateria fraca de celular vai congelar a aba do Safari/Chrome mobile do cliente. O DOM vai inchar absurdos se não formos cuidadosos. O React pode se afogar nesses re-renders se houver mutação de filtro.

### 📱 A Solução Tática (Dev Mobile SR)
Como responsável pela UX extrema, aqui estão as leis que aplicarei sobre a arquitetura acima:

#### 1. Prevenção de "Wasted Renders" e Virtualização (TL + Dev Mobile SR)
Para mitigar a injeção fatal na main thread Mobile, o *Grid de Sugestões de IA* (US 7.7) será construído puríssimo, deixando a responsabilidade de memoização nativa pro React Compiler trabalhar de forma gratuita.
- **Se a IA de GAP retornar +20 sugestões:** Eu corto o loop normal do React (`map`) e embuto uma **Virtual Window** (`Windowing` simplificado manual com paginação assíncrona on-scroll) e limito a 5 cards DOM renderizados por vez. Sem congelamentos no scroll vertical.

#### 2. Ergonomia de Interface: O Botão Giga & Thumb Zone
Concordo com o PM. O MKP Flow é rico e exige precisão. Nas Listagens de Gaps e Kanban (Sprint 7 e atual), impus a regra do `mínimo 44x44px`:
- Áreas de "Descartar Insight" ou "Criar Tarefa" na UI do celular terão margens internas (`padding: 12px 16px`) expandindo o `Hitbox` sem necessariamente poluir o visual `Glass`.
- Menu de opções crítico em listas passará de botões na linha para *Swipe Actions* ou *Bottom Sheets* customizadas futuramente.

#### 3. Sobrevida de Bateria vs Estética (Filtros Inteligentes)
Aplicações "App-like Web" sugam bateria com `backdrop-filter: blur(x)`. Na nossa classe CSS `.mobile-kpi-grid` e nos próximos cards da IA, os filtros blur pesados do Glassmorphism são rebaixados ligeiramente em dispositivos `< 768px` por *Media Queries*, aliviando a GPU Mobile sem que o Gestor sinta degradação primária do design.

---

## 🏃‍♂️ Ação Imediata (Para a Sprint 7 - Fase B)

A UI do Painel "Sugestões Inteligentes" que vai brotar da Qwen obedecerá à planta baixa:
- **Telas `< 600px`:** Cards de Gap Intelligence exibidos em pilha (`flex-direction: column`).
- **Telas `> 600px`:** Duas colunas, mas mantendo a zona de leitura no centro.
- **Micro-Interação:** Ao clicar em "Aceitar Gap" (US-7.9), a Task não recarrega a tela, ela levanta um Toast `fixed, bottom: 20px, left: 10px` para ser alcançado facilmente pelo polegar informando "Task Criada!".
 
---
*Documentado pela célula de Experiência Mobile da Orquestração.*
