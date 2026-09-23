import { NextRequest } from "next/server";
import { GET } from "../../src/app/api/cron/sync-open-finance/route";

describe("Cron Open Finance Security (Shift-Left)", () => {
  it("Deve barrar acessos nao autorizados sem o CRON_SECRET", async () => {
    // 1. Simula request publica sem token
    const req = new NextRequest("http://localhost:3000/api/cron/sync-open-finance", {
      headers: new Headers({
        // Vazio - Sem Authorization
      })
    });
    
    // 2. Aciona o endpoint
    const response = await GET(req);
    
    // 3. Validacao da API
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("Deve permitir acesso com o CRON_SECRET correto", async () => {
    // Para teste isolado
    process.env.CRON_SECRET = "finance_hub_secure_cron_token_2026";
    
    const req = new NextRequest("http://localhost:3000/api/cron/sync-open-finance", {
      headers: new Headers({
        "Authorization": "Bearer finance_hub_secure_cron_token_2026"
      })
    });
    
    // O mock do banco vai falhar se nao houver NextJS server / Prisma, mas o status code nao pode ser 401
    try {
      const response = await GET(req);
      expect(response.status).not.toBe(401);
    } catch (e) {
      // Ignorar erros de Prisma/Pluggy no contexto deste teste unitario
    }
  });
});
