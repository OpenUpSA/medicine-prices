import { jsonResponse, param } from "@/lib/response";
import { searchByNappi } from "@/lib/queries";
import { serializeProducts } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const nappi = param(request, "nappi");
  if (nappi.length < 3) return jsonResponse([]);
  return jsonResponse(serializeProducts(searchByNappi(nappi)));
}
