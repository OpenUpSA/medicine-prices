import { jsonResponse, param } from "@/lib/response";
import { productByNappi, relatedProducts } from "@/lib/queries";
import { serializeProducts } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const nappi = param(request, "nappi");
  const product = productByNappi(nappi);
  if (!product) return jsonResponse([], { status: 404 });
  return jsonResponse(serializeProducts(relatedProducts(product.id)));
}
