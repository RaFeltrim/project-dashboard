import { prisma } from "../../lib/prisma";
import { MotorType } from "@prisma/client";

export async function processRecurringCharges() {
  console.log("Executando job de Cartão Tia (Recorrências)...");
  
  const now = new Date();
  
  // Buscar todas as recorrências ativas cujo próximo vencimento seja menor ou igual a hoje
  const charges = await prisma.recurringCharge.findMany({
    where: {
      active: true,
      nextChargeAt: {
        lte: now,
      },
    },
  });

  if (charges.length === 0) {
    console.log("Nenhuma recorrência pendente.");
    return;
  }

  for (const charge of charges) {
    // 1. Criar a transação
    let transactionDesc = charge.description;
    if (charge.isInstallment && charge.installmentIndex && charge.installmentTotal) {
      transactionDesc += ` (Parcela ${charge.installmentIndex}/${charge.installmentTotal})`;
    }

    await prisma.transaction.create({
      data: {
        userId: charge.userId,
        motor: MotorType.CARTAO_TIA,
        amount: charge.amount,
        rawDescription: transactionDesc,
        normalizedDescription: transactionDesc,
        occurredAt: now,
      },
    });

    // 2. Atualizar a recorrência para o próximo mês ou finalizar se for a última parcela
    let nextActive = charge.active;
    let nextIndex = charge.installmentIndex;
    let nextChargeAt = charge.nextChargeAt ? new Date(charge.nextChargeAt) : new Date();

    if (charge.isInstallment && charge.installmentIndex && charge.installmentTotal) {
      if (charge.installmentIndex >= charge.installmentTotal) {
        // Acabaram as parcelas
        nextActive = false;
        nextChargeAt = charge.nextChargeAt as Date; // Mantém o mesmo, inativo
      } else {
        nextIndex = charge.installmentIndex + 1;
        nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);
      }
    } else {
      // Recorrência infinita
      nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);
    }

    await prisma.recurringCharge.update({
      where: { id: charge.id },
      data: {
        active: nextActive,
        installmentIndex: nextIndex,
        lastChargedAt: now,
        nextChargeAt,
      },
    });

    console.log(`Recorrência processada: ${charge.description}`);
  }
}
