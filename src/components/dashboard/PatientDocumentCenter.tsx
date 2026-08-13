import React, { useState } from 'react';
import { PatientPortalDocument } from '../../types/patientPortal';
import { DEFAULT_PATIENT_DOCUMENTS, uploadPatientPortalDocument } from '../../services/patientPortalService';
import { FileText, Download, Upload, Eye, FileSpreadsheet, Image as ImageIcon, ShieldCheck, Search, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientDocumentCenterProps {
  patientId?: string;
  clinicId?: string;
  patientName?: string;
}

export const PatientDocumentCenter: React.FC<PatientDocumentCenterProps> = ({
  patientId = 'PT-8801',
  clinicId = 'clinic-beverly-hills',
  patientName = 'Sarah Jenkins',
}) => {
  const [documents, setDocuments] = useState<PatientPortalDocument[]>(DEFAULT_PATIENT_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PatientPortalDocument['category']>('Clinical Document');
  const [uploading, setUploading] = useState(false);

  const categories = ['All', 'Invoice', 'Prescription', 'X-Ray', 'Report', 'Clinical Document', 'Consent Form'];

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (docItem: PatientPortalDocument) => {
    // Generate simulated secure download
    const blob = new Blob([`Teethly EHR Record: ${docItem.title}\nPatient: ${patientName} (${patientId})\nCategory: ${docItem.category}\nDate: ${docItem.uploadedDate}\nIssued By: ${docItem.doctorName || 'Teethly Specialist Dental'}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setUploading(true);
    try {
      const newDoc = await uploadPatientPortalDocument(
        clinicId,
        patientId,
        uploadTitle,
        uploadCategory,
        '1.2 MB',
        patientName
      );
      setDocuments([newDoc, ...documents]);
      setIsUploadModalOpen(false);
      setUploadTitle('');
    } catch (err) {
      console.error('Document upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d5bd8] border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Patient EHR Vault
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Patient Document Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Access, inspect, and download official dental records, invoices, prescriptions, and 3D X-rays.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1d5bd8] hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENTS LIST */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold">No documents match filter.</div>
        ) : (
          filteredDocuments.map((docItem) => (
            <div
              key={docItem.id}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d5bd8] flex items-center justify-center shrink-0 font-bold">
                  {docItem.category === 'X-Ray' ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : docItem.category === 'Invoice' ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{docItem.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{docItem.category}</span>
                    <span>•</span>
                    <span>{docItem.uploadedDate}</span>
                    <span>•</span>
                    <span>{docItem.fileSize}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleDownload(docItem)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Only
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Upload Patient Attachment</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Previous Dental History Record"
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white"
                  >
                    <option value="Clinical Document">Clinical Document</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="Report">Report</option>
                    <option value="Consent Form">Consent Form</option>
                  </select>
                </div>

                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to select PDF or Image file</p>
                  <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 10 MB</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 rounded-xl bg-[#1d5bd8] text-white text-xs font-bold"
                  >
                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
