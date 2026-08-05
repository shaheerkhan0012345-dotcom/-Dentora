import React, { useState } from 'react';
import {
  FileImage,
  Upload,
  Plus,
  X,
  Eye,
  FileText,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { ClinicalAttachmentRecord, AttachmentCategory } from '../../types/clinical';

interface AttachmentUploaderProps {
  attachments: ClinicalAttachmentRecord[];
  onUploadAttachment: (
    attachment: Omit<ClinicalAttachmentRecord, 'id' | 'createdAt'>
  ) => Promise<void>;
  patientName: string;
  patientId: string;
  uploaderName?: string;
}

const CATEGORIES: AttachmentCategory[] = [
  'X-ray',
  'Clinical Image',
  'PDF Report',
  'Treatment Photo',
  'Consent Form',
];

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onUploadAttachment,
  patientName,
  patientId,
  uploaderName = 'Dr. Elena Rostova',
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fileType, setFileType] = useState<AttachmentCategory>('X-ray');
  const [filename, setFilename] = useState<string>('');
  const [fileURL, setFileURL] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Lightbox modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDemoSampleUpload = (sampleType: 'xray' | 'photo') => {
    if (sampleType === 'xray') {
      setFilename(`PA_Tooth_16_PostOp_${Date.now().toString().slice(-4)}.png`);
      setFileURL(
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80'
      );
      setFileType('X-ray');
    } else {
      setFilename(`Clinical_Surface_Photo_${Date.now().toString().slice(-4)}.png`);
      setFileURL(
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80'
      );
      setFileType('Clinical Image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename || !fileURL) {
      alert('Please provide a file name and URL or use a sample file.');
      return;
    }

    setSubmitting(true);
    try {
      await onUploadAttachment({
        patientId,
        filename,
        fileURL,
        fileType,
        uploadedBy: uploaderName,
      });

      setIsModalOpen(false);
      setFilename('');
      setFileURL('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-[#1d5bd8]" />
            <span>X-Rays, Clinical Photos & Consent Attachments</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Store, view, and inspect high-resolution periapical radiographs, intraoral photos, and signed consent files
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File / X-Ray</span>
        </button>
      </div>

      {/* ATTACHMENT GRID */}
      {attachments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-3">
          <div className="p-4 rounded-full bg-blue-50 text-[#1d5bd8] w-12 h-12 mx-auto flex items-center justify-center">
            <FileImage className="w-6 h-6" />
          </div>
          <p className="text-xs font-extrabold text-slate-800">No attachments uploaded for this patient yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Upload Radiograph / Attachment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {attachments.map((att) => {
            const isImage = att.fileURL.startsWith('http') || att.fileURL.startsWith('data:image');
            return (
              <div
                key={att.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden group hover:border-[#1d5bd8] transition-all flex flex-col justify-between"
              >
                {/* PREVIEW CONTAINER */}
                <div className="relative h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={att.fileURL}
                      alt={att.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FileText className="w-10 h-10 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-300 font-mono">PDF Document</span>
                    </div>
                  )}

                  {/* OVERLAY ACTION */}
                  {isImage && (
                    <button
                      onClick={() => setPreviewImage(att.fileURL)}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-extrabold text-xs cursor-pointer"
                    >
                      <Maximize2 className="w-5 h-5" />
                      <span>View Fullscreen</span>
                    </button>
                  )}

                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                    {att.fileType}
                  </span>
                </div>

                {/* DETAILS FOOTER */}
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate" title={att.filename}>
                    {att.filename}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    By {att.uploadedBy} • {new Date(att.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1d5bd8]" />
                <span>Upload Clinical Attachment</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Attachment Category</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as AttachmentCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Filename / Description</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="e.g. PA_Tooth_16_PreOp.png"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">File Image URL / Source</label>
                <input
                  type="text"
                  value={fileURL}
                  onChange={(e) => setFileURL(e.target.value)}
                  placeholder="https://... image link or upload sample"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              {/* DEMO SAMPLES */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2">
                <span className="text-[10px] font-extrabold text-[#1d5bd8] uppercase block">
                  Quick Demo Generator
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSampleUpload('xray')}
                    className="px-3 py-1 bg-white hover:bg-blue-100 text-[#1d5bd8] border border-blue-300 rounded-xl text-[10px] font-bold cursor-pointer"
                  >
                    + Sample Dental X-ray
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSampleUpload('photo')}
                    className="px-3 py-1 bg-white hover:bg-blue-100 text-[#1d5bd8] border border-blue-300 rounded-xl text-[10px] font-bold cursor-pointer"
                  >
                    + Sample Surface Photo
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl"
                >
                  {submitting ? 'Uploading...' : 'Save Attachment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="Fullscreen Attachment" className="max-w-full max-h-[85vh] object-contain mx-auto" />
          </div>
        </div>
      )}

    </div>
  );
};
