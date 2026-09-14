import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";

// Context
export const createTRPCContext = async (opts: { req: Request }) => {
  return {
    prisma,
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
