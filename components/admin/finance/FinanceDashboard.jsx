"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { usePathname } from "next/navigation";
import {
  DollarSign,
  FileText,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Wallet,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  ChevronRight,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinanceDashboard() {
  const pathname = usePathname();
  const [dashboardData, setDashboardData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine base path: /finance or /admin/finance
  const basePath = pathname?.startsWith("/finance") ? "/finance" : "/admin/finance";

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Fetch financial summary data
        const [invoices, payments, fees, expenses] = await Promise.all([
          apiClient.get("/financial/invoices"),
          apiClient.get("/financial/payments"),
          apiClient.get("/financial/fees"),
          apiClient.get("/financial/expenses"),
        ]);

        // Calculate totals
        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const pendingInvoices = invoices?.filter(i => i.status === "PENDING")?.length || 0;
        const totalInvoices = invoices?.length || 0;

        setDashboardData({
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses,
          pendingInvoices,
          totalInvoices,
          totalPayments: payments?.length || 0,
          invoices: invoices || [],
          payments: payments || [],
          expenses: expenses || [],
        });
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
        // Set default data on error
        setDashboardData({
          totalRevenue: 0,
          totalExpenses: 0,
          netIncome: 0,
          pendingInvoices: 0,
          totalInvoices: 0,
          totalPayments: 0,
          invoices: [],
          payments: [],
          expenses: [],
        });
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userId = storedUser ? JSON.parse(storedUser).id : null;
        const data = await apiClient.get(`/auth/me${userId ? `?userId=${userId}` : ""}`);
        if (data && data.user) setCurrentUser(data.user);
      } catch (error) {
        console.error(error);
      }
    };

    Promise.all([fetchFinancialData(), fetchCurrentUser()]).finally(() =>
      setLoading(false)
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-bold tracking-tight animate-pulse">
            Loading Financial Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const welcomeName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Finance Manager";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  // Prepare chart data
  const revenueVsExpenses = [
    { name: "Revenue", value: dashboardData?.totalRevenue || 0 },
    { name: "Expenses", value: dashboardData?.totalExpenses || 0 },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 33000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 40000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/20 pb-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-3 md:p-6 space-y-6"
      >
        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight">
              {getGreeting()}, <span className="text-teal-600">{welcomeName}</span>!
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Financial overview, revenue tracking, and expense management.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Financial Systems Active
            </span>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: "Total Revenue",
              val: formatCurrency(dashboardData?.totalRevenue),
              icon: TrendingUp,
              color: "emerald",
              href: `${basePath}/payments`,
            },
            {
              title: "Total Expenses",
              val: formatCurrency(dashboardData?.totalExpenses),
              icon: TrendingDown,
              color: "rose",
              href: `${basePath}/expenses`,
            },
            {
              title: "Net Income",
              val: formatCurrency(dashboardData?.netIncome),
              icon: DollarSign,
              color: "blue",
              href: `${basePath}/dashboard`,
            },
            {
              title: "Pending Invoices",
              val: dashboardData?.pendingInvoices || 0,
              icon: FileText,
              color: "amber",
              href: `${basePath}/invoices`,
            },
          ].map((stat) => (
            <motion.div variants={itemVariants} key={stat.title} whileHover={{ y: -3 }}>
              <Link
                href={stat.href}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-100 hover:shadow-md transition-all"
              >
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    {stat.title}
                  </p>
                  <p className="text-xl font-black text-slate-900 leading-none">
                    {stat.val}
                  </p>
                </div>
                <div
                  className={`h-10 w-10 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}
                >
                  <stat.icon size={20} />
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Quick Actions */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              Financial Operations
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Quick Access
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              {
                label: "Invoices",
                icon: FileText,
                href: `${basePath}/invoices`,
                bg: "bg-blue-50",
                text: "text-blue-600",
              },
              {
                label: "Payments",
                icon: CreditCard,
                href: `${basePath}/payments`,
                bg: "bg-emerald-50",
                text: "text-emerald-600",
              },
              {
                label: "Fees",
                icon: Wallet,
                href: `${basePath}/fees`,
                bg: "bg-indigo-50",
                text: "text-indigo-600",
              },
              {
                label: "Expenses",
                icon: Receipt,
                href: `${basePath}/expenses`,
                bg: "bg-rose-50",
                text: "text-rose-600",
              },
              {
                label: "Reports",
                icon: BarChart3,
                href: `${basePath}/dashboard`,
                bg: "bg-violet-50",
                text: "text-violet-600",
              },
              {
                label: "Analytics",
                icon: PieChartIcon,
                href: `${basePath}/dashboard`,
                bg: "bg-amber-50",
                text: "text-amber-600",
              },
            ].map((action) => (
              <Link
                href={action.href}
                key={action.label}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-50 hover:border-emerald-100 hover:bg-slate-50/50 transition-all active:scale-95"
              >
                <div
                  className={`p-3.5 ${action.bg} ${action.text} rounded-xl group-hover:bg-white transition-all shadow-sm`}
                >
                  <action.icon size={20} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center tracking-tight leading-none px-1">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses Pie Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">
              Revenue vs Expenses
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueVsExpenses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={45}
                    paddingAngle={5}
                  >
                    {revenueVsExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Trends Line Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Monthly Financial Trends
              </h3>
              <p className="text-[10px] font-bold text-slate-400">Last 6 Months</p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    fontWeight={700}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    fontWeight={700}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* Recent Activity */}
        <motion.section
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Recent Transactions
            </h3>
            <Activity size={16} className="text-slate-300" />
          </div>
          <div className="space-y-3">
            {dashboardData?.payments?.slice(0, 5).map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Payment #{payment.id?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black text-emerald-600">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            ))}
            {(!dashboardData?.payments || dashboardData.payments.length === 0) && (
              <p className="text-center text-slate-400 text-sm py-8">
                No recent transactions
              </p>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
