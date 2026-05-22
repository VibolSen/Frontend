import React from "react";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  LayoutDashboard, 
  Briefcase 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <LayoutDashboard className="w-10 h-10 text-indigo-600" />,
      title: "Intelligence Command Center",
      description:
        "High-density analytics dashboards providing real-time insights into institutional health, performance, and financial trends.",
    },
    {
      icon: <Wallet className="w-10 h-10 text-blue-600" />,
      title: "Bakong Financial Integration",
      description:
        "Automated, secure tuition fee processing using Cambodia's national KHQR standard for instant, verifiable transactions.",
    },
    {
      icon: <BookOpen className="w-10 h-10 text-indigo-600" />,
      title: "Integrated LMS Engine",
      description:
        "A unified digital classroom for course delivery, virtual gradebooks, timed examinations, and a centralized academic library.",
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-blue-600" />,
      title: "Degree & Merit Analytics",
      description:
        "Sophisticated tracking of student academic progression alongside behavioral merit standings and automated eligibility flags.",
    },
    {
      icon: <Users className="w-10 h-10 text-indigo-600" />,
      title: "Student Lifecycle Portal",
      description:
        "Full-cycle management from enrollment pipelines to live attendance tracking and blockchain-verified certificate issuance.",
    },
    {
      icon: <Briefcase className="w-10 h-10 text-blue-600" />,
      title: "Institutional ERP & HR",
      description:
        "Centralized staff management with strict RBAC, automated leave workflows, and integrated internal career boards.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600 mb-4">
            Institutional Ecosystem
          </h2>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight">
            Comprehensive <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">Enterprise Pillar</span> Architecture
          </h3>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            A unified governance platform engineered to streamline every dimension of the modern educational lifecycle through high-density data integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-5 p-3.5 bg-slate-50 rounded-xl w-fit group-hover:bg-indigo-50 transition-colors duration-300">
                <div className="w-8 h-8">
                  {/* Scaling the icon as well */}
                  {React.cloneElement(feature.icon, { className: "w-full h-full text-current" })}
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                {feature.title}
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
