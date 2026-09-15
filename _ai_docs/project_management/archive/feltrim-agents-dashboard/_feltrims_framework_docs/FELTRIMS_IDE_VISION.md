# 🚀 FELTRIM'S AI IDE / FRAMEWORK EXTENSION — VISION DOCUMENT
> **Status:** Draft de Planejamento Estratégico e Viabilidade
> **Codinome:** Feltrim IDE (ou Extensão Antigravity)

O **Feltrim's Framework (FF)**, devido à sua ontologia baseada em pastas, perfis equitativos (50/50), papel C-Level (CIAO) e abordagem Shift-Left, possui o formato perfeito para se transformar numa IDE (ou numa Extensão Deep-Integrated) de desenvolvimento AI-First de alto calibre.

Este documento planeja o roteiro para transformar a abstração lógica do FF numa Ferramenta Real e Automatizada (IDE Inteligente).

---

## 🧭 1. Modelo de Implementação (O Dilema: Extensão vs. IDE Própria)

### Opção A: Extensão Antigravity (VS Code / Cursor / Windsurf based)
*   **Vantagem:** Menor fricção inicial. Aproveita o ecossistema existente de debuggers, extensões de syntax highlight e LSP (Language Server Protocol).
*   **Como funciona:** Um plugin/extensão que injeta a "Pasta de Agentes" (`_ai_docs`) e cria uma aba lateral Customizada. Nessa aba, em vez de um "Chat Genérico", o usuário vê o *Esquadrão* (Rafael, Laura, Emerson, Sofia).
*   **Viabilidade:** Rápida entrada no mercado (Time-to-market). Permite tracionar os primeiros Heavy Users adotantes do Feltrim's Framework.

### Opção B: Feltrim IDE (Standalone AI IDE)
*   **Vantagem:** Domínio total sobre o ciclo de vida e a interface (Modos de Velocidade, Roteamento Automático de PRs e Bloqueio rígido de comandos por patentes/personas).
*   **Como funciona:** Um *Fork* do ambiente Electron (como VS Code VSCodium) construído nativamente usando as premissas do FF. A IDE por concepção só inicia um projeto após a Inception (Ata do PM e PO). A própria IDE dita a qualidade (A IDE reprova seu código se não tiver testes — o QA Rafael te bloqueia).
*   **A Abordagem Escolhida (A Caminho da IDE):** A ideia inicial formidável do autor (Rafael Feltrim) propõe uma IDE/Ambiente completo com *Switches Automáticos*. 

---

## ⚙️ 2. Core Mechanics: Os "Auto-Switches" de Ciclo de Vida do Projeto

Para que a IDE opere sob as diretrizes do Feltrim's Framework, ela deve entender e alterar seu comportamento dependendo do *"Age do Projeto"* (Ciclo de Vida).

### Estado 01: INCEPTION MODE (Modo de Criação/Geração do Zero)
Ocorre quando a pasta está vazia e estamos lidando *apenas* com intenções e vontades do Stakeholder.
*   **IAs Ativadas:** `Marlon-PO`, `Claudia-PM`, `Aline-ARCH`, `Laura-UIUX`.
*   **Comportamento da IDE:** A janela principal de código está bloqueada 🔒. A área ativa é um Canvas/Whiteboard de Design. O Stakeholder (Humano) conta sua ideia. A CLI (Terminal) não pode rodar comandos.
*   **Métrica de Transição:** O Estado 01 termina no evento de `Stakeholder Sign-off` (O "Ok Certeiro"). 

> **A Ciência do "Ok Certeiro":** O Stakeholder não lê código. O `Ok Certeiro` num fluxo AI-Native acontece quando os agentes geraram: 
> 1) O _User Story Mapping_ (Funcionalidades).
> 2) O _Budget Target_ estimado (Quanto vai custar a nuvem).
> 3) Os *Figma Mockups/Wireframes* gerados sinteticamente pelas IAs.
> Ao assinar o "Ok", a IDE destrava o código e transita de fase.

