import { NextRequest, NextResponse } from "next/server";
import { metaAdapter } from "@/lib/adapters/meta";
import { googleAdapter } from "@/lib/adapters/google";
import { ga4Adapter } from "@/lib/adapters/ga4";
import { buildSummary } from "@/lib/adapters/base";
import { calcVariation } from "@/lib/formatters";
import { DataSourceAdapter } from "@/lib/adapters/base";

function pickAdapter(connector: string): DataSourceAdapter | null {
  switch (connector) {
    case "meta":
      return metaAdapter;
    case "google":
    case "google-ads":
      return googleAdapter;
    case "analytics":
    case "ga4":
      return ga4Adapter;
    default:
      return null;
  }
}

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

  const accountIds = sp.get("account_ids")?.split(",").filter(Boolean);

  try {
    // If "all", fetch from all 3 adapters and concat. Otherwise, one specific.
    const adapter = pickAdapter(connector);

    const [currentRows, previousRows] = await Promise.all([
      adapter
        ? adapter.fetchInsights({ dateFrom, dateTo, accountIds })
        : Promise.all([
            metaAdapter.fetchInsights({ dateFrom, dateTo, accountIds }),
            googleAdapter.fetchInsights({ dateFrom, dateTo, accountIds }),
            ga4Adapter.fetchInsights({ dateFrom, dateTo, accountIds }),
          ]).then((xs) => xs.flat()),
      adapter
        ? adapter.fetchInsights({ dateFrom: compareFrom, dateTo: compareTo, accountIds })
        : Promise.all([
            metaAdapter.fetchInsights({ dateFrom: compareFrom, dateTo: compareTo, accountIds }),
            googleAdapter.fetchInsights({ dateFrom: compareFrom, dateTo: compareTo, accountIds }),
            ga4Adapter.fetchInsights({ dateFrom: compareFrom, dateTo: compareTo, accountIds }),
          ]).then((xs) => xs.flat()),
    ]);

    const current = buildSummary(currentRows);
    const previous = buildSummary(previousRows);

    const variations = {
      spend_var: calcVariation(current.total_spend, previous.total_spend),
      clicks_var: calcVariation(current.total_clicks, previous.total_clicks),
      impressions_var: calcVariation(current.total_impressions, previous.total_impressions),
      conversions_var: calcVariation(current.total_conversions, previous.total_conversions),
      ctr_var: calcVariation(current.avg_ctr, previous.avg_ctr),
      cpc_var: calcVariation(current.avg_cpc, previous.avg_cpc),
      roas_var: calcVariation(current.avg_roas, previous.avg_roas),
    };

    return NextResponse.json({ current, previous, variations });
  } catch (err) {
    console.error("[/api/data/compare]", err);
    return NextResponse.json({ error: "Erro ao comparar periodos" }, { status: 500 });
  }
}
