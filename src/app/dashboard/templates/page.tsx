import DynamicTemplateGrid from "@/components/templates/DynamicTemplateGrid";
import { listPaginatedTemplatesAction, listMySitesAction, listCategoriesAction } from "./actions";

export default async function TemplatesPage() {
  const { data: templates, total: initialTotal } = await listPaginatedTemplatesAction(1, 6);
  const mySites = await listMySitesAction();
  const categories = await listCategoriesAction();

  return (
    <div className="w-full">
      <DynamicTemplateGrid
        templates={templates}
        initialTotal={initialTotal}
        mySites={mySites}
        categories={categories}
      />
    </div>
  );
}
