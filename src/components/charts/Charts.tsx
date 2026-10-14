import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { MonthlyStats } from '../../types';
import { CHART_COLORS } from '../../lib/theme';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title, subtitle, children, className = '', actions, action,
}) => {
  const effectiveActions = actions || action;
  return (
    <div className={`bento-card ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="section-title">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {effectiveActions}
      </div>
      {children}
    </div>
  );
};

interface ConsumptionChartProps {
  data: MonthlyStats[];
  height?: number;
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
      <XAxis
        dataKey="month"
        tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }}
        axisLine={false}
        tickLine={false}
        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
      />
      <Tooltip
        formatter={(v: number) => [`${v.toLocaleString('en-IN')} kWh`, 'Consumption']}
        contentStyle={{ borderRadius: '8px', border: `1px solid ${CHART_COLORS.tooltipBorder}` }}
      />
      <Area
        type="monotone"
        dataKey="consumption"
        stroke={CHART_COLORS.primary}
        strokeWidth={2}
        fill="url(#consumptionGrad)"
        dot={false}
        activeDot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 0 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

interface RevenueChartProps {
  data: MonthlyStats[];
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
      <defs>
        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1} />
          <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
      <XAxis
        dataKey="month"
        tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }}
        axisLine={false}
        tickLine={false}
        tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`}
      />
      <Tooltip
        formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
        contentStyle={{ borderRadius: '8px', border: `1px solid ${CHART_COLORS.tooltipBorder}` }}
      />
      <Area
        type="monotone"
        dataKey="revenue"
        stroke={CHART_COLORS.secondary}
        strokeWidth={2}
        fill="url(#revenueGrad)"
        dot={false}
        activeDot={{ r: 4, fill: CHART_COLORS.secondary, strokeWidth: 0 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);
