import { jsonResponse, param } from "@/lib/response";
import { productByNappi } from "@/lib/queries";
import { serializeProduct } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const nappi = param(request, "nappi");
  const product = productByNappi(nappi);
  if (!product) return jsonResponse({});
  return jsonResponse(serializeProduct(product));
}
