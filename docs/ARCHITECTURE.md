# Finance Hub — Documentação de Arquitetura

O **Finance Hub** é um dashboard financeiro desenhado com um princípio base: **TDAH-First**. A arquitetura foca em minimizar a carga cognitiva, reduzir passos manuais e utilizar inteligência para classificar lançamentos através de 4 motores paralelos de ingestão. 

O sistema é um monólito **Next.js Full-Stack**, construído a partir do refino técnico de três repositórios legados do autor.

## 🏗️ 1. Princípios Arquiteturais (TDAH-First)
- **Zero Overhead de Lançamentos:** Sem longos formulários. Input de texto via linguagem natural (ex: `-50 ifood`) resolve a maioria dos gastos soltos.
- **Micro-Decisões Evitadas:** Categorização acontece de forma automática, delegada para inteligência (OpenAI, Regex e Dicionários) ou puxada de fontes fixas (API do Mercado Pago).
- **Consolidação em "God View":** Um painel único mostrando os Alertas Atuais, Gastos Diários Recomendados e a Saída de Caixa Mapeada (Motores).

## 🧰 2. Stack Tecnológica
- **Framework Global:** Next.js 16 (App Router)
- **Comunicação Cliente/Servidor:** tRPC 11 (Type-Safety fim a fim sem overhead de codegen REST).
- **ORM e Banco de Dados:** Prisma 6 + PostgreSQL (Isolado via Docker).
- **Interface e Estilos:** React 19 + Tailwind CSS v4, mantendo UI focada em contrastes e cores distintas para cada motor.
- **Autenticação:** NextAuth 4 (Provider: Credentials via Bcyptjs).
- **Scheduling (Tarefas em background):** `node-cron` integrado nativamente ao ecossistema Node da aplicação.

## ⚙️ 3. Os 4 Motores de Ingestão de Dados

O fluxo central da aplicação não ocorre pela adição manual clássica de transações, mas por **motores assíncronos e orientados a ingestão**.

### Motor 1: Mercado Pago (API Oficial)
- **Cores Oficiais na UI:** Azul 🔵
- **Função:** Sincronização passiva do saldo de caixa (reserva de emergência) e gastos executados diretamente via carteira digital.
- **Integração:** Realizada via token (OAuth2 ou Access Token direto) e REST usando os endpoints oficiais do MercadoPago (`/v1/payments/search`).

### Motor 2: Santander (Parsing Inteligente de Faturas)
- **Cores Oficiais na UI:** Vermelho 🔴
- **Função:** Processamento nativo de faturas do banco que recebe o salário para categorização por padrões predefinidos.
- **Integração:** Baseado num dicionário legado de `40+` chaves léxicas PT-BR (`categoryMappings`). Ele processa CSV ou OFX via extração simples, e usa PDF parsing (`pdf-parse`) com regex caso seja necessário.

### Motor 3: Nubank / Stakeholder Mãe (Motor IA)
- **Cores Oficiais na UI:** Roxo 💜
- **Função:** Rateio automático de fatura compartilhada. Quando o usuário utiliza o cartão da mãe (titular), ele não precisa separar cada linha manualmente.
- **Integração:** Upload de PDF via `/api/upload-pdf`. O texto extraído é enviado ao **Google Gemini** (`gemini-2.5-flash`) via prompt estruturado com schema JSON nativo. A IA classifica cada item em stakeholders: `SUB_PESSOAL`, `AP`, `TERCEIROS` e `MAE`. Ao confirmar o rateio, o usuário escolhe o "Mês de Competência" e as transações são salvas com `section` mapeada para `ExpenseSection` no banco.

### Motor 4: Cartão Tia (Recorrências)
- **Cores Oficiais na UI:** Amarelo 🟡
- **Função:** Gerar débitos fixos, contínuos ou parcelados que rodam de forma automática todo mês.
- **Integração:** Cron job (`node-cron`) acionado que checa o fechamento e cria transações na base com base no modelo `RecurringCharge`.

## 🗄️ 4. Estrutura e Modelagem (Prisma)
- **Auth Layer:** Tabelas padrão para gerenciamento de tokens e sessões do NextAuth.
- **Configurações Específicas:** O Model `MercadoPagoConfig` guarda os tokens por usuário.
- **Núcleo de Transações:**
  - `Transaction` armazena gastos finais consolidados, com ligação via `categoryId`.
  - `Category` são flexíveis e pertencem a seções rígidas: `PESSOAL`, `CASA`, `PROFISSIONAL`.
  - `RecurringCharge` representa regras ativas do Motor 4.
  - `Invoice` armazena arquivos parseados ou copypastes para os Motores 2 e 3.

## 🤝 5. Padrão "Zero Frankenstein"
Não utilizamos microsserviços por opção, o backend não está em Python, FastApi ou Django, nem chamamos APIs Python via `fetch()`. Tudo habita no monolito NodeJS/TypeScript, gerando consistência na verificação de tipagem via tRPC de ponta a ponta.

A evolução das ferramentas garante a fácil manutenção e testabilidade de novas integrações de parse ou novos "Motores" sem corromper dependências cruzadas complexas.
