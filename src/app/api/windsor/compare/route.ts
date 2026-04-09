import { NextRequest, NextResponse } from "next/server";
import { windsor } from "@/lib/windsor";
import { calcVariation } from "@/lib/formatters";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dateFrom = sp.get("date_from");
  const dateTo = sp.get("date_to");
  const compareFrom = sp.get("compare_from");
  const compareTo = sp.get("compare_to");
  const connector = sp.get("connector") ?? "all";

  if (!dateFrom || !dateTo || !compareFrom || !compareTo) {
    return NextResponse.json({ error: "Parametros de data obrigatorios" }, { status: 400 });
  }

  try {
    const accountId = sp.get("account_id") ?? undefined;
    const fetchFn = connector === "meta" ? windsor.fetchMetaAds.bind(windsor)
      : connector === "google-ads" ? windsor.fetchGoogleAds.bind(windsor)
      : connector === "analytics" ? windsor.fetchAnalytics.bind(windsor)
      : windsor.fetchAll.bind(windsor);

    const [current, previous] = await Promise.all([
      fetchFn(dateFrom, dateTo, accountId),
      fetchFn(compareFrom, compareTo, accountId),
    ]);

    const variations = {
      spend_var: calcVariation(current.summary.total_spend, previous.summary.total_spend),
      clicks_var: calcVariation(current.summary.total_clicks, previous.summary.total_clicks),
      impressions_var: calcVariation(current.summary.total_impressions, previous.summary.total_impressions),
      conversions_var: calcVariation(current.summary.total_conversions, previous.summary.total_conversions),
      ctr_var: calcVariation(current.summary.avg_ctr, previous.summary.avg_ctr),
      cpc_var: calcVariation(current.summary.avg_cpc, previous.summary.avg_cpc),
      roas_var: calcVariation(current.summary.avg_roas, previous.summary.avg_roas),
    };

    return NextResponse.json({ current: current.summary, previous: previous.summary, variations });
  } catch (err) {
    console.error("[Windsor Compare]", err);
    return NextResponse.json({ error: "Erro ao comparar periodos" }, { status: 500 });
  }
}
