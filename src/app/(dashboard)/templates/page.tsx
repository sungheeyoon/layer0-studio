import CatalogHeader from "@/components/templates/CatalogHeader";
import TemplateGrid from "@/components/templates/TemplateGrid";
import CatalogDescription from "@/components/templates/CatalogDescription";

export default function TemplatesPage() {
  return (
    <section className="p-16 flex-grow">
      <CatalogHeader />
      <TemplateGrid />
      <CatalogDescription />
    </section>
  );
}
