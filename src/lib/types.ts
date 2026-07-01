/** Shapes returned by the public API, used by the client UI. */

export interface LiteProduct {
  id: number;
  nappi_code: string;
  name: string;
  dosage_form: string | null;
  sep: string;
  number_of_generics: number;
}

export interface Ingredient {
  name: string;
  unit: string;
  strength: number | string;
}

export interface ProductDetail {
  id: number;
  nappi_code: string;
  regno: string;
  schedule: string | null;
  name: string;
  dosage_form: string | null;
  pack_size: number;
  num_packs: number;
  sep: string;
  cost_per_unit: string;
  dispensing_fee: string;
  is_generic: string | null;
  ingredients: Ingredient[];
  number_of_generics: number;
  copayments: { formulary: string; copayment: number }[];
  min_price: string;
  max_price: string;
  min_cost_per_unit: string;
  max_cost_per_unit: string;
}
