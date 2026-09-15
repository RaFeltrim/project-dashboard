# 🦅 Feltrim's Framework (FF)
> **Versão:** 1.0 (Nascido na v5.0 do MKP FLOW)
> **Autor/Criador:** Rafael Feltrim
> **Propósito:** Orquestração Autônoma de Agentes de IA Especializados (Multi-Agent System).

O **Feltrim's Framework** é uma arquitetura de orquestração de Inteligência Artificial baseada em "Shift-Left" e descentralização de papeis (Personas). Em vez de um único "Assistente Genérico" desenvolver um sistema inteiro, o framework estabelece um **Esquadrão de Elite Virtual** fixado no diretório base do projeto, separando papéis executivos, táticos e operacionais, cada qual operando com visões isoladas superpostas por uma voz de Orquestração final (CIAO).

O framework desacopla a aplicação puramente de _código_ das _camadas de cognição do projeto_, permitindo transpor esse mesmo formato estrutural para criar qualquer outro projeto de forma escalável e com padrão C-Level de entrega.

---

## 🏛️ Princípios Core do Framework

1. **Hiper-Especialização (Personas Únicas):** Cada Agente de IA possui nome, cargo, escopo, linguajar e métricas de sucesso distintas configuradas num "_gem_ prompt" isolado.
2. **Equidade de Gênero Virtual:** O design estipula equidade demográfica entre os agentes criados (50% Homens, 50% Mulheres) maximizando diferentes espectros de análise sintante da IA.
3. **Cultura Inegociável:** Os agentes devem partilhar a cultura de *"Unity, Tradition, Pride, and Equity"*, mantendo o orgulho das próprias entregas e não aceitando códigos abaixo do Padrão Ouro.
4. **Shift-Left Absoluto:** Segurança, Testes de Qualidade (QA), Perfomance (DADOS/DE) e Estratégia do Negócio (PO) sempre acontecem no instante 0 (zero) da construção, e não empurrados para o final do code-review.
5. **Aprovação CIAO:** Tudo transita em Sprints. No final delas ocorre a "Reunião Tática", onde todos os agentes publicam um relatório consolidado. O **CIAO** (Chief AI Officer) e o Arquiteto criam as _CIAO Directives_, que ditam as refatorações vitais finais (como a lendária "Sprint 9 de Hiper-Performance").

---

## 🗂️ Estrutura de Diretórios de Orquestração

Quando iniciar um novo projeto utilizando o *Feltrim's Framework*, basta instanciar a pasta raiz de orquestração (geralmente nomeada `_ai_docs` ou `_orchestrator`) em paralelo à pasta `src` da aplicação, contendo os Prompts Genoma (`gem_`) divididos em 4 pilares:

```text
📦 raiz-do-projeto
 ┣ 📂 src/ (O código da aplicação real em si)
 ┣ 📂 test/ (As validações do QA)
 ┗ 📂 _ai_docs/ (👉 O CÉREBRO — Feltrim's Framework)
    ┣ 📜 INDEX.md (Mapeamento de todos os agentes)
    ┣ � KNOWLEDGE_BASE.md (Documentação viva de erros e soluções)
    ┣ �📂 CIAO/
    ┃  ┗ 📂 Sofia-CIAO/ -> gem_ciao_c_level.md (Governança Central da IA)
    ┣ 📂 DB/
    ┃  ┣ 📂 Emerson-DE/ -> gem_data_eng_sr.md (Data Engineer)
    ┃  ┗ 📂 Pedro-DADOS/ -> gem_dba_rules.md (DBA & Connection Tuning)
    ┣ 📂 DEVs/
    ┃  ┣ 📂 Aline-ARCH/ -> gem_arch.md (Arquiteta de Software Cloud)
    ┃  ┣ 📂 Beatriz-TL/ -> gem_tech_lead.md (Tech Lead)
    ┃  ┣ 📂 Camila-DEVOPS/ -> gem_devops.md (CI/CD Pipelines)
    ┃  ┣ 📂 Cleber-MOBILE/ -> gem_mobile_sr.md (Mobile First & Touch)
    ┃  ┣ 📂 Fabio-FRONTEND/ -> gem_frontend_sr.md (React, Zustand, Lazy Load)
    ┃  ┣ 📂 Joao-BACKEND/ -> gem_backend_ssr.md (RPA, Fila, Multicore)
    ┃  ┣ 📂 Laura-UIUX/ -> gem_ui_ux_sr.md (Liquid Glass, Design Tokens)
    ┃  ┣ 📂 Mariana-PROMPT/ -> gem_prompt_eng.md (Engenharia Qwen/LLM, Hashing)
    ┃  ┗ 📂 Rafael-QA/ -> gem_qa_sdet.md (Cucumber, BDD, Playwright)
    ┗ 📂 GP/
       ┣ 📂 Claudia-PM/ -> roadmap_pm.md (Gestora de Prazos e Ouro)
       ┗ 📂 Marlon-PO/ -> business_value.md (Dono do Produto)
```

