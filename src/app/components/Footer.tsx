export default function Footer() {
  return (
    <footer className="border-t border-surface-container px-10 py-10 text-xs text-outline flex justify-between">
      <div>© 2024 LAYER0 STUDIO</div>

      <div className="flex gap-6">
        <a className="hover:text-primary">Terms</a>
        <a className="hover:text-primary">Privacy</a>
        <a className="hover:text-primary">Security</a>
      </div>
    </footer>
  );
}