"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiteProduct, ProductDetail } from "@/lib/types";

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

function dfClass(dosageForm: string | null): string {
  if (!dosageForm) return "";
  return "df-" + dosageForm.toLowerCase().replace(/\s+/g, "-");
}

type Mode = { kind: "search"; query: string } | { kind: "related"; nappi: string };

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

/** Parse the current hash into { base, expandedNappi }. */
function parseHash(hash: string): { base: string; expandedNappi: string | null } {
  const raw = hash.replace(/^#/, "");
  const pipeIdx = raw.indexOf("|");
  const base = pipeIdx === -1 ? raw : raw.slice(0, pipeIdx);
  const suffix = pipeIdx === -1 ? "" : raw.slice(pipeIdx + 1);
  const expandedNappi =
    suffix.startsWith("expanded:")
      ? decodeURIComponent(suffix.slice("expanded:".length))
      : null;
  return { base, expandedNappi };
}

export default function MedicineSearch({
  initialNappi,
}: {
  initialNappi?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LiteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [heading, setHeading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ProductDetail>>({});
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load detail data whenever expanded changes and we don't have it cached.
  useEffect(() => {
    if (!expanded || details[expanded]) return;
    let cancelled = false;
    fetchJSON<ProductDetail>(`/api/v3/detail?nappi=${encodeURIComponent(expanded)}`)
      .then((data) => {
        if (!cancelled) setDetails((prev) => ({ ...prev, [expanded]: data }));
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "There was a problem getting the details for this medicine. Please try again later."
          );
          setExpanded(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, details]);

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON<LiteProduct[]>(
        `/api/v2/search-lite?q=${encodeURIComponent(q)}`
      );
      setResults(data);
      setHeading("Matching products and/or ingredients");
      setSearched(true);
    } catch {
      setError("Something went wrong while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRelated = useCallback(async (nappi: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON<LiteProduct[]>(
        `/api/v2/related?nappi=${encodeURIComponent(nappi)}`
      );
      setResults(data);
      setHeading("Generics and related products");
      setSearched(true);
      setExpanded(null);
    } catch {
      setError(
        "There was a problem getting related products. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const applyMode = useCallback(
    (mode: Mode) => {
      if (mode.kind === "search") {
        setQuery(mode.query);
        runSearch(mode.query);
      } else {
        loadRelated(mode.nappi);
      }
    },
    [runSearch, loadRelated]
  );

  // Sync from the URL hash so #search:term and #related:nappi links are shareable.
  // Also supports #search:term|expanded:NAPPI to deep-link to an open panel.
  useEffect(() => {
    function fromHash() {
      const { base, expandedNappi } = parseHash(window.location.hash);
      const idx = base.indexOf(":");
      if (idx !== -1) {
        const key = base.slice(0, idx);
        const value = decodeURIComponent(base.slice(idx + 1));
        if (key === "search" && value.length >= MIN_QUERY_LENGTH) {
          applyMode({ kind: "search", query: value });
        } else if (key === "related" && value) {
          applyMode({ kind: "related", nappi: value });
        }
      }
      if (expandedNappi) {
        setExpanded(expandedNappi);
      }
    }

    if (initialNappi) {
      window.location.hash = `related:${initialNappi}`;
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onInput(value: string) {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearched(false);
      setHeading(null);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      window.location.hash = `search:${encodeURIComponent(value.trim())}`;
    }, SEARCH_DEBOUNCE_MS);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setHeading(null);
    setExpanded(null);
    setError(null);
    history.replaceState(null, "", " ");
  }

  function toggleDetail(nappi: string) {
    const { base } = parseHash(window.location.hash);
    if (expanded === nappi) {
      setExpanded(null);
      history.replaceState(null, "", `#${base}`);
    } else {
      setExpanded(nappi);
      history.replaceState(
        null,
        "",
        `#${base}|expanded:${encodeURIComponent(nappi)}`
      );
    }
  }

  return (
    <div id="search-container">
      <label htmlFor="entrybox">Search for a medicine:</label>
      <div className="search-field">
        <input
          type="text"
          id="entrybox"
          value={query}
          onChange={(e) => onInput(e.target.value)}
          placeholder="e.g. salbutamol or asthavent"
          autoComplete="off"
        />
        {loading ? (
          <span className="search-spinner" aria-hidden="true" />
        ) : query ? (
          <button className="clear-btn" onClick={clearSearch} aria-label="Clear search">
            ×
          </button>
        ) : null}
      </div>

      {error && <p className="noresults">{error}</p>}

      {heading && results.length > 0 && (
        <p id="resultsheader">
          {heading}: {results.length}
        </p>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <p className="noresults">No matching products found.</p>
      )}

      <div className="products">
        {results.map((p) => {
          const isExpanded = expanded === p.nappi_code;
          const alternativeCount = p.number_of_generics - 1;
          return (
            <div
              key={`${p.id}-${p.nappi_code}`}
              className={`product ${dfClass(p.dosage_form)}`}
            >
              <button
                className="panel-heading"
                onClick={() => toggleDetail(p.nappi_code)}
                aria-expanded={isExpanded}
              >
                <span className="product-name">{p.name}</span>
                <span className="right-info">
                  <span className="product-price">{p.sep}</span>
                  {alternativeCount > 0 && (
                    <span className="find-generic">
                      <a
                        href={`#related:${p.nappi_code}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {alternativeCount === 1
                          ? "Find 1 generic"
                          : `Find ${alternativeCount} generics`}
                      </a>
                    </span>
                  )}
                </span>
              </button>
              {isExpanded && (
                <ProductDetailPanel detail={details[p.nappi_code]} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductDetailPanel({ detail }: { detail?: ProductDetail }) {
  if (!detail) {
    return (
      <div className="panel-body">
        <div className="skeleton-col">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-line" />
          ))}
        </div>
        <div className="skeleton-col">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-line" />
          ))}
        </div>
      </div>
    );
  }

  const isUnitForm =
    detail.dosage_form === "tablet" || detail.dosage_form === "capsule";

  return (
    <>
      <div className="panel-body">
        <div className="details">
          <h4>Product details</h4>
          <dl className="detail-list">
            <dt>Medicine Single Exit Price:</dt>
            <dd>{detail.sep}</dd>
            <dt>Max dispensing fee:</dt>
            <dd>{detail.dispensing_fee}</dd>
            <dt>Price range (incl VAT and fees):</dt>
            <dd>
              {detail.min_price} - {detail.max_price}
            </dd>
            {isUnitForm && (
              <>
                <dt>Cost per unit:</dt>
                <dd>
                  {detail.min_cost_per_unit} / {detail.dosage_form} -{" "}
                  {detail.max_cost_per_unit} / {detail.dosage_form}
                </dd>
              </>
            )}
            <dt>Schedule:</dt>
            <dd>{detail.schedule ?? "-"}</dd>
            <dt>Dosage Form:</dt>
            <dd>{detail.dosage_form ?? "-"}</dd>
            <dt>Tablets/ml/Doses:</dt>
            <dd>{detail.pack_size}</dd>
            <dt>Number of packs:</dt>
            <dd>{detail.num_packs}</dd>
            <dt>Generic/Innovator:</dt>
            <dd>{detail.is_generic ?? "-"}</dd>
          </dl>
        </div>
        <div className="ingredients">
          <h4>Ingredients</h4>
          <dl className="ingredient-list">
            {detail.ingredients.map((ing, i) => (
              <div key={i}>
                <dt>{ing.name.trim()}:</dt>
                <dd>
                  {ing.strength}
                  {ing.unit}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="panel-footer">
        <p>Registration number: {detail.regno}</p>
      </div>
    </>
  );
}
