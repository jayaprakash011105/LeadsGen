import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-[#08080f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <motion.main
          className="p-12 min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131f',
            color: '#f1f5f9',
            border: '1px solid #1e1e2e',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
}
