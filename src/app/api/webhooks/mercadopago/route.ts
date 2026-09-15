import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Validação básica do payload MP
    if (!payload.data || !payload.data.id) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    // No futuro: Chamar API do MP para pegar os detalhes do payment id
    // const payment = await fetch(`https://api.mercadopago.com/v1/payments/${payload.data.id}`, { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } })

    // Para o MVP (mock): salvamos um log no console ou mock no DB
    console.log("[Mercado Pago Webhook] Notificação recebida:", payload);

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook] Erro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
