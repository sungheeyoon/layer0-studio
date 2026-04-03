export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full h-16 px-10 flex justify-between items-center bg-surface border-b border-surface-container z-50">
      <div className="text-sm font-medium tracking-widest uppercase text-primary">
        Layer0 Studio
      </div>

      <div className="hidden md:flex gap-10 text-xs uppercase">
        <a className="text-primary border-b border-primary pb-1">Features</a>
        <a className="text-outline hover:text-primary">Solutions</a>
        <a className="text-outline hover:text-primary">Pricing</a>
        <a className="text-outline hover:text-primary">Docs</a>
      </div>

      <div className="flex gap-4 text-xs uppercase">
        <button className="text-outline hover:text-primary">Sign In</button>
        <button className="bg-primary text-on-primary px-4 py-2">
          Get Started
        </button>
      </div>
    </nav>
  );
}