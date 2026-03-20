// components/dashboard/AnalyticsChart.jsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useTheme } from "@/context/ThemeContext";

export default function AnalyticsChart({ data }) {
  const { theme } = useTheme();
  const isGlass = theme === "glass";

  // Dynamic colors based on theme
  const textColor = isGlass ? "rgba(255, 255, 255, 0.8)" : "#64748b";
  const gridColor = isGlass ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0";
  const tooltipBg = isGlass ? "rgba(255, 255, 255, 0.1)" : "#ffffff";
  const tooltipBorder = isGlass ? "rgba(255, 255, 255, 0.2)" : "none";
  const tooltipText = isGlass ? "#ffffff" : "#0f172a";
  const cursorFill = isGlass ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9";

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
            dy={5}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 11 }}
          />
          <Tooltip 
            cursor={{ fill: cursorFill }}
            contentStyle={{ 
              backgroundColor: tooltipBg,
              backdropFilter: isGlass ? 'blur(12px)' : 'none',
              borderRadius: '16px', 
              border: `1px solid ${tooltipBorder}`, 
              boxShadow: isGlass ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              padding: '10px 14px',
              color: tooltipText
            }}
            itemStyle={{ color: tooltipText }}
            labelStyle={{ color: tooltipText, fontWeight: 800, marginBottom: '4px' }}
          />
          <Bar 
            dataKey="count" 
            fill="url(#colorGradient)" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isGlass ? "#818cf8" : "#4f46e5"} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={isGlass ? "#6366f1" : "#3b82f6"} stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
