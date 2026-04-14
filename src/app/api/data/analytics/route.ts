import { NextRequest, NextResponse } from "next/server";
import { ga4Adapter } from "@/lib/adapters/ga4";
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
    const rows = await ga4Adapter.fetchInsights({ dateFrom, dateTo, accountIds });
    return NextResponse.json(toResponse(rows));
  } catch (err) {
    console.error("[/api/data/analytics]", err);
    return NextResponse.json({ error: "Erro ao buscar dados do GA4" }, { status: 500 });
  }
}
