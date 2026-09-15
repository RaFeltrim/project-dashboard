# 📘 História e Visão do Produto (MKP Flow V5.0)

**Autoria:** PM (Product Manager) & PO (Product Owner)  
**Objetivo:** Preservar a memória do projeto, desde a concepção até a Governança Executiva, garantindo as boas práticas de Engenharia de Requisitos.

---

## 📅 A Jornada do MKP Flow

### 1. A Dor Original (O Porquê)
Operar o e-commerce de três marcas (`Made in Vale`, `Sinal`, e `Univerza`) em múltiplos marketplaces (Mercado Livre, Magalu, Shopee, Amazon) gerava um caos operacional. A dependência de hubs lentos, a falta de padronização nos anúncios (Títulos sem conversão, descrições genéricas) e o cálculo manual de viabilidade (preços e gaps) afundavam o faturamento. O tempo de resposta para subir ou consertar um anúncio era de dias.

### 2. O Nascimento do "Automation" (MVP ao V3.0)
As primeiras versões (até a v3) envolveram a criação de robôs locais e scripts soltos. O problema era a sincronia da equipe. A base de dados vivia no `localStorage` do navegador, o que impedia o trabalho colaborativo (se o PO gerasse um texto otimizado no seu PC, o Analista em outro PC não via).

### 3. A Revolução Arquitetural (V4.0 - Gems Inception)
Início formal da padronização Shift-Left. Introduziu-se a integração profunda com LLMs avançados (Qwen da Alibaba Cloud) para escrever títulos SEO e analisar especificações. 
O *Gatekeeper AI* nasceu para varrer erros silenciosos que custam dinheiro: ausência de EAN-13, caracteres invisíveis (RTL Override corrompendo planilhas de upload massivo) e palavras bloqueadas (zero markdown rules). Foco absoluto em Prevenção.

### 4. A Maturidade e o Escalonamento (V5.0 - Atual)
Foi aqui que o **Time de Orquestração** liderou a transição para a Cloud. 
- Morte da arquitetura descentralizada: Entrou o Postgres na Nuvem (Supabase) atuando como "Single Source of Truth", com WebSockets em Realtime (tela atualizada instantaneamente para todos).
- *Hardening* Estrito: IAM, Autenticação, Proteção Bearer Token.
- *Responsividade:* O sistema agora é operável do chão de fábrica e galpão operacional pelo celular do funcionário.
- *The Bridge:* Publicação nativa e extração de insights por Scraper (`Robot`).

## 🎯 Nossa Identidade e Restrições de Operação
- **MIV (Made in Vale):** Ouro de Nicho. Só opera produtos Pet e Agrícola.
- **SIN (Sinal):** Som e Tecnologia. Instrumentos musicais e Eletrônicos apenas.
- **UNV (Univerza):** O Coringa Multidepartamento. Aceita Brinquedos, Beleza, e os *Best Sellers* da MIV e SIN se a margem de arbitragem cruzar os 20% nominais.

## 🤝 O Acordo de Governança
Desenvolvimento sem burocracia, mas com total rastro. Nenhuma linha de código entra na Master (main) sem uma "User Story" testada pelo Playwright e autorizada pelos relatórios visuais (Screenshots em `/artifacts`).
