import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  Clock,
  UserCheck,
  Tag,
} from 'lucide-react';
import { ClinicalNoteRecord, SOAPNotes } from '../../types/clinical';

interface ClinicalNotesEditorProps {
  notes: ClinicalNoteRecord[];
  onAddNote: (note: Omit<ClinicalNoteRecord, 'id' | 'noteId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  patientName: string;
  patientId: string;
  doctorName?: string;
}

const TEMPLATES = [
  {
    title: 'Routine Examination & Scaling',
    chiefComplaint: 'Routine 6-month dental checkup and calculus removal.',
    diagnosis: 'Mild Marginal Gingivitis',
    findings: 'Supragingival calculus on lower mandibular anteriors. No active caries.',
    procedure: 'Full mouth scaling, supragingival plaque removal, and fluoride prophylaxis application.',
    recommendations: 'Brush twice daily with fluoridated toothpaste, floss interdentally daily.',
    followUp: '6 Months',
    soap: {
      subjective: 'Patient reports no chief pain, desires regular prophylaxis.',
      objective: 'Gingival index 1.2, mild calculus on lingual of 31-41.',
      assessment: 'Generalized mild gingivitis.',
      plan: 'Full mouth scaling and polishing.',
    },
  },
  {
    title: 'Symptomatic Irreversible Pulpitis',
    chiefComplaint: 'Severe throbbing pain in upper posterior tooth aggravated by hot/cold.',
    diagnosis: 'Symptomatic Irreversible Pulpitis',
    findings: 'Deep occlusal caries extending to pulp chamber. Tenderness to percussion (+).',
    procedure: 'Local anesthesia administered. Caries excavation and pulpectomy performed.',
    recommendations: 'Avoid hard food on affected side. Take prescribed antibiotics and analgesics.',
    followUp: '5 Days for canal obturation',
    soap: {
      subjective: 'Sharp localized pain 8/10 for 3 days.',
      objective: 'Lingering cold test positive (>20s). Radio shows radiolucency reaching pulp.',
      assessment: 'Irreversible pulpitis with apical periodontitis.',
      plan: 'Start RCT, access cavity, extirpate pulp, biomechanical prep.',
    },
  },
];

export const ClinicalNotesEditor: React.FC<ClinicalNotesEditorProps> = ({
  notes,
  onAddNote,
  patientName,
  patientId,
  doctorName = 'Dr. Elena Rostova',
}) => {
  const [activeTab, setActiveTab] = useState<'Standard' | 'SOAP'>('Standard');

  // Form Fields
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [findings, setFindings] = useState<string>('');
  const [procedure, setProcedure] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [followUp, setFollowUp] = useState<string>('2 Weeks');

  // SOAP Fields
  const [subjective, setSubjective] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');
  const [plan, setPlan] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setChiefComplaint(tpl.chiefComplaint);
    setDiagnosis(tpl.diagnosis);
    setFindings(tpl.findings);
    setProcedure(tpl.procedure);
    setRecommendations(tpl.recommendations);
    setFollowUp(tpl.followUp);

    setSubjective(tpl.soap.subjective);
    setObjective(tpl.soap.objective);
    setAssessment(tpl.soap.assessment);
    setPlan(tpl.soap.plan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddNote({
        patientId,
        patientName,
        doctorName,
        chiefComplaint: chiefComplaint || 'Routine Visit',
        diagnosis,
        findings,
        procedure,
        recommendations,
        followUp,
        soap: {
          subjective,
          objective,
          assessment,
          plan,
        },
      });

      // Clear Form
      setChiefComplaint('');
      setDiagnosis('');
      setFindings('');
      setProcedure('');
      setRecommendations('');
      setSubjective('');
      setObjective('');
      setAssessment('');
      setPlan('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1d5bd8]" />
            <span>Clinical Consultation & SOAP Notes</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Record structured medical findings, procedures, diagnoses, and follow-up plans
          </p>
        </div>

        {/* QUICK TEMPLATE BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#1d5bd8]" />
            <span>Quick Templates:</span>
          </span>
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.title}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* NEW NOTE FORM (COL SPAN 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          
          {/* TABS */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('Standard')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'Standard'
                    ? 'bg-[#1d5bd8] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Standard Consultation Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SOAP')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'SOAP'
                    ? 'bg-[#1d5bd8] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                SOAP Structure
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Logged by: <strong className="text-slate-900">{doctorName}</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {activeTab === 'Standard' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chief Complaint</label>
                    <input
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="e.g. Sensitivity to cold, broken tooth #16..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Symptomatic Irreversible Pulpitis #16..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Findings</label>
                  <textarea
                    rows={2}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Details on cold test, percussion, radiograph findings..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Procedure Performed</label>
                  <textarea
                    rows={2}
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    placeholder="Describe anesthesia, cavity preparation, irrigation..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Recommendations</label>
                    <input
                      type="text"
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                      placeholder="e.g. Warm saline rinses, complete antibiotics..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Follow-up Interval</label>
                    <input
                      type="text"
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      placeholder="e.g. 5 Days, 1 Week"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* SOAP STRUCTURE */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-blue-700 block mb-1">S — Subjective</label>
                  <textarea
                    rows={3}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    placeholder="Patient reports, history of present illness, pain level..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-emerald-700 block mb-1">O — Objective</label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Clinical examination, vitality tests, radiographic findings..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-purple-700 block mb-1">A — Assessment</label>
                  <textarea
                    rows={3}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Differential and definitive diagnosis..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-amber-700 block mb-1">P — Plan</label>
                  <textarea
                    rows={3}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Treatment rendered today and next appointment plan..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-extrabold text-xs rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Saving Note...' : 'Save Clinical Note'}</span>
              </button>
            </div>

          </form>

        </div>

        {/* HISTORICAL NOTES STREAM (COL SPAN 1) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
            <span>Consultation History</span>
            <span className="text-xs font-bold text-slate-400">{notes.length} records</span>
          </h4>

          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No previous clinical notes found.</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-extrabold text-[#1d5bd8]">{n.noteId}</span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-extrabold text-slate-900">{n.chiefComplaint}</p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Diagnosis:</strong> {n.diagnosis}
                  </p>
                  {n.procedure && (
                    <p className="text-[11px] text-slate-600">
                      <strong>Procedure:</strong> {n.procedure}
                    </p>
                  )}
                  {n.soap?.subjective && (
                    <div className="p-2 bg-blue-50/60 rounded-xl text-[10px] space-y-0.5 text-slate-700 font-medium">
                      <p><strong>S:</strong> {n.soap.subjective}</p>
                      <p><strong>O:</strong> {n.soap.objective}</p>
                      <p><strong>A:</strong> {n.soap.assessment}</p>
                      <p><strong>P:</strong> {n.soap.plan}</p>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-semibold block text-right">
                    Doctor: {n.doctorName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
