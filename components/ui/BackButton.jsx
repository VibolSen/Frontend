import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ href, label }) {
  return (
    <Link 
      href={href} 
      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-all mb-6 group"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors shadow-sm">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
      </div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}
