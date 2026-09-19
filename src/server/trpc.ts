import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Context
export const createTRPCContext = async (opts: { req: Request }) => {
  const session = await getServerSession(authOptions);

  return {
    prisma,
    session,
    req: opts.req,
  };
};

// tRPC init
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Routers and procedures
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session!.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