### Estado 02: DEVELOPMENT/FAST MODE (Modo de Codificação Habilitado)
O projeto ganhou pernas e entra em regime industrial.
*   **IAs Ativadas:** `Joao-BACKEND`, `Fabio-FRONTEND`, `Cleber-MOBILE`, `Mariana-PROMPT`, `Emerson-DE`.
*   **Comportamento da IDE:** A janela do chat normal aparece. A cada _"Make this"_ do programador, a IDE invoca os desenvolvedores sem perguntar. A IDE entende o switch "Fast": foca em entregar arquivos brutos compiláveis de `src/`, suprimindo logs excessivos e apenas gerando o Delta Diferencial de Código.
*   **Métrica de Transição:** A cada final de "Sprint Funcional", a IDE paralisa a produção em velocidade para auditar o ciclo.

### Estado 03: DEFENSE/PLAN MODE (Modo de Refino e Shift-Left)
A IDE congela a entrega de novas features até que Débitos Técnicos sejam sanados pelos peritos.
*   **IAs Ativadas:** `Rafael-QA`, `Pedro-DADOS`, `Camila-DEVOPS`.
*   **Comportamento da IDE:** Ao mudar o Switch para `PLAN`, a IDE varre a base de código rodando Playwright, escaneando Table Scans Lentos no banco de dados e verificando Custo de Nuvem local.
*   **Métrica de Transição:** Só destrava a volta ao "Estado 02" após a Geração e Aprovação de um *Relatório Geral de Cobertura de Testes*.

### Estado 04: THE CIAO ROOM (Modo Executivo - Board Room)
A "Reunião de Mesa Redonda". O fim do ciclo de entrega.
*   **IA Ativada:** `Sofia-CIAO` e o Time Titular.
*   **Comportamento da IDE:** Assimétrica. Ela simula o *Merge Request* (PR). A IDE compila os dados e `Sofia-CIAO` cruza a meta do "Modo 01" com o código final aprovado no "Modo 03". 
*   **The Go-Live (Sustentação):** Se houver 100% de convergência entre Requisitos, Desempenho e Segurança Tática (FF Cultura), a IDE aprova o Merge na Branch Remota (Push Auto).

---

## 🗺️ 3. Planejamento de Construção (Roadmap da IDE/Extensão)

Se fôssemos materializar esse ambiente de desenvolvimento hoje, o vetor de ataque (Roadmap) seria dividido em 3 Estágios Críticos:

### Phase I: Prova de Conceito (MVP — Antigravity Extension)
*   Criar o core lógico `feltrims-ai-engine.js` responsável por rotear um pedido Humano ("Cria a página de Login") para a Persona Correta. Lida com prompts System isolados (Prompt do Frontend não vaza pro DB).
*   Publicar como extensão para validação do mercado (VS Code / Windsurf / Cursor / Antigravity Web). O usuário consegue setar `Toggle: Fast Mode` vs `Toggle: Architect Mode`.

### Phase II: The IDE Standalone Scaffold 
*   Fazemos o Fork da IDE Open-Source do momento. Incorporamos a _Workspace Abstraction_. O diretório inicial _deve obrigatoriamente_ gerar a pasta `_ai_docs` (O cérebro) do Feltrim's Framework antes mesmo do `package.json`.
*   Painel Lateral de "Squad": Uma UI maravilhosa onde você não vê um chat linear, você vê avatares e cards de cada agente (A bolinha verde de online no "Emerson-DE", etc.), podendo intervir em decisões deles enquanto a IA conversa inter-API.

### Phase III: The Stakeholder "Black Box" (Sustentação Autônoma)
*   O ápice da concepção onde introduzimos o Painel do Stakeholder (Leigo). Ele não escreve código, abre o portal da *Feltrim IDE Enterprise* via browser, solta aúdio ditando a ideia, a IDE assume os Modos 1 ao 4, e devolve o repositório Github finalizado e documentado.

---

## 🔍 Conclusão da Visão e Próximo Passo

A ideia de embutir os **"Plan/Fast Switches automáticos vinculados às fases de Maturidade do Projeto e aprovação do Stakeholder"** soluciona o maior desafio das IAs generativas de código de hoje: A Perda de Foco. (Ao longo do tempo, a IA perde contexto ou começa a criar bugs por não saber se está "Arquitetando" ou "Limpando Déficit Técnico").

**Ações Imediatas (caso seja do seu interesse alavancar essa visão):**
1. Vamos começar o MVP? Deseja iniciar a construção lógica (código) de uma extensão/plugin experimental ou construir logo a arquitetura *Backend multi-LLM router* (que lerá os docs de Personas e orquestrará as chamadas de API do modelo generativo nos bastidores)?
