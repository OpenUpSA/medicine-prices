import { jsonResponse, param } from "@/lib/response";
import { searchByIngredient } from "@/lib/queries";
import { serializeProducts } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const q = param(request, "q");
  if (q.length < 3) return jsonResponse([]);
  return jsonResponse(serializeProducts(searchByIngredient(q)));
}
