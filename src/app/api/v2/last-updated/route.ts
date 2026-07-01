import { jsonResponse } from "@/lib/response";
import { lastUpdated } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return jsonResponse(lastUpdated());
}
