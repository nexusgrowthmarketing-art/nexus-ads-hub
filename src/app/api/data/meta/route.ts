import { NextRequest, NextResponse } from "next/server";
import { metaAdapter } from "@/lib/adapters/meta";
import { toResponse } from "@/lib/adapters/base";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dateFrom = sp.get("date_from");
  const dateTo = sp.get("date_to");

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from e date_to obrigatorios" }, { status: 400 });
  }

  const accountIds = sp.get("account_ids")?.split(",").filter(Boolean);

  try {
    const rows = await metaAdapter.fetchInsights({ dateFrom, dateTo, accountIds });
    return NextResponse.json(toResponse(rows));
  } catch (err) {
    console.error("[/api/data/meta]", err);
    return NextResponse.json({ error: "Erro ao buscar dados do Meta Ads" }, { status: 500 });
  }
}
