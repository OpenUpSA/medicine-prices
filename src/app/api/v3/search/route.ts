import { jsonResponse, param } from "@/lib/response";
import { search } from "@/lib/queries";
import { serializeProducts } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// v3 search is unchanged from v2.
export function GET(request: Request) {
  const q = param(request, "q");
  return jsonResponse(serializeProducts(search(q)));
}
