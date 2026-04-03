export default function TemplateGrid() {
  return (
    <div className="grid grid-cols-12 gap-px bg-outline-variant border border-outline-variant">
      {/* Template 01 */}
      <div className="col-span-12 md:col-span-8 bg-surface p-12">
        <div className="aspect-video bg-surface-container-highest mb-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Template 01"
            className="w-full h-full object-cover grayscale opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwl5WvHIvO3QQFHOa1UBa3whOjVVEXjwtMQsU-z1k7FFXsDjC9rosrmeNNDDljwAHL7zZNP2IhtasufVXPtgzFutPimbwQO5xdepX5tcfO0Vpd6L9TpRTWgFgPed9WlXJ8Rd77LhslV1egr6yfQaAtL4ipbuo8AaRUV4vnIA4jnWMOwuXV0ARHggBnrQij93MosY7zNFiFbLyQQmZfbWg26gaI-50dC5hUo4Q2sdnBTNyTwigy4pA-IvLIqsHBVZqkOBBAJUAVvktZ"
          />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] text-tertiary mb-2 block">
              01 / Structural
            </span>
            <h2 className="font-['Inter'] font-light text-2xl tracking-wider uppercase">Monolith Frame</h2>
          </div>
          <button className="border border-outline px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-colors">
            Preview
          </button>
        </div>
      </div>

      {/* Template 02 */}
      <div className="col-span-12 md:col-span-4 bg-surface p-12">
        <div className="aspect-square bg-surface-container-highest mb-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Template 02"
            className="w-full h-full object-cover grayscale opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPBkFqNy65V6oxLab3LKqMsi1vnKtruuhqIUjFKXJO_aantZCeiGJtdEjLiDhzintzaMyeglGFsDYDclysRcwsbArX2r4qP-vieE2GFDO8wirmI3dkNdOt8JbLzc2FED_y2hJAh0REpLw4yw0ua8hLQSo3gyH27JPdEJQ1B_rbLBytgn7kJ1Rfdr-OrKC2BJBe0z8R_LVuZfVmH2y6h-JI5QDrQJvcA4U561JASGPKMqF1VkzvvFJLEf3JTOBtDHl2-czXZY6b3Dj9"
          />
        </div>
        <div>
          <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] text-outline mb-2 block">
            02 / Minimal
          </span>
          <h2 className="font-['Inter'] font-light text-xl tracking-wider uppercase">Void Space</h2>
          <div className="mt-8 pt-8 border-t border-outline-variant/30">
            <p className="font-['Inter'] font-light text-[0.875rem] leading-relaxed text-on-surface-variant">
              Optimized for high-end editorial content and photography-led narratives.
            </p>
          </div>
        </div>
      </div>

      {/* Template 03 */}
      <div className="col-span-12 md:col-span-4 bg-surface p-12">
        <div className="aspect-square bg-surface-container-highest mb-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Template 03"
            className="w-full h-full object-cover grayscale opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSDD8JWjzadbXgz8cXWKAH9QRr_hjgg9cb_4Z7Bw8xniclqr1p86yBwQUoGB4HVpve2wmduEbiITdmPF5G0v69Sh__bNNLpg-A_qzMTl0D8Ws8jXAdbLHoMMnKHmxMIZyA0MXJTfbx8oGA717MNR4NuGUDefZ0nXNMbmafkt9x9IS4QzWMY8ETPYvZBw-UeHH4v-i5cEiPRWPdaogVXdND-GwwBhF9sLzPy-WwXp17XzTO6SAgYkLTPXiItzswLDXcVhmFIgbYTcye"
          />
        </div>
        <div>
          <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] text-outline mb-2 block">
            03 / Technical
          </span>
          <h2 className="font-['Inter'] font-light text-xl tracking-wider uppercase">Linear Grid</h2>
        </div>
      </div>

      {/* Template 04 */}
      <div className="col-span-12 md:col-span-8 bg-surface p-12">
        <div className="aspect-video bg-surface-container-highest mb-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Template 04"
            className="w-full h-full object-cover grayscale opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9-HQov7cqH0P_8cd7WKFfsO0V0YMIiFDbMw43F6T3nx_2YkURncihLO0Tlu8hROvDf2h8UdLNUFB2Sq5U6n9AWwYZZGXERqCaNGNLbY4PnjoFbwk0SCnoXUVYmkPybXogJFm-BNsp82McwcV6UN6tPd9BmnSDpu66xKu9E8p4tCu0Ua8fd4Wbv5V7iCjNZmkIqzN-zinrXEbpmjQKiYiI_E9hLw4S30tw9ZrPd_0TEWya6iUpehpajn_GlCXWik6J1NMf9y1KKsBb"
          />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] text-outline mb-2 block">
              04 / Brutalist
            </span>
            <h2 className="font-['Inter'] font-light text-2xl tracking-wider uppercase">Raw Material</h2>
          </div>
          <button className="border border-outline px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-colors">
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
