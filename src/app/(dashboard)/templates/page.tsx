import CatalogHeader from "@/components/templates/CatalogHeader";
import CatalogDescription from "@/components/templates/CatalogDescription";
import DynamicTemplateGrid from "@/components/templates/DynamicTemplateGrid";
import { listActiveTemplatesAction, listMySitesAction } from "./actions";

export default async function TemplatesPage() {
  const templates = await listActiveTemplatesAction();
  const mySites = await listMySitesAction();

  return (
    <section className="p-16 flex-grow">
      <CatalogHeader />
      <DynamicTemplateGrid templates={templates} mySites={mySites} />
      <CatalogDescription />
    </section>
  );
}
