
import { Send } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to Transform Your School?
          </h2>
          <p className="text-lg text-indigo-100 leading-relaxed mb-10 font-light">
            Discover how STEP Academy can streamline your operations and enhance your institution's efficiency with our all-in-one management platform.
          </p>
          <button className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all duration-500 hover:scale-[1.05] active:scale-[0.98] inline-flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <Send className="w-5 h-5" />
            Request a Demo
          </button>
        </div>
      </div>
    </section>
  );
}
