"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  User,
  ShieldCheck,
  Hash,
  X,
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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const EXCHANGE_RATE = 4100;

  // Determine base path: /finance or /admin/finance
  const basePath = pathname?.startsWith("/finance") ? "/finance" : "/admin/finance";

  const normalizeToUSD = (amount, curr) => {
    if (!amount) return 0;
    if (curr === "KHR") return amount / EXCHANGE_RATE;
    return amount;
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Fetch financial summary data
        const [invoices, payments, fees, expenses, payrolls, budgets] = await Promise.all([
          apiClient.get("/financial/invoices"),
          apiClient.get("/financial/payments"),
          apiClient.get("/financial/fees"),
          apiClient.get("/financial/expenses"),
          apiClient.get("/financial/payrolls").catch(() => []),
          apiClient.get("/financial/budgets").catch(() => []),
        ]);

        // Calculate totals (Normalized to USD)
        const totalRevenue = payments?.reduce((sum, p) => sum + normalizeToUSD(p.amount, p.currency), 0) || 0;
        const totalExpenses = expenses?.reduce((sum, e) => sum + normalizeToUSD(e.amount, e.currency), 0) || 0;
        const totalPayroll = payrolls?.reduce((sum, p) => sum + (p.netSalary || 0), 0) || 0; // Assuming payroll is USD for now
        const pendingInvoices = invoices?.filter(i => i.status === "PENDING")?.length || 0;

        // Simple forecasting: pending revenue - payrolls - other expenses
        const upcomingRevenue = invoices?.filter(i => i.status === "SENT")?.reduce((sum, i) => sum + normalizeToUSD(i.totalAmount, i.currency), 0) || 0;
        const upcomingPayroll = payrolls?.filter(p => p.status === "PENDING")?.reduce((sum, p) => sum + (p.netSalary || 0), 0) || 0;

        setDashboardData({
          totalRevenue,
          totalExpenses: totalExpenses + totalPayroll,
          netIncome: totalRevenue - (totalExpenses + totalPayroll),
          pendingInvoices,
          totalInvoices: invoices?.length || 0,
          totalPayments: payments?.length || 0,
          totalPayroll,
          activeBudgets: budgets?.filter(b => b.status === "ACTIVE")?.length || 0,
          upcomingRevenue,
          upcomingPayroll,
          invoices: invoices || [],
          payments: payments || [],
          expenses: expenses || [],
          payrolls: payrolls || [],
          budgets: budgets || [],
        });
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
        setDashboardData({
          totalRevenue: 0, totalExpenses: 0, netIncome: 0, pendingInvoices: 0,
          totalInvoices: 0, totalPayments: 0, totalPayroll: 0, activeBudgets: 0,
          upcomingRevenue: 0, upcomingPayroll: 0,
          invoices: [], payments: [], expenses: [], payrolls: [], budgets: [],
        });
      }
    };
