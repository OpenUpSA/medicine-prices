import { db } from "./db";

export interface ProductRow {
  id: number;
  nappi_code: string;
  regno: string;
  name: string;
  schedule: string | null;
  dosage_form: string | null;
  pack_size: number;
  num_packs: number;
  sep: number;
  is_generic: string | null;
}

export interface IngredientRow {
  name: string;
  unit: string;
  strength: string;
}

const PRODUCT_COLUMNS = `id, nappi_code, regno, name, schedule, dosage_form, pack_size, num_packs, sep, is_generic`;

/** Exact match on nappi_code, cheapest first. */
export function searchByNappi(nappi: string): ProductRow[] {
  return db()
    .prepare(
      `SELECT ${PRODUCT_COLUMNS} FROM mpr_product WHERE nappi_code = ? ORDER BY sep`
    )
    .all(nappi) as ProductRow[];
}

/** Case-insensitive substring match on the product name, cheapest first. */
export function searchByProductName(pattern: string): ProductRow[] {
  return db()
    .prepare(
      `SELECT ${PRODUCT_COLUMNS} FROM mpr_product
       WHERE name LIKE ? COLLATE NOCASE ORDER BY sep`
    )
    .all(`%${pattern}%`) as ProductRow[];
}

/**
 * Products whose active ingredient name matches the pattern, cheapest first.
 * Mirrors the original: gather products for matching ingredients, keep those
 * with a price.
 */
export function searchByIngredient(pattern: string): ProductRow[] {
  return db()
    .prepare(
      `SELECT DISTINCT ${PRODUCT_COLUMNS.split(", ")
        .map((c) => `p.${c}`)
        .join(", ")}
       FROM mpr_product p
       JOIN mpr_productingredient pi ON pi.product_id = p.id
       JOIN mpr_ingredient i ON i.id = pi.ingredient_id
       WHERE i.name LIKE ? COLLATE NOCASE AND p.sep IS NOT NULL
       ORDER BY p.sep`
    )
    .all(`%${pattern}%`) as ProductRow[];
}

/**
 * Combined search across nappi code, product name and ingredient in a single
 * query. Deduplication and ordering are handled by the database.
 */
export function search(query: string): ProductRow[] {
  if (query.length < 3) return [];
  const cols = PRODUCT_COLUMNS.split(", ").map((c) => `p.${c}`).join(", ");
  return db()
    .prepare(
      `SELECT DISTINCT ${cols}
       FROM mpr_product p
       WHERE
         p.nappi_code = ?
         OR p.name LIKE ? COLLATE NOCASE
         OR (p.sep IS NOT NULL AND EXISTS (
           SELECT 1 FROM mpr_productingredient pi
           JOIN mpr_ingredient i ON i.id = pi.ingredient_id
           WHERE pi.product_id = p.id AND i.name LIKE ? COLLATE NOCASE
         ))
       ORDER BY p.sep`
    )
    .all(query, `%${query}%`, `%${query}%`) as ProductRow[];
}

/** Fetch a single product by nappi code (first match). */
export function productByNappi(nappi: string): ProductRow | undefined {
  return db()
    .prepare(`SELECT ${PRODUCT_COLUMNS} FROM mpr_product WHERE nappi_code = ?`)
    .get(nappi) as ProductRow | undefined;
}

/** Ingredient list (name, unit, strength) for a product. */
export function ingredientsForProduct(productId: number): IngredientRow[] {
  return db()
    .prepare(
      `SELECT i.name AS name, i.unit AS unit, pi.strength AS strength
       FROM mpr_productingredient pi
       JOIN mpr_ingredient i ON i.id = pi.ingredient_id
       WHERE pi.product_id = ?`
    )
    .all(productId) as IngredientRow[];
}

interface PairRow {
  ingredient_id: number;
  strength: string;
}

function ingredientPairs(productId: number): PairRow[] {
  return db()
    .prepare(
      `SELECT ingredient_id, strength FROM mpr_productingredient WHERE product_id = ?`
    )
    .all(productId) as PairRow[];
}

/**
 * Build the WHERE fragment + params that select products sharing exactly the
 * same set of (ingredient, strength) pairs as the given product.
 *
 * A related product must:
 *   - contain the same NUMBER of ingredient rows, and
 *   - match every (ingredient_id, strength) pair of the source product.
 *
 * Ported from Product.related_products in the original models.
 */
function relatedProductIdsSql(productId: number): {
  sql: string;
  params: unknown[];
} {
  const pairs = ingredientPairs(productId);
  const n = pairs.length;

  if (n === 0) {
    return { sql: "SELECT NULL AS id WHERE 0", params: [] };
  }

  const tuplePlaceholders = pairs.map(() => "(?, ?)").join(", ");
  const params: unknown[] = [];
  for (const p of pairs) {
    params.push(p.ingredient_id, p.strength);
  }

  const sql = `
    SELECT p.id AS id
    FROM mpr_product p
    WHERE (
      SELECT COUNT(*) FROM mpr_productingredient pi WHERE pi.product_id = p.id
    ) = ${n}
    AND (
      SELECT COUNT(*) FROM mpr_productingredient pi
      WHERE pi.product_id = p.id
      AND (pi.ingredient_id, pi.strength) IN (VALUES ${tuplePlaceholders})
    ) = ${n}
  `;
  return { sql, params };
}

/** Products with the same active ingredients & strengths, cheapest first. */
export function relatedProducts(productId: number): ProductRow[] {
  const { sql, params } = relatedProductIdsSql(productId);
  return db()
    .prepare(
      `SELECT ${PRODUCT_COLUMNS} FROM mpr_product
       WHERE id IN (${sql}) ORDER BY sep`
    )
    .all(...params) as ProductRow[];
}

/** Count of related (generic) products. Cheaper than fetching them all. */
export function relatedProductsCount(productId: number): number {
  const { sql, params } = relatedProductIdsSql(productId);
  const row = db()
    .prepare(`SELECT COUNT(*) AS c FROM (${sql})`)
    .get(...params) as { c: number };
  return row.c;
}

/** Most recent update date as an ISO string (YYYY-MM-DD). */
export function lastUpdated(): string | null {
  const row = db()
    .prepare(`SELECT update_date FROM mpr_lastupdated ORDER BY update_date DESC LIMIT 1`)
    .get() as { update_date: string } | undefined;
  return row?.update_date ?? null;
}
