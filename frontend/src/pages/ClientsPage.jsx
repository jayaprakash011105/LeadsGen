import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle2, User, ExternalLink, 
  Search, FolderOpen, Layout, Zap, Send,
  MessageSquare, FileText, CreditCard, RefreshCw, 
  Package, Heart, Star, Settings, ChevronRight, ClipboardList,
  Circle, CheckCircle, Clock, Plus, Edit2, Trash2, Save,
  Upload, FileJson, AlertCircle, Phone
} from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import toast from 'react-hot-toast';

const COMMUNICATION_FLOW = [
  { 
    id: 'welcome', 
    label: 'Welcome Message', 
    icon: Heart, 
    template: (name) => `Hello ${name}! 👋 Thank you for choosing us for your project. We're excited to start this journey with you! Let's build something amazing together. 🚀`
  },
  { 
    id: 'requirements', 
    label: 'Requirements Request', 
    icon: ClipboardList, 
    template: (name) => `Thank you for confirming the project 😊\n\nTo begin the website development process, please shared your requirements here: https://forms.gle/AuxQR9Uv1Rm5frz99\n\nOnce filled, we will review and start the process! 🚀`
  },
  { 
    id: 'contract', 
    label: 'Contract / Agreement', 
    icon: FileText, 
    template: (name) => `Hello ${name}, I've prepared the project agreement for your review. Please check the details and let me know if everything looks correct. 📄`
  },
  { 
    id: 'invoice_advance', 
    label: 'Advance Invoice', 
    icon: CreditCard, 
    template: (name) => `Hi ${name}, as discussed, here is the advance invoice to officially kick off the project. Once the payment is confirmed, we'll begin the development immediately. 💳`
  },
  { 
    id: 'updates', 
    label: 'Project Updates', 
    icon: RefreshCw, 
    template: (name) => `Quick update for ${name}! 🛠️ We've made great progress on the initial phase of your website. Check out the latest updates here: [PREVIEW_LINK]`
  },
  { 
    id: 'invoice_final', 
    label: 'Final Invoice', 
    icon: CreditCard, 
    template: (name) => `Hi ${name}, your project is nearly complete! 🎊 Here is the final invoice for the remaining balance. Once settled, we will proceed with the final launch.`
  },
  { 
    id: 'delivery', 
    label: 'Delivery Message', 
    icon: Package, 
    template: (name) => `Great news ${name}! 🚀 Your project is now LIVE and fully delivered. Here are your access credentials and documentation: [DOCS_LINK]`
  },
  { 
    id: 'thank_you', 
    label: 'Thank You Message', 
    icon: Heart, 
    template: (name) => `Thank you so much ${name} for the opportunity to work on your project! It's been a pleasure. We're here if you need any further help. 🙏`
  },
  { 
    id: 'testimonial', 
    label: 'Testimonial Request', 
    icon: Star, 
    template: (name) => `Hi ${name}, if you're happy with our work, would you mind sharing a quick testimonial? It helps us a lot! You can leave it here: [REVIEW_LINK] ⭐`
  },
  { 
    id: 'maintenance', 
    label: 'Maintenance Offer', 
    icon: Settings, 
    template: (name) => `Hello ${name}, just checking in! 👋 To keep your website running smoothly and securely, we offer affordable maintenance plans. Would you like to hear more?`
  },
];

