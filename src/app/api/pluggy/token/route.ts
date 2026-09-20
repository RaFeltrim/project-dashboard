import { NextResponse } from "next/server";
import { createConnectToken } from "../../../../lib/integrations/pluggy";

export async function GET() {
  try {
    const token = await createConnectToken();
    return NextResponse.json({ accessToken: token });
  } catch (error: any) {
    console.error("[Pluggy Token Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
