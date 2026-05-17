import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Send, Clock, MessageSquare, CheckCircle2, TrendingUp,
  PlusCircle, ArrowRight, Zap, Target
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FileUploader from '../components/FileUploader';
import { useLeads } from '../context/LeadsContext';

export default function DashboardPage() {
  const { leads, totalLeads, fetchLeads } = useLeads();
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  // Compute stats
  const contacted = leads.filter((l) => l.status !== 'Not Contacted').length;
  const pending = totalLeads - contacted;
  const replied = leads.filter((l) => l.status === 'Replied' || l.status === 'Converted').length;
  const projectsDone = leads.filter((l) => l.status === 'Converted').length;
  const convRate = totalLeads ? Math.round((projectsDone / totalLeads) * 100) : 0;

  const STATS = [
    { title: 'Total Leads', value: totalLeads, icon: Users, color: 'blue' },
    { title: 'Contacted Leads', value: contacted, icon: Send, color: 'cyan' },
    { title: 'Pending Leads', value: pending, icon: Clock, color: 'yellow' },
    { title: 'Replied Leads', value: replied, icon: MessageSquare, color: 'white' },
    { title: 'Projects Done', value: projectsDone, icon: CheckCircle2, color: 'purple' },
    { title: 'Conversion Rate', value: `${convRate}%`, icon: TrendingUp, color: 'white' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto pt-2 animate-fade-in px-4">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-[#3b82f6] fill-[#3b82f6]" />
            <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.2em]">Overview Dashboard</span>
          </div>
          <h1 className="text-[40px] font-black text-white leading-none mb-3 tracking-tighter">Private Lead Center</h1>
          <p className="text-[13px] text-[#94a3b8] font-medium">Your business outreach pulse in real-time.</p>
        </div>
        <div className="pt-4 text-right">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-1">System Status</p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-xs font-bold text-[#10b981]">Operational</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - 3x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {STATS.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Leads Block */}
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-[24px] p-8 flex flex-col items-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full border border-[#00d4ff] flex items-center justify-center">
              <PlusCircle size={16} className="text-[#00d4ff]" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Import Leads</h2>
          </div>
          <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-6 max-w-xs">
            Drop your <span className="text-white font-bold">Apify Google Maps Scraper</span> JSON here. 
            Normalization and deduplication are handled instantly.
          </p>
          
          <div className="w-full">
            <FileUploader onUploadComplete={() => fetchLeads()} />
          </div>
        </div>

        {/* Smart Tips Block */}
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-[24px] p-8">
          <h2 className="text-xl font-bold text-white tracking-tight mb-8">Smart Tips</h2>
          
          <div className="space-y-10">
            {/* Tip 1 */}
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-xl bg-[#00d4ff10] border border-[#00d4ff20] flex items-center justify-center shrink-0">
                <ArrowRight size={18} className="text-[#00d4ff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Target Niche Markets</h3>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">
                  Leads from <span className="text-white">'Lawyers'</span> and <span className="text-white">'Real Estate'</span> tend to have 25% higher conversion rates this month.
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-xl bg-[#10b98110] border border-[#10b98120] flex items-center justify-center shrink-0">
                <Zap size={18} className="text-[#10b981]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Optimize Outreach Timing</h3>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">
                  Businesses are 40% more likely to reply to WhatsApp messages sent between 10 AM and 2 PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
