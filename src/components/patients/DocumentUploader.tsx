import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileCode,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { PatientDocument, DocumentTypeCategory } from '../../types/patient';
import {
  uploadPatientDocument,
  deletePatientDocument,
  subscribeToPatientDocuments
} from '../../services/patientStorageService';

interface DocumentUploaderProps {
  patientDocId: string;
  uploaderName: string;
  uploaderRole: string;
  canUpload?: boolean;
  canDelete?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  patientDocId,
  uploaderName,
  uploaderRole,
  canUpload = true,
  canDelete = true,
}) => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentTypeCategory>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPatientDocuments(patientDocId, (docs) => {
      setDocuments(docs);
    });
    return () => unsubscribe();
  }, [patientDocId]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setErrorMsg('');
    setIsUploading(true);
    setProgress(0);

    try {
      await uploadPatientDocument(
        patientDocId,
        file,
        selectedCategory,
        uploaderName,
        uploaderRole,
        (p) => setProgress(p)
      );
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMsg(err?.message || 'Failed to upload document to Firebase Storage.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (docItem: PatientDocument) => {
    if (!confirm(`Are you sure you want to delete ${docItem.filename}?`)) return;
    try {
      await deletePatientDocument(
        patientDocId,
        docItem.id,
        docItem.storagePath,
        docItem.filename,
        uploaderName
      );
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  const getCategoryIcon = (type: DocumentTypeCategory) => {
    switch (type) {
      case 'image':
      case 'xray':
        return <ImageIcon className="w-5 h-5 text-indigo-600" />;
      case 'pdf':
      case 'report':
      case 'consent':
      default:
        return <FileText className="w-5 h-5 text-[#1d5bd8]" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      
      {/* UPLOAD BOX */}
      {canUpload && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#1d5bd8]" />
                <span>Upload Clinical Attachment / Storage File</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Store X-rays, PDFs, Consent Forms, and Medical Reports in Firebase Storage
              </p>
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400 text-[10px] uppercase font-extrabold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentTypeCategory)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
              >
                <option value="xray">Radiograph / X-Ray</option>
                <option value="report">Medical Report</option>
                <option value="consent">Signed Consent Form</option>
                <option value="pdf">General PDF Document</option>
                <option value="image">Clinical Photo / Intraoral Scan</option>
              </select>
            </div>
          </div>

          {/* DROPZONE */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive
                ? 'border-[#1d5bd8] bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-[#1d5bd8] mx-auto mb-2 opacity-80" />
            <p className="text-xs font-extrabold text-slate-800">
              Drag & Drop attachment file here, or{' '}
              <label className="text-[#1d5bd8] underline cursor-pointer hover:text-[#154dbf]">
                browse from computer
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Supports DICOM/X-Rays, PNG, JPG, PDF documents up to 50MB
            </p>

            {isUploading && (
              <div className="mt-4 space-y-1.5 max-w-xs mx-auto">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-700">
                  <span>Uploading to Cloud Storage...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#1d5bd8] h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 p-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Stored Patient Documents ({documents.length})</span>
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
            <p>No attachments uploaded to this patient record yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-slate-100/80 transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                    {getCategoryIcon(doc.fileType)}
                  </div>

                  <div className="overflow-hidden space-y-0.5">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate" title={doc.filename}>
                      {doc.filename}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <span className="uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {doc.fileType}
                      </span>
                      <span>{formatFileSize(doc.sizeBytes)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Uploaded by <span className="font-bold text-slate-700">{doc.uploadedBy}</span> on{' '}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={doc.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    title="Download / View File"
                  >
                    <Download className="w-4 h-4 text-[#1d5bd8]" />
                  </a>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer border border-rose-200/60"
                      title="Delete Attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