## 🧠 Como Rodar o "Feltrim's Workflow"

Passo a Passo de Gestão de Ciclo de Vida do Projeto utilizando os Agentes:

1. **Inception & Business Value (Ação do PO e PM)**
   - O desenvolvedor humano interage chamando `Marlon-PO` e `Claudia-PM` para construir o arquivo _Roadmap_ Inicial.
   
2. **Architecture Blueprint (Ação do ARCH, DB e UIUX)**
   - Antes de uma linha de código `src` ser criada, os papéis `Aline-ARCH`, `Laura-UIUX` e os `DBs` formulam o manifesto de arquitetura, banco, e design tokens (`/DEVs`).

3. **Development Cycle (Ação do FRONT, BACK, MOBILE e PROMPT)**
   - O humano interage sob os contextos solicitando criações e code generation. Ele pode sinalizar `@Fabio-FRONTEND cria a Virtualização de DOM` ou `@Cleber-MOBILE checa hitboxes touch`.

4. **Shift-Left Testing (Ação do QA e DEVOPS)**
   - A cada _Pull Request_ simulado, o `Rafael-QA` é chamado para atestar o comportamento da funcionalidade. A pipeline CI é verificada pela `Camila-DEVOPS`.

5. **A Mesa Redonda (Reunião Tática e Executiva)**
   - Concluída a Sprint, o Humano (Orquestrador) solicita a "Ata de Alinhamento".
   - Cada agente do pelotão expõe as conquistas e os débitos (gargalos previstos).
   - A `Sofia-CIAO` avalia todos os relatórios da Mesa Simultaneamente e dá seu "Veredito Final", gerando _CIAO Directives_ focadas apenas em performance absoluta (como Debounces agressivos, Clusterização Playwright e Caching Hashing).

6. **Debt Mitigation & Hardening**
   - Os agentes técnicos absorvem a crítica da Diretoria (CIAO) e aplicam a "Sprint Final (Debts)", entregando um código limpo, reativo, com alto Time To Interactive (TTI) e blindado contra ataques (RLS).

7. **Continuous Learning (A Documentação Viva)**
   - Ao longo de toda a execução do projeto, assim que um Block/Bug é resolvido, o agente responsável (ou a Tech Lead) altera automaticamente o arquivo `KNOWLEDGE_BASE.md`. Este registro retro-alimenta erros crassos cometidos pela IA e blinda a organização contra reincidência de falhas arquiteturais, consolidando a inteligência perene do Esquadrão.

---

## 🎯 Por que o Feltrim's Framework transcende os demais?

Enquanto frameworks tradicionais focam no *Software* (MVC, Clean Architecture, Hexagonal), o **Feltrim's Framework** ataca o *Organograma Criativo*. Você não é mais um "desenvolvedor pedindo código pro ChatGPT", você é um **Diretor Geral de Orquestração** governando 14 diretores/engenheiros sistêmicos com viés unificado de design premium de negócio.

O isolamento dessas "Leis" no diretório `_ai_docs/` nos permite copiar este diretório, colar em um `Projeto-Y` em branco, ditar uma meta principal e toda a máquina ganhará vida em poucas horas exatamente com o mesmo refino técnico impiedoso.
