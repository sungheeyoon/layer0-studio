import EditorControls from "@/components/editor/EditorControls";
import PreviewCanvas from "@/components/editor/PreviewCanvas";

export default function EditorPage() {
  return (
    <main className="p-10 min-h-[calc(100vh-124px)] flex gap-10">
      <EditorControls />
      <PreviewCanvas />
    </main>
  );
}
