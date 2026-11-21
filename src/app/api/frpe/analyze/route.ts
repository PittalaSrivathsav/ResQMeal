import { NextResponse } from "next/server";
import { computeFRPEAnalysis } from "@/lib/frpe/service";
import { FRPE_WEIGHTS } from "@/lib/frpe/types";

export const revalidate = 10;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await computeFRPEAnalysis();
    return NextResponse.json(result);
  } catch (error) {
    console.error("FRPE analyze error:", error);
    return NextResponse.json(
      {
        donations: [],
        summary: { total: 0, critical: 0, high: 0, medium: 0, normal: 0, overdue: 0 },
        computedAt: new Date().toISOString(),
        weights: FRPE_WEIGHTS,
      },
      { status: 200 }
    );
  }
}
