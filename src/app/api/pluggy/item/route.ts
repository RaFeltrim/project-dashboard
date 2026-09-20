import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { pluggyClient } from "../../../../lib/integrations/pluggy";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { itemId, userId } = await req.json();

    if (!itemId || !userId) {
      return NextResponse.json({ error: "Missing itemId or userId" }, { status: 400 });
    }

    // Obter detalhes do item no Pluggy
    const item = await pluggyClient.fetchItem(itemId);

    // Salvar no banco
    const dbItem = await prisma.pluggyItem.upsert({
      where: { pluggyItemId: itemId },
      update: {
        status: item.status,
      },
      create: {
        userId,
        pluggyItemId: itemId,
        connectorId: item.connector?.id,
        name: item.connector?.name || "Banco Desconhecido",
        status: item.status,
      }
    });

    return NextResponse.json({ success: true, item: dbItem });
  } catch (error: any) {
    console.error("[Pluggy Save Item Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
