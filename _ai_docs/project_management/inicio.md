# Dashboard Financeiro

Guia completo para montar um dashboard financeiro com stack moderna, foco em manutenibilidade e seguranca:

- Next.js + TypeScript + Tailwind CSS
- Prisma ORM
- tRPC com contexto correto
- CRUD de despesas, receitas e contas
- Validacao com Zod + React Hook Form
- Autenticacao com NextAuth.js
- Testes unitarios e de integracao

## 1. Visao Geral

Este documento corrige as inconsistencias do rascunho inicial e adiciona as funcionalidades essenciais para um projeto real.

Decisoes de arquitetura:

- Next.js: produtividade com SSR/SSG e roteamento maduro
- tRPC: tipagem ponta a ponta entre frontend e backend
- Prisma: evolucao de schema e queries seguras
- NextAuth.js: autenticacao pronta para producao
- Zod: validacao confiavel no backend e no frontend

## 2. Estrutura do Projeto

```text
finance-dashboard/
|- prisma/
|  |- schema.prisma
|- src/
|  |- components/
|  |  |- forms/
|  |  |  |- ExpenseForm.tsx
|  |- lib/
|  |  |- prisma.ts
|  |- pages/
|  |  |- api/
|  |  |  |- auth/
|  |  |  |  |- [...nextauth].ts
|  |  |  |- trpc/
|  |  |  |  |- [trpc].ts
|  |  |- dashboard/
|  |  |  |- expenses.tsx
|  |  |  |- incomes.tsx
|  |  |  |- bills.tsx
|  |  |- login.tsx
|  |  |- _app.tsx
|  |- server/
|  |  |- api/
|  |  |  |- routers/
|  |  |  |  |- _app.ts
|  |  |  |  |- expense.ts
|  |  |  |  |- income.ts
|  |  |  |  |- bill.ts
|  |  |- auth.ts
|  |  |- trpc.ts
|  |- utils/
|  |  |- trpc.ts
|  |- types/
|  |  |- next-auth.d.ts
|- tests/
|  |- unit/
|  |  |- expense-schema.test.ts
|  |- integration/
|  |  |- expense-router.test.ts
|- jest.config.ts
|- jest.setup.ts
|- package.json
|- .env.local
```

## 3. Configuracao Inicial

Pre-requisitos:

- Node.js 20+
- npm 10+
- Banco PostgreSQL (ou SQLite para dev local)

Crie o projeto:

```bash
npx create-next-app@latest finance-dashboard --ts --tailwind --eslint
cd finance-dashboard
```

Instale dependencias:

```bash
npm install @prisma/client prisma zod superjson bcryptjs
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query
npm install next-auth @next-auth/prisma-adapter react-hook-form @hookform/resolvers
npm install --save-dev jest jest-environment-jsdom @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Inicialize o Prisma:

```bash
npx prisma init
```

Exemplo de variaveis de ambiente:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_dashboard"
NEXTAUTH_SECRET="troque-por-um-segredo-forte"
NEXTAUTH_URL="http://localhost:3000"
```

## 4. Banco de Dados (Prisma)

Arquivo: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  expenses Expense[]
  incomes  Income[]
  bills    Bill[]

  accounts Account[]
  sessions Session[]
}

model Expense {
  id        String   @id @default(cuid())
  title     String
  amount    Decimal  @db.Decimal(12, 2)
  category  String
  date      DateTime
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

model Income {
  id        String   @id @default(cuid())
  source    String
  amount    Decimal  @db.Decimal(12, 2)
  date      DateTime
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

model Bill {
  id          String   @id @default(cuid())
  description String
  amount      Decimal  @db.Decimal(12, 2)
  dueDate     DateTime
  paid        Boolean  @default(false)
  paidAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, dueDate])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Aplicar schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 5. tRPC Corrigido (Setup Completo)

### 5.1 Cliente Prisma singleton

Arquivo: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 5.2 Auth options

Arquivo: `src/server/auth.ts`

```typescript
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const isValid = await compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
```

### 5.3 Contexto e middlewares do tRPC

Arquivo: `src/server/trpc.ts`

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";

import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(opts.req, opts.res, authOptions);

  return {
    prisma,
    session,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.session.user.id,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireAuth);
```

### 5.4 Router principal e endpoint API

Arquivo: `src/server/api/routers/_app.ts`

```typescript
import { router } from "@/server/trpc";
import { expenseRouter } from "@/server/api/routers/expense";
import { incomeRouter } from "@/server/api/routers/income";
import { billRouter } from "@/server/api/routers/bill";

export const appRouter = router({
  expense: expenseRouter,
  income: incomeRouter,
  bill: billRouter,
});

export type AppRouter = typeof appRouter;
```

Arquivo: `src/pages/api/trpc/[trpc].ts`

```typescript
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter } from "@/server/api/routers/_app";
import { createTRPCContext } from "@/server/trpc";

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError({ path, error }) {
    if (process.env.NODE_ENV === "development") {
      console.error("Erro tRPC em", path, error);
    }
  },
});
```

Observacao importante: com tRPC, voce nao precisa manter endpoints REST separados como `pages/api/expenses/[id].ts`; toda comunicacao passa por `/api/trpc`.

## 6. CRUD Completo (Despesas, Receitas, Contas)

### 6.1 Router de despesas

Arquivo: `src/server/api/routers/expense.ts`

```typescript
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const expenseCreateSchema = z.object({
  title: z.string().min(3).max(80),
  amount: z.number().positive(),
  category: z.string().min(2).max(40),
  date: z.coerce.date(),
  notes: z.string().max(300).optional(),
});

