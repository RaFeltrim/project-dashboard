import { createTRPCRouter } from "../trpc";
import { recurringChargeRouter } from "./recurringCharge";
import { invoiceRouter } from "./invoice";
import { mercadoPagoRouter } from "./mercadoPago";
import { dashboardRouter } from "./dashboard";
import { fastChatRouter } from "./fastChat";
import { categoryRouter } from "./category";
import { transactionRouter } from "./transaction";
import { vaultRouter } from "./vault";

export const appRouter = createTRPCRouter({
  recurringCharge: recurringChargeRouter,
  invoice: invoiceRouter,
  mercadoPago: mercadoPagoRouter,
  dashboard: dashboardRouter,
  fastChat: fastChatRouter,
  category: categoryRouter,
  transaction: transactionRouter,
  vault: vaultRouter,
});

export type AppRouter = typeof appRouter;
