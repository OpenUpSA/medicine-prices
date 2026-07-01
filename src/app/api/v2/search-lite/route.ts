import { jsonResponse, param } from "@/lib/response";
import { search } from "@/lib/queries";
import { serializeProductsLite } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const q = param(request, "q");
  return jsonResponse(serializeProductsLite(search(q)));
}
