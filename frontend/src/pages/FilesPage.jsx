import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileJson, Trash2, Calendar, Hash, RefreshCw, Upload } from 'lucide-react';
import { filesAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import FileUploader from '../components/FileUploader';
import toast from 'react-hot-toast';

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await filesAPI.getAll();
      setFiles(res.data.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const handleDelete = async (file) => {
    if (!confirm(`Delete file "${file.filename}" and all ${file.lead_count} associated leads?`)) return;
    setDeleting(file.id);
    try {
      await filesAPI.delete(file.id);
      setFiles((f) => f.filter((x) => x.id !== file.id));
      toast.success(`File "${file.filename}" and its leads deleted.`);
    } catch {
      toast.error('Failed to delete file.');
    } finally {
      setDeleting(null);
    }
  };

  const totalLeads = files.reduce((s, f) => s + (f.lead_count || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FileJson size={20} className="text-accent-cyan" />
            Uploaded Files
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} · {totalLeads} total leads imported
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadFiles} className="btn-ghost flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowUploader((s) => !s)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={14} />
            Upload New File
          </button>
        </div>
      </div>

      {/* Uploader */}
      {showUploader && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Import Leads from Apify JSON</h3>
            <button onClick={() => setShowUploader(false)} className="btn-ghost text-xs py-1.5 px-3">Close</button>
          </div>
          <FileUploader onUploadComplete={() => { loadFiles(); setShowUploader(false); }} />
        </motion.div>
      )}

      {/* File List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
              <FileJson size={28} className="text-text-muted" />
            </div>
            <h3 className="text-text-secondary font-medium mb-2">No files uploaded yet</h3>
            <p className="text-sm text-text-muted mb-5">Upload your Apify JSON export to start importing leads.</p>
            <button onClick={() => setShowUploader(true)} className="btn-primary">
              Upload First File
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <div className="col-span-5">Filename</div>
              <div className="col-span-2">Leads</div>
              <div className="col-span-3">Uploaded</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {files.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 px-5 py-4 items-center hover:bg-bg-elevated/30 transition-colors"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <FileJson size={16} className="text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{file.filename}</p>
                    <p className="text-xs text-text-muted">ID: {file.id?.slice(-8)}</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} className="text-accent-purple" style={{ color: '#a78bfa' }} />
                    <span className="text-sm font-semibold text-text-primary">{file.lead_count}</span>
                    <span className="text-xs text-text-muted">leads</span>
                  </div>
                </div>

                <div className="col-span-3 flex items-center gap-1.5 text-xs text-text-muted">
                  <Calendar size={12} />
                  {formatDate(file.upload_date)}
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deleting === file.id}
                    className="btn-danger flex items-center gap-1.5 text-xs py-1.5 px-3 disabled:opacity-50"
                  >
                    {deleting === file.id
                      ? <RefreshCw size={12} className="animate-spin" />
                      : <Trash2 size={12} />
                    }
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
