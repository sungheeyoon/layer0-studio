import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Hero />
        <Features />

        {/* Admin Dashboard Preview (Asymmetric Layout) */}
        <section className="bg-surface-container-low py-32 px-10 border-b border-surface-container">
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 mb-16 lg:mb-0">
              <h2 className="text-4xl font-light text-primary mb-8 tracking-tight">The Technical View.</h2>
              <p className="text-outline font-light text-sm mb-12 max-w-sm">
                Manage complex data structures through a simplified technical interface. No distractions, just structure.
              </p>
              <ul className="space-y-4 font-['Inter'] font-light text-[0.6875rem] tracking-wider uppercase text-on-surface">
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-primary"></span> Node Architecture
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-outline"></span> Metadata Mapping
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-outline"></span> Global State Control
                </li>
              </ul>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white border border-outline-variant p-1 relative">
                <div className="border border-outline-variant p-8 aspect-video flex flex-col">
                  <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-8">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-tertiary"></div>
                      <div className="w-2 h-2 border border-outline"></div>
                      <div className="w-2 h-2 border border-outline"></div>
                    </div>
                    <div className="text-[0.6rem] font-mono text-outline">PROJECT_ALPHA_STABLE_V1.EXE</div>
                  </div>
                  <div className="flex-grow grid grid-cols-4 gap-4">
                    <div className="col-span-1 border border-dashed border-outline-variant p-4"></div>
                    <div className="col-span-3 space-y-4">
                      <div className="h-4 bg-surface-container-highest w-3/4"></div>
                      <div className="h-4 bg-surface-container-highest w-1/2"></div>
                      <div className="h-32 border border-outline-variant flex items-center justify-center text-outline font-mono text-[0.6rem]">
                        CANVAS_PREVIEW_AREA
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-8 bg-primary"></div>
                        <div className="h-8 border border-primary"></div>
                        <div className="h-8 border border-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xs">add</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Steps) */}
        <section className="py-32 px-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-4 border-l border-outline-variant pl-8 pt-4">
                <span className="text-[4rem] font-thin text-outline-variant leading-none mb-4 block">01</span>
                <h4 className="text-sm font-medium uppercase tracking-widest mb-4">Define Structure</h4>
                <p className="text-outline font-light text-sm leading-relaxed">
                  Map your content requirements to our flexible node-based system.
                </p>
              </div>
              <div className="md:col-span-4 border-l border-outline-variant pl-8 pt-4">
                <span className="text-[4rem] font-thin text-outline-variant leading-none mb-4 block">02</span>
                <h4 className="text-sm font-medium uppercase tracking-widest mb-4">Select Blueprint</h4>
                <p className="text-outline font-light text-sm leading-relaxed">
                  Apply a pre-engineered design template or draft your own from primitives.
                </p>
              </div>
              <div className="md:col-span-4 border-l border-outline-variant pl-8 pt-4">
                <span className="text-[4rem] font-thin text-outline-variant leading-none mb-4 block">03</span>
                <h4 className="text-sm font-medium uppercase tracking-widest mb-4">Deploy Instant</h4>
                <p className="text-outline font-light text-sm leading-relaxed">
                  Launch with a single command to our global high-performance edge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Template Preview */}
        <section className="py-32 px-10 bg-surface-container">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-4">Drafts &amp; Blueprints.</h2>
              <p className="text-outline text-sm uppercase tracking-widest">Library version 8.0.1</p>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant border border-outline-variant">
              <div className="bg-surface p-12 aspect-square flex flex-col justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Blueprint 1"
                  className="w-full h-2/3 object-cover grayscale opacity-80"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjuIKOzgZUhX-yxrKmNF8qDjaUfVprg-7cKGW-4avB6oMdB1UrSDsx68H9OEql_HTN9ZN8RFuniJwrIEvvkDfgRtdi5SMSlRqwe4q8PBea-ghFaSf3HjbK_wJYwwOzv_hEIctwo3cVpxwq9_YzX6BN0qkaoPUJ6-VGulmfYslcKB6Oxvbj5jyRpv4mh5DpSPNxybwDcIB9igiGzDWw5Jkn80KZE_E3PI6oT8ShhIdfyzdSR7obgsiKBCvU04vonU7Ej2GnKGA3TvHI"
                />
                <div>
                  <h5 className="text-sm font-medium uppercase tracking-widest">Bauhaus-01</h5>
                  <p className="text-xs text-outline mt-1 font-light">Minimalist editorial focus.</p>
                </div>
              </div>
              <div className="bg-surface p-12 aspect-square flex flex-col justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Blueprint 2"
                  className="w-full h-2/3 object-cover grayscale opacity-80"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVVHoVfLc-2iIvTMbxvDxpge58TgXyjBznOfKfJjJI3L-coDdyvu5Vo9jST2ngVxQA_-eDbGd6QL1Y-KMnJeJmSaZhwMcH7YJL6PbrumM-59Lp6ltqJ2W7qnAx4GmCCzBaUm1nxXo1XiTZkQEM945mag3j4GT-fe71tkm56Wx43McXbWzZYN32HxTDgh0en6KlcfryE9kxI7nr8ZB5TsmfpbIYMpKoBDzyIzOLoioJqrLQAG5cEH5rUXMsIUNGJVVIr-rlZDdjSEo5"
                />
                <div>
                  <h5 className="text-sm font-medium uppercase tracking-widest">Nordic-04</h5>
                  <p className="text-xs text-outline mt-1 font-light">High-end commerce layout.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Pricing />

        {/* CTA Section */}
        <section className="py-48 px-10 grid-blueprint flex flex-col items-center justify-center text-center">
          <h2 className="text-5xl md:text-7xl font-light mb-12 tracking-tight max-w-4xl">
            Ready to architect your digital presence?
          </h2>
          <div className="flex gap-4">
            <button className="bg-primary text-on-primary px-12 py-6 text-sm font-medium uppercase tracking-[0.2em]">
              Start Drafting
            </button>
            <button className="border border-outline px-12 py-6 text-sm font-medium uppercase tracking-[0.2em] hover:bg-surface-container transition-colors">
              View Demo
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}