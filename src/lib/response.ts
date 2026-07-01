import { NextResponse } from "next/server";

/**
 * JSON response with permissive CORS headers, matching the original Django
 * CORSMiddleware (Access-Control-Allow-Origin: *). The Medicine Price Registry
 * exposes a public API consumed by third parties.
 */
export function jsonResponse(data: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(data as object, init);
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "*");
  return res;
}

/** Read and trim a query-string parameter. */
export function param(request: Request, name: string): string {
  const { searchParams } = new URL(request.url);
  return (searchParams.get(name) ?? "").trim();
}
