import { LayoutGrid, MousePointerClick, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Messages } from "@/lib/i18n/messages/ko";

export default function Features({
  copy,
}: {
  copy: Messages["landing"]["features"];
}) {
  const items = [
    { icon: LayoutGrid, ...copy.layouts },
    { icon: MousePointerClick, ...copy.editing },
    { icon: Rocket, ...copy.publishing },
  ];

  return (
    <section className="border-b border-border px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="border-border">
            <CardContent className="flex flex-col gap-4 p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-title">{title}</h3>
              <p className="text-body text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
