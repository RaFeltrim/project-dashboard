import cron from "node-cron";
import { processRecurringCharges } from "./recurringCharges";

export function initScheduler() {
  console.log("Iniciando scheduler de tarefas (node-cron)...");

  // Roda todo dia à meia-noite (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("Rodando tarefas diárias programadas...");
    await processRecurringCharges();
  });
}