const expenseUpdateSchema = expenseCreateSchema.extend({
  id: z.string().cuid(),
});

export const expenseRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          start: z.coerce.date().optional(),
          end: z.coerce.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.expense.findMany({
        where: {
          userId: ctx.userId,
          ...(input?.category ? { category: input.category } : {}),
          ...(input?.start || input?.end
            ? {
                date: {
                  gte: input?.start,
                  lte: input?.end,
                },
              }
            : {}),
        },
        orderBy: { date: "desc" },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.expense.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  create: protectedProcedure
    .input(expenseCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.expense.create({
        data: {
          userId: ctx.userId,
          title: input.title,
          amount: input.amount,
          category: input.category,
          date: input.date,
          notes: input.notes,
        },
      });
    }),

  update: protectedProcedure
    .input(expenseUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...payload } = input;

      const record = await ctx.prisma.expense.findFirst({
        where: { id, userId: ctx.userId },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Despesa nao encontrada" });
      }

      return ctx.prisma.expense.update({
        where: { id },
        data: payload,
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.prisma.expense.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Despesa nao encontrada" });
      }

      await ctx.prisma.expense.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

### 6.2 Router de receitas

Arquivo: `src/server/api/routers/income.ts`

```typescript
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const incomeCreateSchema = z.object({
  source: z.string().min(2).max(80),
  amount: z.number().positive(),
  date: z.coerce.date(),
  notes: z.string().max(300).optional(),
});

const incomeUpdateSchema = incomeCreateSchema.extend({
  id: z.string().cuid(),
});

export const incomeRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.income.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: "desc" },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.income.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  create: protectedProcedure
    .input(incomeCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.income.create({
        data: {
          userId: ctx.userId,
          source: input.source,
          amount: input.amount,
          date: input.date,
          notes: input.notes,
        },
      });
    }),

  update: protectedProcedure
    .input(incomeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...payload } = input;

      const record = await ctx.prisma.income.findFirst({
        where: { id, userId: ctx.userId },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Receita nao encontrada" });
      }

      return ctx.prisma.income.update({
        where: { id },
        data: payload,
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.prisma.income.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Receita nao encontrada" });
      }

      await ctx.prisma.income.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

### 6.3 Router de contas

Arquivo: `src/server/api/routers/bill.ts`

```typescript
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const billCreateSchema = z.object({
  description: z.string().min(3).max(100),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  paid: z.boolean().default(false),
  paidAt: z.coerce.date().nullable().optional(),
});

const billUpdateSchema = billCreateSchema.extend({
  id: z.string().cuid(),
});

export const billRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.bill.findMany({
      where: { userId: ctx.userId },
      orderBy: { dueDate: "asc" },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.bill.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  create: protectedProcedure
    .input(billCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.bill.create({
        data: {
          userId: ctx.userId,
          description: input.description,
          amount: input.amount,
          dueDate: input.dueDate,
          paid: input.paid,
          paidAt: input.paidAt,
        },
      });
    }),

  update: protectedProcedure
    .input(billUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...payload } = input;

      const record = await ctx.prisma.bill.findFirst({
        where: { id, userId: ctx.userId },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conta nao encontrada" });
      }

      return ctx.prisma.bill.update({
        where: { id },
        data: payload,
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.prisma.bill.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conta nao encontrada" });
      }

      await ctx.prisma.bill.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

## 7. Validacao de Formularios (Frontend)

Arquivo: `src/components/forms/ExpenseForm.tsx`

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { trpc } from "@/utils/trpc";

const expenseFormSchema = z.object({
  title: z.string().min(3, "Titulo obrigatorio"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  category: z.string().min(2, "Categoria obrigatoria"),
  date: z.string().min(1, "Data obrigatoria"),
  notes: z.string().max(300, "Maximo de 300 caracteres").optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export function ExpenseForm() {
  const utils = trpc.useUtils();
  const mutation = trpc.expense.create.useMutation({
    onSuccess: async () => {
      // Mantem a lista sincronizada apos cadastrar
      await utils.expense.list.invalidate();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
  });

  const onSubmit = async (data: ExpenseFormData) => {
    await mutation.mutateAsync({
      ...data,
      date: new Date(data.date),
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
      <input placeholder="Titulo" {...register("title")} className="w-full rounded border p-2" />
      {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}

      <input type="number" step="0.01" placeholder="Valor" {...register("amount")} className="w-full rounded border p-2" />
      {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}

      <input placeholder="Categoria" {...register("category")} className="w-full rounded border p-2" />
      {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}

      <input type="date" {...register("date")} className="w-full rounded border p-2" />
      {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}

      <textarea placeholder="Observacoes" {...register("notes")} className="w-full rounded border p-2" />

      <button type="submit" disabled={isSubmitting} className="rounded bg-black px-4 py-2 text-white">
        {isSubmitting ? "Salvando..." : "Salvar despesa"}
      </button>
    </form>
  );
}
```

## 8. Autenticacao com NextAuth.js

Arquivo: `src/pages/api/auth/[...nextauth].ts`

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";

export default NextAuth(authOptions);
```

Arquivo: `src/types/next-auth.d.ts`

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
```

Arquivo: `src/pages/_app.tsx`

```tsx
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import "@/styles/globals.css";
import { trpc } from "@/utils/trpc";

type AppPropsWithSession = AppProps<{ session: Session | null }>;

function App({ Component, pageProps }: AppPropsWithSession) {
  const { session, ...restPageProps } = pageProps;

  return (
    <SessionProvider session={session}>
      <Component {...restPageProps} />
    </SessionProvider>
  );
}

export default trpc.withTRPC(App);
```

Arquivo: `src/utils/trpc.ts`

```typescript
import { createTRPCNext } from "@trpc/next";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@/server/api/routers/_app";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
        httpBatchLink({ url: `${getBaseUrl()}/api/trpc` }),
      ],
    };
  },
  ssr: false,
});
```

## 9. Testes Unitarios e de Integracao

### 9.1 Configuracao do Jest

Arquivo: `jest.config.ts`

```typescript
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(customJestConfig);
```

Arquivo: `jest.setup.ts`

```typescript
import "@testing-library/jest-dom";
```

### 9.2 Exemplo de teste unitario (validacao)

Arquivo: `tests/unit/expense-schema.test.ts`

```typescript
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(3),
  amount: z.number().positive(),
  category: z.string().min(2),
});

describe("expenseSchema", () => {
  it("aceita payload valido", () => {
    const parsed = expenseSchema.safeParse({
      title: "Mercado",
      amount: 120.5,
      category: "Alimentacao",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejeita amount invalido", () => {
    const parsed = expenseSchema.safeParse({
      title: "Teste",
      amount: 0,
      category: "Geral",
    });

    expect(parsed.success).toBe(false);
  });
});
```

### 9.3 Exemplo de teste de integracao (router)

Arquivo: `tests/integration/expense-router.test.ts`

```typescript
import { appRouter } from "@/server/api/routers/_app";

describe("expenseRouter", () => {
  it("lista despesas do usuario autenticado", async () => {
    const prismaMock = {
      expense: {
        findMany: jest.fn().mockResolvedValue([{ id: "exp_1", title: "Mercado" }]),
      },
    } as any;

    const caller = appRouter.createCaller({
      prisma: prismaMock,
      session: { user: { id: "user_1" } },
      userId: "user_1",
    } as any);

    const result = await caller.expense.list();

    expect(prismaMock.expense.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});
```

## 10. Executando o Projeto

1. Instale as dependencias:

```bash
npm install
```

2. Gere cliente Prisma e aplique schema:

```bash
npx prisma generate
npx prisma migrate dev
```

3. Execute em desenvolvimento:

```bash
npm run dev
```

4. Rode os testes:

```bash
npm run test
```

5. Build de producao:

```bash
npm run build
npm run start
```

## 11. Atualizacao e Compatibilidade

Abaixo, um `package.json` de referencia com versoes modernas e compativeis para esse setup (ajuste conforme seu ambiente):

```json
{
  "name": "finance-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^6.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/next": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@trpc/server": "^11.0.0",
    "bcryptjs": "^2.4.3",
    "next": "^15.0.0",
    "next-auth": "^4.24.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.0.0",
    "superjson": "^2.2.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jest": "^30.0.0",
    "jest-environment-jsdom": "^30.0.0",
    "prisma": "^6.0.0",
    "typescript": "^5.0.0"
  }
}
```

Para manter o projeto atualizado:

```bash
npm outdated
npx npm-check-updates -u
npm install
```

## 12. Documentacao Oficial

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- tRPC: https://trpc.io/docs
- TanStack React Query: https://tanstack.com/query/latest/docs/framework/react/overview
- NextAuth.js: https://next-auth.js.org/getting-started/introduction
- Zod: https://zod.dev
- React Hook Form: https://react-hook-form.com

## 13. Contribuicao

Fluxo sugerido:

1. Crie uma branch de feature
2. Adicione testes para a feature
3. Rode `npm run lint` e `npm run test`
4. Abra PR com descricao objetiva do que mudou

## 14. Licenca

Defina a licenca no repositorio (MIT, Apache-2.0 etc.) e mantenha o arquivo `LICENSE` versionado.

## 15. Reaproveitamento dos Projetos Existentes

Com base na analise dos projetos `controle-de-gastos` e `gasto-focado`, estes sao os blocos aprovados para reaproveitamento no projeto final.

### 15.1 O que reaproveitar do gasto-focado

Origem recomendada:

- `src/utils/validation.ts`
- `src/utils/calculations.ts`
- `src/hooks/useTransactions.ts`
- `src/hooks/useGoals.ts`
- `src/test/validation.test.ts`
- `src/test/calculations.test.ts`
- `src/test/integration.test.tsx`

Por que vale reaproveitar:

- Regras de validacao de formulario mais completas (descricao, valor, categoria e subcategoria)
- Funcoes de calculo de metricas e metas claras e testaveis
- Cobertura de cenarios de borda no frontend com Vitest

### 15.2 O que reaproveitar do controle-de-gastos

Origem recomendada:

- `src/services/expenseService.js`
- `src/utils/expenseValidator.js`
- `server.js` (apenas padroes de seguranca)
- `src/bank-importer/secureBankImporter.js`
- `test/unit/expense.service.test.js`
- `test/integration/expense.integration.test.js`

Por que vale reaproveitar:

- Camada de servico com responsabilidades bem separadas
- Validacoes de dominio importantes (ex.: bloquear data futura)
- Boas praticas de seguranca HTTP (helmet, rate-limit, CORS)
- Fluxo de importacao de extrato bancario local (sem envio externo)

### 15.3 Ajustes obrigatorios antes de portar

Ao importar esses blocos para o projeto final, aplique estes ajustes:

1. Converter arquivos JS para TS mantendo tipagem forte
2. Usar Prisma singleton (`src/lib/prisma.ts`) em vez de instanciar `new PrismaClient()` em cada classe
3. Garantir escopo por usuario (`userId`) em todas as consultas, updates e deletes
4. Trocar `Float` por `Decimal` nos valores financeiros para evitar erro de precisao
5. Em importacao bancaria, corrigir operacoes assincronas com `await`

Exemplo de correcao importante no importador bancario:

```typescript
// Antes (risco de concorrencia sem controle)
const expense = this.expenseService.createExpense(payload);

// Depois (persistencia garantida por transacao)
const expense = await this.expenseService.createExpense(payload);
```

### 15.4 Plano de incorporacao para finalizar o projeto

Fase 1 - Base backend

- Portar regras de validacao de `expenseValidator` para Zod
- Portar logica util de `expenseService` para routers tRPC
- Adicionar middlewares de seguranca no ambiente server (quando aplicavel)

Fase 2 - Base frontend

- Portar utilitarios de validacao e calculos do `gasto-focado`
- Integrar formulario de transacoes com React Hook Form + Zod
- Integrar metas e agregados no dashboard

Fase 3 - Qualidade e operacao

- Portar e adaptar testes unitarios e de integracao
- Adicionar modulo de importacao de extrato bancario (opcional, como feature avancada)
- Revisar cobertura de testes e observabilidade

### 15.5 Checklist de aceite da migracao

- CRUD completo para despesas, receitas e contas com autenticacao
- Validacoes de backend e frontend convergentes
- Testes unitarios e de integracao passando
- Sem acesso entre usuarios (isolamento por `userId`)
- Build de producao concluindo sem erro

## 16. Execucao Iniciada (2026-04-07)

Conforme o framework Feltrim, a execucao foi iniciada com governanca formal e base tecnica ativa.

Artefatos de governanca criados:

- `01-TASKLIST-PRIORITARIA.md`
- `02-ATA-REUNIAO-MULTIPERSONA.md`
- `03-RELATORIO-SOFIA-CIAO.md`
- `04-PLANO-SPRINT-1.md`

Implementacao tecnica iniciada em:

- `dashboard-financeiro/` (app Next.js)

Base ja implementada:

- Prisma + schema inicial de usuarios, despesas, receitas e contas
- NextAuth com Credentials Provider
- tRPC com procedures protegidas
- Tela inicial com login e fluxo de despesas

Proximo marco:

- Aplicar migracoes no banco alvo
- Executar seed do usuario demo
- Validar fluxo end-to-end com testes automatizados
