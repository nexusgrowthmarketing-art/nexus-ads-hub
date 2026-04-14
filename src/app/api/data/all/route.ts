import { NextRequest, NextResponse } from "next/server";
import { metaAdapter } from "@/lib/adapters/meta";
import { googleAdapter } from "@/lib/adapters/google";
import { ga4Adapter } from "@/lib/adapters/ga4";
import { toResponse } from "@/lib/adapters/base";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dateFrom = sp.get("date_from");
  const dateTo = sp.get("date_to");

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from e date_to obrigatorios" }, { status: 400 });
  }

  try {
    const [meta, google, ga4] = await Promise.all([
      metaAdapter.fetchInsights({ dateFrom, dateTo }),
      googleAdapter.fetchInsights({ dateFrom, dateTo }),
      ga4Adapter.fetchInsights({ dateFrom, dateTo }),
    ]);

    return NextResponse.json(toResponse([...meta, ...google, ...ga4]));
  } catch (err) {
    console.error("[/api/data/all]", err);
    return NextResponse.json({ error: "Erro ao buscar dados consolidados" }, { status: 500 });
  }
}
