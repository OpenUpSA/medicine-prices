import type { Metadata } from "next";
import Footer from "@/components/Footer";
import InfoPanels from "@/components/InfoPanels";
import MedicineSearch from "@/components/MedicineSearch";
import { lastUpdated, productByNappi } from "@/lib/queries";
import { maxFee } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ nappi: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { nappi } = await params;
  const product = productByNappi(nappi);
  if (!product) return { title: "MPR (Medicine Price Registry)" };
  return {
    title: `MPR (Medicine Price Registry) - ${product.name}`,
    description: `${product.name} ${product.pack_size} ${product.dosage_form ?? ""}`.trim(),
  };
}

export default async function RelatedPage({ params }: Params) {
  const { nappi } = await params;
  const product = productByNappi(nappi);
  const updated = lastUpdated();

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: product.name,
              description: `${product.name} ${product.pack_size} ${product.dosage_form ?? ""}`.trim(),
              sku: product.nappi_code,
              productID: product.nappi_code,
              offers: {
                "@type": "Offer",
                url: `/related/${product.nappi_code}/`,
                price: maxFee(product.sep).toFixed(2),
                priceCurrency: "ZAR",
              },
            }),
          }}
        />
      )}
      <article>
        <MedicineSearch initialNappi={nappi} />
      </article>
      <InfoPanels lastUpdated={updated} />
      <Footer lastUpdated={updated} />
    </>
  );
}
