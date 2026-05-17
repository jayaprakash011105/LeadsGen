import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { useLeads } from '../context/LeadsContext';

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 border border-border text-xs">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { leads, totalLeads } = useLeads();
  const [range, setRange] = useState('7d');

  // Date Range Logic
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  const filteredLeads = leads.filter(lead => {
    const dateStr = lead.last_contacted || lead.created_at;
    if (!dateStr) return true; // Include leads without dates
    return new Date(dateStr) >= cutoffDate;
  });
  
  const totalLeadsCount = filteredLeads.length;

  // Status Distribution
  const statusCounts = ['Not Contacted', 'Sent', 'Replied', 'Converted', 'Rejected'].map((s) => ({
    name: s,
    value: filteredLeads.filter((l) => (l.status || 'Not Contacted') === s).length,
  }));

  // Category Breakdown
  const catMap = {};
  filteredLeads.forEach((l) => {
    const cat = l.category || 'Unknown';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const categoryData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ 
      name: name.length > 15 ? name.slice(0, 15) + '...' : name, 
      value 
    }));

  // Real-time Daily Outreach Data
  const dailyDataMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    dailyDataMap[dateStr] = { date: dateStr, sent: 0, replied: 0, converted: 0 };
  }

  filteredLeads.forEach(lead => {
    const dateStringToUse = lead.last_contacted || lead.created_at;
    if (!dateStringToUse) return;
    
    const d = new Date(dateStringToUse);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    
    if (dailyDataMap[dateStr]) {
       if (lead.status === 'Sent') dailyDataMap[dateStr].sent += 1;
       if (lead.status === 'Replied') dailyDataMap[dateStr].replied += 1;
       if (lead.status === 'Converted') dailyDataMap[dateStr].converted += 1;
    }
  });

  const dailyData = Object.values(dailyDataMap);

  // KPIs
  const convRate = totalLeadsCount ? Math.round((filteredLeads.filter((l) => l.status === 'Converted').length / totalLeadsCount) * 100) : 0;
  const sentCount = filteredLeads.filter((l) => l.status && l.status !== 'Not Contacted' && l.status !== 'Rejected').length;
  const repliedCount = filteredLeads.filter((l) => l.status === 'Replied' || l.status === 'Converted').length;
  const replyRate = sentCount ? Math.round((repliedCount / sentCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={20} className="text-accent-cyan" />
            Analytics
          </h2>
          <p className="text-xs text-text-muted mt-1">Outreach performance & conversion insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r
                  ? 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
                  : 'btn-ghost'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: totalLeadsCount, color: '#00d4ff' },
          { label: 'Contacted', value: sentCount, color: '#7c3aed' },
          { label: 'Reply Rate', value: `${replyRate}%`, color: '#10b981' },
          { label: 'Conversion Rate', value: `${convRate}%`, color: '#f59e0b' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
            style={{ border: `1px solid ${kpi.color}30` }}
          >
            <p className="text-3xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs text-text-muted mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Outreach Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-accent-cyan" />
            Daily Outreach (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="sent" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 3 }} name="Sent" />
              <Line type="monotone" dataKey="replied" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} name="Replied" />
              <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Converted" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
            <PieIcon size={15} className="text-purple-400" />
            Lead Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusCounts.filter((s) => s.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
          <BarChart3 size={15} className="text-accent-cyan" />
          Leads by Business Category
        </h3>
        {categoryData.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-sm">
            No category data available. Upload leads to see breakdown.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Leads" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
