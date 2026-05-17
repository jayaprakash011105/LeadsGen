import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { leadsAPI, filesAPI } from '../services/api';
import toast from 'react-hot-toast';

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', location: '', category: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 1000 });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
        sort_dir: sortDir,
      };
      const res = await leadsAPI.getAll(params);
      setLeads(res.data.leads || []);
      setTotalLeads(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, sortBy, sortDir]);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await filesAPI.getAll();
      setFiles(res.data.files || []);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  }, []);

  const deleteFile = useCallback(async (id) => {
    try {
      await filesAPI.delete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      fetchLeads(); // Refresh leads as they might have been deleted
      toast.success('File and associated leads deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  }, [fetchLeads]);

  const updateLeadStatus = useCallback(async (id, status) => {
    try {
      await leadsAPI.updateStatus(id, status);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }, []);

  const deleteLead = useCallback(async (id) => {
    try {
      await leadsAPI.delete(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setTotalLeads((t) => t - 1);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  }, []);

  const bulkDelete = useCallback(async (ids) => {
    try {
      await leadsAPI.bulkDelete(ids);
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
      setTotalLeads((t) => t - ids.length);
      toast.success(`${ids.length} leads deleted`);
    } catch {
      toast.error('Bulk delete failed');
    }
  }, []);

  return (
    <LeadsContext.Provider value={{
      leads, totalLeads, loading, files,
      filters, setFilters,
      pagination, setPagination,
      sortBy, setSortBy,
      sortDir, setSortDir,
      fetchLeads, fetchFiles,
      deleteFile,
      updateLeadStatus,
      deleteLead,
      bulkDelete,
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
};
