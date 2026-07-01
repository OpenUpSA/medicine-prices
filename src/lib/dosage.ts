/**
 * Maps the terse dosage-form codes stored in the database to human-readable
 * forms. Ported from the original Django serialisers.
 */
export const DOSAGE_FORM: Record<string, string> = {
  Liq: "liquid",
  Tab: "tablet",
  Cap: "capsule",
  Cps: "capsule",
  Oin: "ointment",
  Lit: "lotion",
  Lot: "lotion",
  Inj: "injection",
  Syr: "syrup",
  Dsp: "effervescent tablet",
  Eft: "effervescent tablet",
  Ear: "drops",
  Drp: "drops",
  Opd: "drops",
  Udv: "vial",
  Sus: "suspension",
  Susp: "suspension",
  Cal: "calasthetic",
  Sol: "solution",
  Sln: "solution",
  Neb: "nebuliser",
  Inh: "inhaler",
  Spo: "inhaler",
  Inf: "infusion",
  Chg: "chewing Gum",
  Vac: "vacutainer",
  Vag: "vaginal gel",
  Jel: "gel",
  Eyo: "eye ointment",
  Vat: "vaginal cream",
  Poi: "injection",
  Pow: "powder",
  Por: "powder",
  Sac: "sachet",
  Sup: "suppository",
  Cre: "cream",
  Ptd: "patch",
  Ped: "penset",
  Ect: "tablet",
  Nas: "spray",
};

export function dosageForm(code: string | null): string | null {
  if (code == null) return null;
  return DOSAGE_FORM[code] ?? code;
}
