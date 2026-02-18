"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  BarChart3,
  User,
} from "lucide-react";

// -------------------------
// Single Nav Item Component
// -------------------------
const NavLink = ({ icon, label, href, isCollapsed, isActive }) => (
  <li>
    <Link
      href={href}
      className={`group flex items-center gap-3 my-1 p-3 rounded-xl transition-all duration-300 relative overflow-hidden
        ${
          isActive
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]"
            : "text-slate-500 hover:text-emerald-700 hover:bg-white"
        }
      `}
      title={isCollapsed ? label : ""}
    >
      <span
        className={`transition-all duration-300 relative z-10 ${
          isActive
            ? "text-white"
            : "group-hover:text-emerald-300"
        }`}
      >
        {React.cloneElement(icon, { size: 20 })}
      </span>

      <span
        className={`ml-1 font-medium transition-all duration-300 ease-in-out
          ${
            isCollapsed
              ? "opacity-0 absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-sm invisible group-hover:visible group-hover:opacity-100 z-50 shadow-md"
              : "opacity-100"
          }`}
      >
        {label}
      </span>
    </Link>
  </li>
);

// -------------------------
// Sidebar Item Definitions
// -------------------------
const FINANCE_NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <Home />,
    href: "/finance/dashboard",
  },
  {
    label: "Invoices",
    icon: <FileText />,
    href: "/finance/invoices",
  },
  {
    label: "Payments",
    icon: <CreditCard />,
    href: "/finance/payments",
  },
  {
    label: "Fees Management",
    icon: <Receipt />,
    href: "/finance/fees",
  },
  {
    label: "Expenses",
    icon: <Wallet />,
    href: "/finance/expenses",
  },
  {
    label: "Payroll",
    icon: <User />,
    href: "/finance/payroll",
  },
  {
    label: "Budgets",
    icon: <BarChart3 />,
    href: "/finance/budgets",
  },
  {
    label: "Financial Reports",
    icon: <TrendingUp />,
    href: "/finance/reports",
  },
];

// -------------------------
// Main Sidebar Component
// -------------------------
export default function FinanceSidebar({ initialOpen = true }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const pathname = usePathname();

  useEffect(() => {
    const savedState = localStorage.getItem("financeSidebarState");
    if (savedState !== null) setIsOpen(JSON.parse(savedState));
  }, []);

  useEffect(() => {
    localStorage.setItem("financeSidebarState", JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const isCollapsed = !isOpen;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`bg-[#EBF4F6] border-r border-slate-200 text-slate-800 flex flex-col fixed md:relative transition-all duration-500 ease-in-out z-40 h-full shadow-2xl
          ${isOpen ? "min-w-max" : "w-20"} overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center p-5 border-b border-slate-200 h-20 transition-all duration-300 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-3 animate-fadeIn">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                  Finance<span className="text-emerald-600">Portal</span>
                </h1>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Accounting Office</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-all border border-slate-200 hover:border-slate-300"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1.5">
            {FINANCE_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isCollapsed={isCollapsed}
                isActive={pathname === item.href}
              />
            ))}
          </ul>
        </nav>

        {/* Settings at Bottom */}
        <div className="px-3 py-4 border-t border-slate-200">
          <NavLink
            icon={<Settings />}
            label="Settings"
            href="/finance/settings"
            isCollapsed={isCollapsed}
            isActive={pathname === "/finance/settings"}
          />
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 animate-gradient-x" />
      </aside>
    </>
  );
}
