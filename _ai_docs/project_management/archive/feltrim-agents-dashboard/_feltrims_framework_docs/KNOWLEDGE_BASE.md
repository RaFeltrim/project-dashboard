# 🛡️ FELTRIM'S KNOWLEDGE BASE (LIVING DOCUMENTATION)
> Base de Conhecimento Centralizada de Erros e Padrões Ouro do Feltrim's Framework
> **Última Atualização:** 2026-03-05 (Originado do Projeto MKP FLOW)

Esta documentação é a **Memória Muscular** do Esquadrão. A regra máxima do FF é: *A IA não deve cometer o mesmo erro duas vezes em projetos diferentes.* Ao longo do desenvolvimento, cada erro crítico combatido e cada Padrão Ouro consolidado são registrados aqui. 

Sempre que a IDE iterar um projeto, ela consulta esta base para evitar anti-padrões.

---

## 🚫 1. Anti-Padrões & Bugs Catalogados (Para NUNCA MAIS usar)

### 🚨 [FRONTEND] Loops Infinitos de Sync WebSocket (React)
- **O Erro:** Ao usar `supabase.channel` junto com `onMount` (useEffect) sem tratar as dependências passadas como Props (Objetos) num Contexto Global de App React (Ocorreu no `DataContext.jsx` do MKP FLOW).
- **A Solução Encontrada (Padrão FF):** Usar Memoização Extrema. Todos os Hooks que carregam chamadas WebSocket precisam envolver suas funções de Mutação (Ex: `setProducts`) com `useCallback`. O próprio payload de sincronia de inserção real de Dados (como o KanBan arrastar e soltar) não pode ser espelhado a cada frame, é obrigatório criar um "Shrink Payload" encasulando a função DB com um `Lodash.debounce` de pelo menos `800ms`. O FF proíbe updates contínuos sem *Debounce* no banco.

### 🚨 [BACKEND] Node.js Assíncrono com High-Load Blocks (Rate Limiting Timeout)
- **O Erro:** Fazer `forEach` aguardando (await) APIs demoradas como robôs Chromium (`playwright`) ou inferências de LLM massivas no mesmo thread principal Express Node, causando Timeout (504 na Vercel e Socket Hang Up em chamadas contínuas HTTP).
- **A Solução Encontrada (Padrão FF):** O backend de RPA/Scraping, se possuir listagens maiores que 5 objetos dinâmicos, deve aplicar *Paralelização em Grid Concorrente*. Na stack do FF, adotamos `@playwright-cluster` ou `bullmq` limitando a no máximo 5 cores simultâneos executando e gerando promessas (Promises) conjuntas. 

### 🚨 [DATA ENGINEER] Custo Elevado (Money Burn) com LLMs Iguais
- **O Erro:** Pagar diversas vezes para API o mesmo Payload LLM idêntico pois o usuário recarregou a página enquanto não tinha uma camada de salvamento físico.
- **A Solução Encontrada (Padrão FF):** O **Caching Semântico via Hash Funcional**. Sempre que um Agente Prompt ligar para uma API paga (ex: Qwen), o `user`+`system_prompt` geram um Hash HMD5. O Frontend ou Supabase procura no localStorage se o Hash MD5 existe; se sim, ele entrega uma resposta cacheada em 15ms com consumo de token zerado.

---

## 🥇 2. Padrões Ouro (Golden Patterns - Blueprint do FF)

Soluções arquiteturais geniais que o time *sempre* deve aplicar desde o Repositório vazio:

1. **Windowing & Virtualização:** Arrays React no Mobile/Dashboard acima de 50 nós do DOM *obrigam* a Tech Lead a usar React Window ou Tanstack Virtual.
2. **Code Splitting de Chunks Assíncronos:** Views pesadas (como DashBoards gerenciais usando lib pesadas gráficas – Chart.js/Recharts) são componentizadas e importadas no `App.jsx` com `React.lazy()` e `Suspense`. Zero chance de comprometer a TTI de um mobile humilde 3G para ler a UI central.
3. **Database RLS Shift-Left:** Nenhum script `.sql` roda no banco de Dados local (Supabase) sem possuir as `GRANT` e `POLICIES` estabelecidas. Não há *Public Auth*, exceto leitura específica. Bypass = Vulnerabilidades Catastróficas.
4. **Mobile Responsividade Dinâmica:** O FF adota nativamente o uso do hook `useDevice` medindo larguras (ex. Window `innerWidth < 768`) alterando componentes visões HTML direto do render (*Liquid Mobile*). Classes CSS de media querry são minimizadas apenas pra FlexWraps base. O Design deve ser Apple-like.

---
> As próximas Sprints e ciclos deste ou de outros projetos irão acrescentar novos casos à esta lista sagrada de evolução contínua da Máquina Cognitiva do Feltrim's Framework.
