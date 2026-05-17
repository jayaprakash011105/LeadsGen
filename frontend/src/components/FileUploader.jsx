import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileJson, Loader2, CheckCircle2 } from 'lucide-react';
import { leadsAPI } from '../services/api';
import { useLeads } from '../context/LeadsContext';
import toast from 'react-hot-toast';

export default function FileUploader({ onUploadComplete }) {
  const { fetchFiles } = useLeads();
  const [status, setStatus] = useState('idle'); // idle | uploading
  const [progress, setProgress] = useState(0);
  const [draggedFile, setDraggedFile] = useState(null);
  const [lastMessage, setLastMessage] = useState('');

  // Auto-dismiss success message after 10 seconds
  useEffect(() => {
    if (lastMessage) {
      const timer = setTimeout(() => {
        setLastMessage('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage]);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file. Please upload a .json file.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setDraggedFile(file);
    setStatus('uploading');
    setProgress(0);
    setLastMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Fake progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 150);

      const res = await leadsAPI.upload(formData);
      clearInterval(progressInterval);
      setProgress(100);

      const { inserted, duplicates, total } = res.data;
      
      if (inserted > 0) {
        toast.success(`${inserted} new leads added!`);
        setLastMessage(`Success: Added ${inserted} new leads from ${file.name}.`);
      } else {
        toast.secondary(`Deduplicated: All ${total} leads already exist.`);
        setLastMessage(`Notice: ${total} leads processed, but they already exist in the database.`);
      }
      
      // Refresh global states
      onUploadComplete?.();
      fetchFiles();

      // Reset to idle after 2 seconds to show the import layout again
      setTimeout(() => {
        setStatus('idle');
        setDraggedFile(null);
        setProgress(0);
      }, 2000);
      
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed.';
      toast.error(msg);
      setStatus('idle');
    }
  }, [onUploadComplete, fetchFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    disabled: status === 'uploading',
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragActive
            ? 'border-[#3b82f6] bg-[#3b82f605]'
            : 'border-[#1e1e2e] hover:border-[#3b82f650] hover:bg-[#13131f]'
        } ${status === 'uploading' ? 'pointer-events-none' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        
        <div className="p-8 flex flex-col items-center justify-center text-center">
          {status === 'uploading' ? (
            <div className="w-full max-w-xs py-4">
              <Loader2 size={32} className="text-[#3b82f6] animate-spin mx-auto mb-4" />
              <div className="h-1.5 w-full bg-[#08080f] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#3b82f6]"
                />
              </div>
              <p className="text-[10px] text-[#475569] mt-3 font-bold uppercase tracking-widest">
                Uploading {draggedFile?.name}...
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#3b82f610] flex items-center justify-center mb-4">
                <Upload size={20} className="text-[#3b82f6]" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {isDragActive ? 'Drop files here' : 'Click or drag JSON to import'}
              </p>
              <p className="text-xs text-[#475569]">
                Supports Apify Google Maps Scraper format
              </p>
            </>
          )}
        </div>
      </div>

      {/* Message below the card */}
      <AnimatePresence>
        {lastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              lastMessage.includes('Success') 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <CheckCircle2 size={12} />
            <p className="text-[11px] font-medium">{lastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
