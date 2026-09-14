# Finance Hub

Dashboard financeiro moderno construído focado em reduzir a carga cognitiva, projetado especificamente em um conceito **TDAH-First**.
Em vez do usuário gastar tempo lançando contas mensais e detalhando linhas de fatura, o projeto provê **4 motores principais de ingestão de dados** para automatizar tudo isso.

Para detalhes estruturais, veja a [Documentação de Arquitetura](./docs/ARCHITECTURE.md).

## 🚀 Tecnologias e Stack

O Finance Hub não separa o Frontend e o Backend. Ele é um monólito em Next.js para garantir agilidade no desenvolvimento, menor ponto de falhas (como integrações REST/CORS), e tipagem estática end-to-end com tRPC.

- **Frontend e Backend:** Next.js 16 (App Router) + React 19 + tRPC 11
- **Estilização:** Tailwind CSS v4
- **Banco de Dados:** PostgreSQL hospedado via Docker (Porta 5433)
- **ORM:** Prisma 6
- **Autenticação:** NextAuth 4
- **Serviços de IA e Cron:** OpenAI API + `node-cron`

## ⚙️ Configuração do Ambiente Local

### 1. Requisitos
- Node.js (v20+)
- Docker Desktop (ou Docker Engine)
- NPM

### 2. Passo a Passo Inicial

1. **Clone e Instale:**
   Navegue até a raiz do projeto e instale as dependências:
   ```bash
   npm install
   ```

2. **Suba o Banco de Dados:**
   A aplicação usa PostgreSQL. Inicie o container com o Docker-Compose e garanta que sua porta 5433 não esteja em uso.
   ```bash
   docker-compose up -d postgres
   ```

3. **Crie e configure as Variáveis de Ambiente:**
   Copie o arquivo `.env.example` para `.env`
   ```bash
   cp .env.example .env
   ```
   > Atualize `DATABASE_URL`, `OPENAI_API_KEY` (se for usar o rateio inteligente do Motor Nubank), e `NEXTAUTH_SECRET`.

4. **Prepare o Prisma (Migration e Seed):**
   Com o banco de dados rodando, rode os comandos para subir as tabelas e injetar os dados base de Contas (Santander, Mercado Pago, Nubank, etc) e Categorias padrão.
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Inicie o Servidor:**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000`

## 🧩 Os 4 Motores de Automação

1. **Mercado Pago (Sincronização API)**: Integração passiva com API REST.
2. **Santander (Smart Parsing)**: Upload e extração de extratos com dicionário auto-categorizável de Regex.
3. **Nubank Rateio via IA**: Análise semântica da fatura atrelada a stakeholders secundários (Mãe/Tia) com repasse fracionado.
4. **Cartão Recorrente (Cron)**: Motor passivo que efetua a cobrança de custos engessados da sua vida no 1º dia.

## 🤝 Histórico de Código e Autoria
Este código unificou as melhores soluções do `@Rafael Feltrim` contidas inicialmente em 3 repositórios distintos:
- *py-finance* (Lógica de chat de entradas)
- *Financeiro-Master* (Parsers complexos e segurança de mapeamento léxico)
- *dashboard-financeiro* (Schema relacional e estrutura tRPC moderna)
