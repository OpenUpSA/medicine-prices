import Footer from "@/components/Footer";
import InfoPanels from "@/components/InfoPanels";
import MedicineSearch from "@/components/MedicineSearch";
import { lastUpdated } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const updated = lastUpdated();
  return (
    <>
      <article>
        <MedicineSearch />
      </article>
      <InfoPanels lastUpdated={updated} />
      <Footer lastUpdated={updated} />
    </>
  );
}