export default function ClientsPage() {
  const { leads, fetchLeads } = useLeads();
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('workflow'); 
  const [activeStepId, setActiveStepId] = useState(COMMUNICATION_FLOW[0].id);
  const [completedSteps, setCompletedSteps] = useState({});
  const [editableMessage, setEditableMessage] = useState('');
  
  // Requirements state
  const [requirements, setRequirements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [newReq, setNewReq] = useState({ field: '', value: '' });

  useEffect(() => {
    fetchLeads();
  }, []);

  // Update editable message when step or client changes
  useEffect(() => {
    if (selectedClient) {
      const step = COMMUNICATION_FLOW.find(s => s.id === activeStepId);
      setEditableMessage(step.template(selectedClient.business_name));
    }
  }, [activeStepId, selectedClient]);

  const convertedClients = leads.filter(l => l.status === 'Converted');

  const handleSendWhatsApp = () => {
    if (!selectedClient || !editableMessage) return;
    
    // Clean phone number properly
    const phoneNumber = (selectedClient.phone_number || '').replace(/\D/g, '');
    if (!phoneNumber) {
      toast.error('No valid phone number for this client');
      return;
    }
    
    // For India leads, ensure 91 prefix if missing and 10 digits
    let finalPhone = phoneNumber;
    if (finalPhone.length === 10) {
      finalPhone = '91' + finalPhone;
    }

    const encodedMessage = encodeURIComponent(editableMessage);
    const url = `https://wa.me/${finalPhone}?text=${encodedMessage}`;
    
    setCompletedSteps(prev => ({
      ...prev,
      [selectedClient.id]: {
        ...(prev[selectedClient.id] || {}),
        [activeStepId]: true
      }
    }));

    toast.success('Opening WhatsApp...');
    window.open(url, '_blank');
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const lines = text.split('\n');
        const newReqs = lines
          .map(line => {
            const [field, ...rest] = line.split(':');
            const value = rest.join(':').trim();
            if (field && value) return { id: Date.now() + Math.random(), field: field.trim(), value };
            return null;
          })
          .filter(Boolean);
        
        setRequirements(prev => [...prev, ...newReqs]);
        toast.success(`Successfully analysed ${newReqs.length} requirements!`);
      } catch (err) {
        toast.error("Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] animate-fade-in p-2">
      {/* Left Sidebar */}
      <div className="w-[300px] bg-[#0d0d12] border border-[#1e1e2e] rounded-[24px] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1e1e2e]">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase size={16} className="text-[#3b82f6]" /> Projects
          </h2>
          <p className="text-[10px] text-[#475569] font-black uppercase mt-1 italic">{convertedClients.length} Confirmed</p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {convertedClients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                selectedClient?.id === client.id ? 'bg-[#3b82f610] border-[#3b82f630]' : 'bg-[#08080f] border-[#1e1e2e] hover:border-[#3b82f620]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#13131f] flex items-center justify-center font-black text-sm text-[#475569]">
                {client.business_name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs truncate text-white">{client.business_name}</h4>
                <p className="text-[9px] text-[#475569] uppercase font-black">{client.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 bg-[#0d0d12] border border-[#1e1e2e] rounded-[24px] overflow-hidden flex flex-col shadow-2xl">
        {selectedClient ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-[#1e1e2e]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#3b82f6] flex items-center justify-center text-lg font-black text-white shadow-lg shadow-blue-500/20">
                    {selectedClient.business_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tighter">{selectedClient.business_name}</h2>
                    <p className="text-[9px] text-[#3b82f6] font-black uppercase tracking-widest">{selectedClient.category} • {selectedClient.phone_number}</p>
                  </div>
                </div>
                
                <div className="flex p-1 bg-[#08080b] border border-[#1e1e2e] rounded-xl">
                  <button onClick={() => setActiveTab('workflow')} className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'workflow' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-[#475569] hover:text-[#94a3b8]'}`}>Workflow</button>
                  <button onClick={() => setActiveTab('requirements')} className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'requirements' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-[#475569] hover:text-[#94a3b8]'}`}>Requirements</button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === 'workflow' ? (
                  <motion.div key="workflow" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex h-full">
                    {/* Vertical Checklist */}
                    <div className="w-[280px] border-r border-[#1e1e2e] flex flex-col bg-black/5">
                      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                        {COMMUNICATION_FLOW.map((step, idx) => (
                          <button
                            key={step.id}
                            onClick={() => setActiveStepId(step.id)}
                            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                              activeStepId === step.id ? 'bg-[#3b82f615] border-[#3b82f630] border' : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className={completedSteps[selectedClient.id]?.[step.id] ? 'text-[#22c55e]' : activeStepId === step.id ? 'text-[#3b82f6]' : 'text-[#2a2a3a]'}>
                              {completedSteps[selectedClient.id]?.[step.id] ? <CheckCircle size={16} /> : <Circle size={16} />}
                            </div>
                            <div className="text-left">
                              <p className={`text-[10px] font-black ${activeStepId === step.id ? 'text-white' : 'text-[#475569]'}`}>{step.label}</p>
                              <p className="text-[8px] text-[#2a2a3a] font-bold">Step {idx + 1}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step Preview & Editable Message */}
                    <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
                      <div className="max-w-2xl mx-auto flex flex-col gap-6">
                        <div className="bg-[#08080f] border border-[#1e1e2e] rounded-[32px] p-8 shadow-2xl">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-[#3b82f610] rounded-2xl text-[#3b82f6]">
                              {(() => {
                                const Icon = COMMUNICATION_FLOW.find(s => s.id === activeStepId)?.icon || Heart;
                                return <Icon size={24} />;
                              })()}
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-white">{COMMUNICATION_FLOW.find(s => s.id === activeStepId)?.label}</h3>
                              <p className="text-[9px] text-[#475569] font-black uppercase tracking-widest">Edit & Send Outreach</p>
                            </div>
                          </div>

                          <div className="relative mb-6 group">
                            <textarea
                              value={editableMessage}
                              onChange={(e) => setEditableMessage(e.target.value)}
                              className="w-full h-64 bg-[#0d0d12] border border-[#1e1e2e] rounded-2xl p-6 text-[13px] text-[#94a3b8] font-sans leading-relaxed outline-none focus:border-[#3b82f640] transition-all resize-none"
                            />
                            <div className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 size={12} />
                            </div>
                          </div>

                          <button 
                            onClick={handleSendWhatsApp}
                            className="w-full h-14 bg-[#25d366] text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                          >
                            <Send size={18} /> Send via WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="requirements" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex h-full p-8">
                    <div className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto overflow-y-auto no-scrollbar">
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) parseFile(e.dataTransfer.files[0]); }}
                        className={`w-full h-[200px] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center transition-all ${isDragging ? 'bg-[#3b82f610] border-[#3b82f6]' : 'bg-[#08080f] border-[#1e1e2e] hover:border-[#3b82f630]'}`}
                      >
                        <Upload size={32} className="text-[#3b82f6] mb-4" />
                        <h4 className="text-lg font-black text-white mb-1">Drag & Drop Google Form</h4>
                        <p className="text-[10px] text-[#475569] uppercase font-black tracking-widest mb-4">Text or CSV Analysis</p>
                        <input type="file" id="fileUpload" className="hidden" accept=".txt,.csv" onChange={(e) => e.target.files[0] && parseFile(e.target.files[0])} />
                        <label htmlFor="fileUpload" className="px-8 py-2.5 bg-[#1e1e2e] text-white rounded-xl text-[10px] font-black uppercase cursor-pointer">Select File</label>
                      </div>

                      <div className="bg-[#08080f] border border-[#1e1e2e] rounded-[32px] p-8">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3"><ClipboardList size={22} className="text-[#3b82f6]" /> Client Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {requirements.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-[#0d0d12] border border-[#1e1e2e] rounded-2xl">
                              <div className="min-w-0">
                                <span className="text-[8px] font-black text-[#3b82f6] uppercase tracking-widest mb-1 truncate block">{req.field}</span>
                                <p className="text-xs text-white font-medium truncate">{req.value}</p>
                              </div>
                              <button onClick={() => setRequirements(requirements.filter(r => r.id !== req.id))} className="p-2 text-[#475569] hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-20">
            <Layout size={64} className="text-[#1e1e2e] mb-6" />
            <h2 className="text-3xl font-black text-white uppercase tracking-widest">Select Project</h2>
          </div>
        )}
      </div>
    </div>
  );
}
