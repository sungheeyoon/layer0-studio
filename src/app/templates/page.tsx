import { listPaginatedTemplatesAction, listCategoriesAction } from "@/app/dashboard/templates/actions";
import PublicTemplateGrid from "@/components/templates/PublicTemplateGrid";

export default async function PublicTemplatesPage() {
  const { data: templates, total: initialTotal } = await listPaginatedTemplatesAction(1, 9);
  const categories = await listCategoriesAction();

  return (
    <div className="w-full">
      <PublicTemplateGrid 
        templates={templates} 
        initialTotal={initialTotal}
        categories={categories} 
      />
    </div>
  );
}
