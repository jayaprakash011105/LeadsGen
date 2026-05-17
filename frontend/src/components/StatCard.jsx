import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color = 'cyan', index = 0 }) {
  const colorMap = {
    cyan: '#00d4ff',
    purple: '#7c3aed',
    yellow: '#f59e0b',
    white: '#f1f5f9',
    blue: '#3b82f6',
    green: '#10b981',
  };

  const iconColor = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: iconColor + '40', boxShadow: `0 10px 30px -10px ${iconColor}20` }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5 transition-colors duration-300 group relative overflow-hidden"
    >
      {/* Subtle background glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${iconColor} 0%, transparent 70%)` }}
      />
      
      <div className="shrink-0 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#08080f] border border-[#1e1e2e] group-hover:border-[#1e1e2e00] transition-all">
          <Icon size={22} style={{ color: iconColor }} />
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-1 group-hover:text-[#94a3b8] transition-colors">{title}</p>
        <p className="text-2xl font-bold text-white tracking-tight leading-none">{value ?? '0'}</p>
      </div>
    </motion.div>
  );
}