// ... (rest of useEffect)

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
    const isKHR = currency === "KHR";
    const value = isKHR ? (amount || 0) * EXCHANGE_RATE : (amount || 0);
    
    return new Intl.NumberFormat(isKHR ? "km-KH" : "en-US", {
      style: "currency",
      currency: isKHR ? "KHR" : "USD",
      minimumFractionDigits: isKHR ? 0 : 2,
    }).format(value);
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

  // Calculate Dynamic Monthly Trends (Last 6 Months)
  const calculateMonthlyTrends = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        revenue: 0,
        expenses: 0
      });
    }

    // Allocate Payments (Revenue)
    dashboardData?.payments?.forEach(p => {
      const date = new Date(p.createdAt);
      const match = months.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
      if (match) match.revenue += normalizeToUSD(p.amount, p.currency);
    });

    // Allocate Expenses
    dashboardData?.expenses?.forEach(e => {
      const date = new Date(e.createdAt);
      const match = months.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
      if (match) match.expenses += normalizeToUSD(e.amount, e.currency);
    });

    // Allocate Payroll (as expense)
    dashboardData?.payrolls?.forEach(p => {
      if (p.status === "PAID") {
        const date = new Date(p.paymentDate || p.createdAt);
        const match = months.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
        if (match) match.expenses += (p.netSalary || 0);
      }
    });

    return months;
  };

  // Calculate Invoice Status Distribution
  const calculateInvoiceStatusDist = () => {
    const stats = {
      PAID: 0,
      SENT: 0,
      OVERDUE: 0,
      DRAFT: 0
    };
    
    dashboardData?.invoices?.forEach(inv => {
      if (stats[inv.status] !== undefined) stats[inv.status]++;
    });

    return [
      { name: 'Paid', value: stats.PAID, color: '#10b981' },
      { name: 'Issued', value: stats.SENT, color: '#3b82f6' },
      { name: 'Overdue', value: stats.OVERDUE, color: '#ef4444' },
      { name: 'Draft', value: stats.DRAFT, color: '#94a3b8' }
    ].filter(item => item.value > 0);
  };

  const monthlyData = calculateMonthlyTrends();
  const statusDistData = calculateInvoiceStatusDist();
  
  const revenueVsExpenses = [
    { name: "Revenue", value: dashboardData?.totalRevenue || 0 },
    { name: "Expenses", value: dashboardData?.totalExpenses || 0 },
  ];

  // Generate Dynamic AI Insight
  const getAIInsight = () => {
    const revenue = dashboardData?.totalRevenue || 0;
    const expenses = dashboardData?.totalExpenses || 0;
    const upcoming = dashboardData?.upcomingRevenue || 0;
    const ratio = revenue > 0 ? (expenses / revenue) * 100 : 0;
    const overdueCount = dashboardData?.invoices?.filter(i => i.status === "OVERDUE").length || 0;

    if (expenses > revenue) {
      return `Critical Alert: Expenses are currently exceeding revenue by ${formatCurrency(expenses - revenue)}. We recommend immediate review of upcoming ${formatCurrency(upcoming)} in pending invoices and potentially deferring non-essential budgets.`;
    }
    
    if (overdueCount > 5) {
      return `Liquidity Warning: You have ${overdueCount} overdue invoices. While your net income is positive (${formatCurrency(revenue - expenses)}), aggressive collection or automated reminders are advised to maintain healthy operational cash flow.`;
    }

    if (ratio > 80) {
      return "Efficiency Note: Your expense-to-revenue ratio is high at " + ratio.toFixed(1) + "%. Consider auditing recurring overheads or vendor contracts to widen your net profit margin.";
    }

    return `Positive Outlook: Based on current patterns, your school is maintaining a strong liquidity position. With ${formatCurrency(upcoming)} projected to arrive from pending billings, the fiscal year remains stable and growth-oriented.`;
  };

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
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {getGreeting()}, <span className="text-emerald-600">{welcomeName}</span>!
            </h1>
            <p className="text-slate-500 font-bold text-xs tracking-tight">
              Financial intelligence hub: real-time revenue tracking and multi-currency fiscal oversight.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  currency === "USD" ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency("KHR")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  currency === "KHR" ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                KHR
              </button>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                Financial Core Active
              </span>
            </div>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: "Consolidated Revenue",
              val: formatCurrency(dashboardData?.totalRevenue),
              icon: TrendingUp,
              color: "emerald",
              href: `${basePath}/payments`,
            },
            {
              title: "Operating Expenses",
              val: formatCurrency(dashboardData?.totalExpenses),
              icon: TrendingDown,
              color: "rose",
              href: `${basePath}/expenses`,
            },
            {
              title: "Net Treasury",
              val: formatCurrency(dashboardData?.netIncome),
              icon: DollarSign,
              color: "blue",
              href: `${basePath}/dashboard`,
            },
            {
              title: "Payroll Ledger",
              val: formatCurrency(dashboardData?.totalPayroll),
              icon: User,
              color: "indigo",
              href: `${basePath}/payroll`,
            },
            {
              title: "Provisioned Budgets",
              val: dashboardData?.activeBudgets || 0,
              icon: PieChartIcon,
              color: "violet",
              href: `${basePath}/budgets`,
            },
            {
              title: "Uncollected Balances",
              val: dashboardData?.pendingInvoices || 0,
              icon: FileText,
              color: "amber",
              href: `${basePath}/invoices`,
            },
          ].map((stat) => (
            <motion.div variants={itemVariants} key={stat.title} whileHover={{ y: -3 }}>
              <Link
                href={stat.href}
                prefetch={false}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">
                    {stat.title}
                  </p>
                  <p className="text-sm font-black text-slate-900 leading-none truncate tracking-tight">
                    {stat.val}
                  </p>
                </div>
                <div
                  className={`h-10 w-10 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110`}
                >
                  <stat.icon size={18} />
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* AI-Powered Cash Flow Forecasting */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 uppercase tracking-widest">
              <Activity size={12} className="animate-pulse" />
              Empowered by Data
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Predictive Cash Flow Registry</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic opacity-70">Algorithmic analysis of pending receivables vs. anticipated operational outflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Liquid Assets</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{formatCurrency(dashboardData?.totalRevenue - (dashboardData?.totalExpenses))}</p>
            </div>
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic">Expected Inflow</p>
              <p className="text-2xl font-black text-emerald-700 tracking-tighter tabular-nums">+{formatCurrency(dashboardData?.upcomingRevenue)}</p>
            </div>
            <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 italic">Projected Outflow</p>
              <p className="text-2xl font-black text-rose-700 tracking-tighter tabular-nums">-{formatCurrency(dashboardData?.upcomingPayroll)}</p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Current Balance', amount: dashboardData?.totalRevenue - (dashboardData?.totalExpenses) },
                { name: '30-Day Outlook', amount: (dashboardData?.totalRevenue - (dashboardData?.totalExpenses)) + dashboardData?.upcomingRevenue - dashboardData?.upcomingPayroll }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fontWeight={800} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight={800} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
            <div className="p-3 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-100 shrink-0">
              <Activity size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-teal-900 uppercase tracking-widest italic leading-none mb-1">Institutional Intelligence</p>
              <p className="text-xs text-teal-800 font-bold leading-relaxed tracking-tight">
                {getAIInsight()}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses Pie Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col"
          >
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] italic">
                Revenue Mix
              </h3>
              <PieChartIcon size={16} className="text-slate-300" />
            </div>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueVsExpenses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={55}
                    paddingAngle={8}
                  >
                    {revenueVsExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      fontWeight: 'bold'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-tight">Total Volume</p>
                <p className="text-sm font-black text-slate-800 tracking-tighter">{formatCurrency(revenueVsExpenses.reduce((a,b) => a + b.value, 0))}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
               {revenueVsExpenses.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[10px] font-black text-slate-600 uppercase italic whitespace-nowrap">{entry.name}</span>
                  </div>
               ))}
            </div>
          </motion.div>

          {/* Monthly Trends Line Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-8 bg-blue-600 rounded-full" />
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] italic">
                   Fiscal Trend Analysis
                 </h3>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase">Revenue</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase">Expense</span>
                 </div>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    fontWeight={800}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    fontWeight={800}
                    tick={{ fill: "#94a3b8" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={4}
                    dot={{ fill: "#10b981", r: 6, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={4}
                    dot={{ fill: "#ef4444", r: 6, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* Detailed Insights: Status & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Payment Status Lifecycle */}
           <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"
           >
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] italic">Collection Lifecycle</h3>
                 <ShieldCheck size={16} className="text-slate-300" />
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={45}
                    >
                      {statusDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                       contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                 {statusDistData.map((item, i) => (
                    <div key={i} className="flex flex-col items-center p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                       <span className="text-[11px] font-black text-slate-800 tabular-nums">{item.value}</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.name}</span>
                    </div>
                 ))}
              </div>
           </motion.div>

           {/* Quick Actions */}
           <motion.section
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all duration-700" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-lg font-black text-white tracking-tight">
                Fiscal Command Center
              </h3>
              <ShieldCheck size={20} className="text-blue-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
              {[
                { label: "Invoices", icon: FileText, href: `${basePath}/invoices`, color: "blue" },
                { label: "Payments", icon: CreditCard, href: `${basePath}/payments`, color: "emerald" },
                { label: "Fees", icon: Wallet, href: `${basePath}/fees`, color: "indigo" },
                { label: "Expenses", icon: Receipt, href: `${basePath}/expenses`, color: "rose" },
                { label: "Payroll", icon: User, href: `${basePath}/payroll`, color: "blue" },
                { label: "Budgets", icon: BarChart3, href: `${basePath}/budgets`, color: "violet" },
              ].map((action) => (
                <Link
                  href={action.href}
                  prefetch={false}
                  key={action.label}
                  className="group/btn flex flex-col items-center gap-2.5 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                >
                  <div className={`p-3 bg-${action.color}-500/10 text-${action.color}-400 rounded-xl group-hover/btn:scale-110 transition-transform`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 text-center tracking-widest uppercase italic">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Dual Registry Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Recent Payments (Revenue) */}
           <motion.section
            variants={itemVariants}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic">Revenue Feed</h3>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Latest Cash Inflows</p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                 <TrendingUp size={16} />
              </div>
            </div>
            <div className="space-y-3">
              {dashboardData?.payments?.slice(0, 5).map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white border border-slate-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm font-black text-[10px] italic">
                      +
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 tracking-tighter leading-none uppercase italic mb-0.5 truncate max-w-[150px]">
                        {payment.senderName || `TRX-${payment.id?.slice(0, 6).toUpperCase()}`}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {new Date(payment.createdAt).toLocaleDateString()} • {payment.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] font-black text-emerald-600 tabular-nums tracking-tighter">
                      {formatCurrency(normalizeToUSD(payment.amount, payment.currency))}
                    </p>
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="p-1.5 bg-white text-slate-300 hover:text-emerald-500 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {(!dashboardData?.payments || dashboardData.payments.length === 0) && (
                <div className="text-center py-10 opacity-30 italic text-slate-400 text-xs">Waiting for incoming revenue...</div>
              )}
            </div>
          </motion.section>

          {/* Recent Expenses (Expenditure) */}
          <motion.section
            variants={itemVariants}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
               <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic">Expenditure Feed</h3>
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Recent Outbound Activity</p>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                 <TrendingDown size={16} />
              </div>
            </div>
            <div className="space-y-3">
              {dashboardData?.expenses?.slice(0, 5).map((expense, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white border border-slate-100 text-rose-600 rounded-xl flex items-center justify-center shadow-sm font-black text-[10px] italic">
                      -
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 tracking-tight leading-none uppercase italic truncate max-w-[120px]">
                        {expense.category || "General"}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">
                        {new Date(expense.createdAt).toLocaleDateString()} • {expense.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-black text-rose-600 tabular-nums">
                      {formatCurrency(normalizeToUSD(expense.amount, expense.currency))}
                    </p>
                    <div className="p-1.5 opacity-0 text-slate-300">
                       <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
               {(!dashboardData?.expenses || dashboardData.expenses.length === 0) && (
                <div className="text-center py-10 opacity-30 italic text-slate-400 text-xs">No recent expenditures recorded.</div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {selectedPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPayment(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm px-4"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black tracking-tighter italic uppercase">Fiscal Audit</h2>
                    <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Verified Transactional Node</p>
                  </div>
                  <button onClick={() => setSelectedPayment(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Verified Sum</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{formatCurrency(normalizeToUSD(selectedPayment.amount, selectedPayment.currency))}</p>
                    </div>
                    <div className="h-14 w-14 bg-white border border-slate-100 text-emerald-500 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:rotate-12">
                      <ShieldCheck size={28} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Originator</p>
                      <p className="text-sm font-black text-slate-800 leading-none italic uppercase">{selectedPayment.senderName || "Institutional Dep."}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-2 bg-slate-50 px-2 py-0.5 rounded-md inline-block">{selectedPayment.senderAccount || "AC-990231"}</p>
                    </div>
                    <div className="space-y-1.5 text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Maturity</p>
                      <p className="text-sm font-black text-slate-800 uppercase leading-none italic">Verified Settlement</p>
                      <p className="text-[10px] text-emerald-600 font-black mt-2 uppercase italic tracking-widest">Received</p>
                    </div>
                  </div>

                  <div className="py-6 border-y border-slate-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash size={12} className="text-blue-400" /> Audit Reference</span>
                      <span className="font-mono font-bold text-[10px] text-slate-700 bg-slate-50 px-3 py-1 rounded-xl truncate max-w-[180px]">{selectedPayment.transactionId || "TRX-NODE-00821"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-indigo-400" /> Settlement Time</span>
                      <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tight">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={12} className="text-emerald-400" /> Original Record</span>
                      <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tight">
                        {selectedPayment.currency || "USD"} {selectedPayment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={12} className="text-blue-400" /> Network / Tool</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase italic tracking-widest">{selectedPayment.paymentMethod}</span>
                    </div>
                  </div>

                  {selectedPayment.notes && (
                    <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-50 text-[10px] text-slate-500 font-bold italic leading-relaxed">
                      &quot;{selectedPayment.notes}&quot;
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    Close Audit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
