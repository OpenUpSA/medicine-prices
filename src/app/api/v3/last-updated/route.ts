import { jsonResponse } from "@/lib/response";
import { lastUpdated } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// v3 last-updated is unchanged from v2.
export function GET() {
  return jsonResponse(lastUpdated());
}
