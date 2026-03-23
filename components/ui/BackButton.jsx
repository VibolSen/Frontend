import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ href, label, className = "", onClick, type = "button" }) {
  const content = (
      <>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100/50 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-sm border border-slate-200/50 group-hover:border-indigo-200">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="mt-0.5 tracking-[0.2em]">{label}</span>
      </>
  );

  const combinedClasses = `inline-flex items-center gap-2.5 px-3 py-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 bg-white/60 hover:bg-white backdrop-blur-md border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all duration-300 ease-out shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.15)] active:scale-[0.98] group ${className}`;

  if (onClick) {
      return (
          <button type={type} onClick={onClick} className={combinedClasses}>
              {content}
          </button>
      );
  }

  return (
    <Link 
      href={href || "#"} 
      className={combinedClasses}
    >
      {content}
    </Link>
  );
}
