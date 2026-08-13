import EditorBackLink from './EditorBackLink';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center border-b border-border bg-card px-4">
        <EditorBackLink />
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
