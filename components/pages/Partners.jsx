export default function Partners() {
  const partners = [
    { name: "Google", logo: "/logo/google.svg" },
    { name: "Microsoft", logo: "/logo/microsoft.svg" },
    { name: "Apple", logo: "/logo/apple.svg" },
    { name: "Amazon", logo: "/logo/amazon.svg" },
    { name: "Facebook", logo: "/logo/facebook.svg" },
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-600 mb-4">
            Strategic Alliances
          </h2>
          <h3 className="text-3xl font-black text-slate-900 mb-4">
            Trusted by Industry <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">Leaders</span>
          </h3>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Our platform integrates with global standards and industry-leading infrastructures to ensure absolute reliability.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {partners.map((partner, index) => (
            <div key={index} className="group transition-all duration-300">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-8 md:h-10 opacity-30 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
