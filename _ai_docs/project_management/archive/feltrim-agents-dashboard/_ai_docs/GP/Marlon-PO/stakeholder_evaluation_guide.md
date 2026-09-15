# 🎯 Guia de Avaliação para Stakeholders: MKP FLOW v4.0
**Apresentação Oficial para Homologação e Feedback**

Este documento foi desenhado para você, Avaliador/Stakeholder (Raiad e parceiros). Seu propósito é fornecer o contexto mental de *Por Que* este sistema existe, *O Que* ele alcançou e apresentar um roteiro prático para que você teste a interface real e nos retorne um diagnóstico de Qualidade.

---

## 1. O Conceito e "O Por Quê" (The Why)
**O Problema (A Fricção Silenciosa):**
A gestão de e-commerce e integrações cruzadas (*Cross-Marketplace*) para três companhias diferentes (Univerza, Sinal, Made in Vale) dentro de 4 gigantes do varejo (ML, Magalu, Amazon e Shopee) gera uma carga cognitiva terrível.
O operador manual precisa mapear o que falta publicar ("Gaps"), escrever textos persuasivos, preencher planilhas maçantes do *Full* ou *Isenção de baterias*, e rastrear pendências. Isso consome o recurso temporal do freelancer e trava o faturamento da empresa.

**A Solução (MKP Flow):**
Um **ERP Logístico e Criativo**, focado estritamente na esteira de *Publishing*. Ele não rastreia apenas produtos, mas atua como um maestro: automatiza a auditoria visual, gera conteúdo persuasivo nativamente integrado com Big Data (Alibaba Qwen AI) e cospe as planilhas prontas, eliminando o desgaste humano.

---

## 2. As Metas do Sistema (Goals)
O MKP Flow v4.0 foi arquitetado para cumprir 5 metas de negócio brutais:
1. **Atuação em Massa (O(1)):** Reduzir para poucos cliques a admissão de dezenas de produtos na linha de montagem (Bulk Actions).
2. **Resguardo de Qualidade (Shift-Left):** Impedir que erros banais gastem o tempo da chefia. O sistema bloqueia a criação de tarefas logísticas se faltarem dados-chaves exigidos na ponta (ex: Sem EAN = Bloqueado para a Magalu).
3. **Conversão por Máquina (AI Copy):** Produzir descrições, títulos e fichas comerciais no ML imunes ao viés humano, focando 100% no volume de busca e nas técnicas de SEO.
4. **Alinhamento Tático (KPIs Mensais):** Criar uma visão executiva para que os sócios leiam em 5 segundos qual é a taxa de Estoque Zero e o índice de Saúde (Quality Score) da conta Univerza.
5. **Zero Fadiga Logística:** Extrair diretamente os formulários transacionais de upload (.CSV do ML e Amazon) já preenchidos.

---

## 3. O Código de Conduta do Esquadrão (A Alma de Código)
Nossos agentes e engenheiros operam filtrando cada pixel e linha de código através dos nossos 4 pilares (*Cultura SIGECO*):
- **União:** Colaboração entre agentes (PO, GP, Devs e QA). O layout tem que falar a mesma língua da engenharia de dados.
- **Tradição:** Respeito aos padrões visuais e arquitetônicos. Uma interface "Dark Mode" elegante, robusta, sem frescuras coloridas excessivas, transmitindo a sensação de um "Cockpit" premium e reativo.
- **Brio:** Orgulho implacável. Sem "gambiarras". Dívidas técnicas são sumariamente executadas e o código é validado por baterias de testes *Shift-Left* (Playwright e Vitest).
- **Equidade:** As interfaces devem ser acessíveis não importando o tamanho da base de dados (responsividade a performance local).

---

## 4. O Que Queremos (Nossa Interface e Módulos)
Aqui está o mapa do que foi entregue. Solicito que avalie as rotas da nossa *Sidebar* preta com detalhes em *Amber*:

1. **PAINEL:** Central de Comando (Dashboard numérico com KPIs consolidados).
2. **ESTRATÉGIA KPIS:** A nossa Sala de Guerra (War Room). Acompanha o retrato de Stockout (Estoque) e Conversões vitais, como o atraso nos chats do SAC do Magalu.
3. **COBERTURA:** Uma Matriz de Status (Gaps). Use a coluna de seleção (`checkbox`) para fletar uma dezena de itens faltantes para a fila de produção.
4. **PIPELINE:** O "Chão de Fábrica" (Kanban). Etapas de: A Fazer → Criando → Pendência → Revisão → Concluído. Permite gerenciar aprovações de lote para a loja inteira.
5. **CATÁLOGO & CONTEÚDO:** Manutenção do SKU, inserção de atributos de API do Mercado Livre e textos.
6. **OTIMIZADOR IA:** O Motor Mestre Qwen-Max 2.5. Basta selecionar um "Tom" (Ex: Urgência Promocional), a modalidade (Ex: Planilha CSV ML) e clicar em Gerar.
7. **TAREFAS:** Lista de ações diárias detalhadas (Ex: Prioridades extraídas do snapshot de Março da Univerza).
8. **MINHA PÁGINA & EMPRESAS:** Espelhos visuais de campanhas front-end e gestão inter-cross do nicho das empresas (Sinal e Made in Vale).

---

## 5. 🛠 Roteiro de Teste na Prática (O Seu Turno)
*Stakeholder, por favor execute este laboratório e sinta o fluxo:*

* **[  ] Atacar Tarefas.** Abra a aba "TAREFAS" e observe o painel logístico montado para a Univerza (Itens de Estoque e Fiscal).
* **[  ] Teste o Gatekeeper (O Segurança).** Vá em "COBERTURA", selecione a empresa *Sinal* e mande um produto para *Mercado Livre* sem ter um Score alto, e para *Amazon* sem EAN. Ele **deve** te proibir com notificação vermelha.
* **[  ] Ações em Massa (Balanço de Poder).** Na Aba "PIPELINE", vá na coluna "REVISÃO". Selecione 3 ou mais itens nas caixas de seleção, e clique em *APROVAR* de uma só vez. Sinta a responsividade.
* **[  ] Inteligência Tática.** Entre na Aba "OTIMIZADOR". Pegue o *Kit Microfone* (Sinal). Mande gerar um `CSV (Planilha ML)` focando em *Uso em Igrejas*. Teste baixar o arquivo e confira a padronização das colunas na máquina real.
* **[  ] Métricas de Diretoria.** Abra a aba "ESTRATÉGIA KPIS". Mude a porcentagem atual da "Taxa de Ruptura de Estoque". Veja a barra se ajustar visualmente e observe as recomendações.

---

## 6. Parecer do Avaliador (Seção para Retorno)
*(Utilize os campos abaixo ou encaminhe as considerações para guiarmos as correções do ciclo v5.0)*

**[Qualidade da UI/UX]:** 
_(O dark mode ficou claro nos contrastes? As notificações visuais e chips nos cards te informam rapidamente?)_


**[Fricção nos Fluxos do Kanban]:** 
_(Mover grandes massas no Pipeline poupou os cliques prometidos?)_


**[Coerência da IA (Exportador/CSV)]:** 
_(O arquivo gerado reflete realmente o que os envios do Mercado Livre pedem no Backend?)_


**[Aba de Kpis Estratégicos]:**
_(Esses 5 dados representam fielmente os gargalos de ROAS, Conversão e Estoque da operação Sinal, Made in Vale e Univerza?)_


**[Bugs & Soluções Sugeridas]:** 
-
-
-
