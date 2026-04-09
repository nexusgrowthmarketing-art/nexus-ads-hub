import { NextRequest, NextResponse } from "next/server";
import { windsor } from "@/lib/windsor";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dateFrom = sp.get("date_from");
  const dateTo = sp.get("date_to");
  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from e date_to obrigatorios" }, { status: 400 });
  }
  try {
    const result = await windsor.fetchAll(dateFrom, dateTo);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Windsor All]", err);
    return NextResponse.json({ error: "Erro ao buscar dados consolidados" }, { status: 500 });
  }
}
