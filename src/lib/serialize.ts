import { dosageForm } from "./dosage";
import {
  asCurrency,
  costPerUnit,
  dispensingFee,
  intOrFloat,
  maxFee,
  minCostPerUnit,
} from "./pricing";
import {
  ingredientsForProduct,
  relatedProducts,
  relatedProductsCount,
  type IngredientRow,
  type ProductRow,
} from "./queries";

function serializeIngredient(i: IngredientRow) {
  return {
    name: i.name,
    unit: i.unit,
    strength: intOrFloat(i.strength),
  };
}

/** Full product serialization (API v2 detail / search). */
export function serializeProduct(p: ProductRow) {
  return {
    id: p.id,
    nappi_code: p.nappi_code,
    regno: (p.regno ?? "").toUpperCase(),
    schedule: p.schedule,
    name: p.name,
    dosage_form: dosageForm(p.dosage_form),
    pack_size: p.pack_size,
    num_packs: p.num_packs,
    sep: asCurrency(maxFee(p.sep)),
    cost_per_unit: asCurrency(costPerUnit(p.sep, p.pack_size, p.num_packs)),
    dispensing_fee: asCurrency(dispensingFee(p.sep)),
    is_generic: p.is_generic,
    ingredients: ingredientsForProduct(p.id).map(serializeIngredient),
    number_of_generics: relatedProductsCount(p.id),
    copayments: [] as { formulary: string; copayment: number }[],
  };
}

/** API v3 detail: separates SEP from fees and exposes price/cost ranges. */
export function serializeProductV3(p: ProductRow) {
  const details = serializeProduct(p);
  return {
    ...details,
    sep: asCurrency(p.sep),
    min_price: asCurrency(p.sep),
    max_price: asCurrency(p.sep + dispensingFee(p.sep)),
    min_cost_per_unit: asCurrency(minCostPerUnit(p.sep, p.pack_size, p.num_packs)),
    max_cost_per_unit: asCurrency(costPerUnit(p.sep, p.pack_size, p.num_packs)),
  };
}

/** Lightweight serialization used by the search-lite autocomplete results. */
export function serializeProductLite(p: ProductRow) {
  let name = p.name;
  const ingredients = ingredientsForProduct(p.id);
  if (ingredients.length === 1) {
    const ing = ingredients[0];
    const form = dosageForm(p.dosage_form);
    name = `${name} (${intOrFloat(ing.strength)}${ing.unit} ${form})`;
  }
  return {
    id: p.id,
    nappi_code: p.nappi_code,
    name,
    dosage_form: dosageForm(p.dosage_form),
    sep: asCurrency(maxFee(p.sep)),
    number_of_generics: relatedProductsCount(p.id),
  };
}

export function serializeProducts(products: ProductRow[]) {
  return products.map(serializeProduct);
}

export function serializeProductsLite(products: ProductRow[]) {
  return products.map(serializeProductLite);
}

/** Re-export for convenience in route handlers. */
export { relatedProducts };
