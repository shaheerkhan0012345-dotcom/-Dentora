import React, { useState, useEffect } from 'react';
import {
  Clock,
  UserPlus,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
  Search,
  Filter,
} from 'lucide-react';
import { QueueRecord, QueueStatus } from '../../types/appointment';
import {
  subscribeToQueue,
  updateQueueStatus,
  addWalkInToQueue,
} from '../../services/queueService';
import { QueueCard } from './QueueCard';

export const QueueBoard: React.FC = () => {
  const [queueList, setQueueList] = useState<QueueRecord[]>([]);
  const [lastCalledPatient, setLastCalledPatient] = useState<QueueRecord | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');

  // Walk-In Form state
  const [walkInName, setWalkInName] = useState<string>('');
  const [walkInDoctor, setWalkInDoctor] = useState<string>('Dr. Elena Rostova');
  const [walkInRoom, setWalkInRoom] = useState<string>('Chair 1 - Operatory A');
  const [walkInTreatment, setWalkInTreatment] = useState<string>('Walk-In Dental Emergency');
  const [walkInPriority, setWalkInPriority] = useState<QueueRecord['priority']>('Normal');
  const [submittingWalkIn, setSubmittingWalkIn] = useState<boolean>(false);

  // Real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToQueue((data) => {
      setQueueList(data);
    });
    return () => unsubscribe();
  }, []);

  // Call Next Handler
  const handleCallNext = async (item: QueueRecord) => {
    setLastCalledPatient(item);
    await updateQueueStatus(item.id, 'Called');

    // Play chime sound if enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (err) {
        console.warn('Audio chime warning:', err);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: QueueStatus) => {
    await updateQueueStatus(id, newStatus);
  };

  // Add Walk-In Submit
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    setSubmittingWalkIn(true);
    try {
      await addWalkInToQueue({
        patientName: walkInName,
        doctorName: walkInDoctor,
        room: walkInRoom,
        treatment: walkInTreatment,
        priority: walkInPriority,
      });

      setWalkInName('');
      setIsWalkInModalOpen(false);
    } catch (err) {
      console.error('Error adding walk-in:', err);
      alert('Failed to register walk-in patient.');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  // Filtering
  const filteredQueue = queueList.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.patientName.toLowerCase().includes(search.toLowerCase()) ||
      item.queueNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.treatment.toLowerCase().includes(search.toLowerCase());

    const matchesDoc = doctorFilter === 'All' || item.doctorName === doctorFilter;

    return matchesSearch && matchesDoc;
  });

  const waitingList = filteredQueue.filter((i) => i.status === 'Waiting');
  const calledList = filteredQueue.filter((i) => i.status === 'Called');
  const inTreatmentList = filteredQueue.filter((i) => i.status === 'In Treatment');
  const completedList = filteredQueue.filter((i) => ['Completed', 'Skipped', 'Cancelled'].includes(i.status));

  // Compute metrics
  const totalWaiting = queueList.filter((i) => i.status === 'Waiting').length;
  const totalInChair = queueList.filter((i) => ['Called', 'In Treatment'].includes(i.status)).length;
  const totalCompleted = queueList.filter((i) => i.status === 'Completed').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#006666]" />
            <span>Live Patient Waiting Queue</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time patient check-in, call chime announcements, and chair room flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* SOUND TOGGLE */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-teal-50 text-[#006666] border-teal-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Toggle Audio Chime Announcement"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          {/* WALK-IN REGISTRATION */}
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-In</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-teal-50/80 border border-teal-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#006666] text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{totalWaiting}</span>
            <span className="text-[11px] font-extrabold text-[#006666] uppercase">In Waiting Room</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-purple-50/80 border border-purple-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{totalInChair}</span>
            <span className="text-[11px] font-extrabold text-purple-700 uppercase">In Operatory Chair</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">{totalCompleted}</span>
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase">Completed Today</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#1d5bd8] text-white">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block">12 mins</span>
            <span className="text-[11px] font-extrabold text-[#1d5bd8] uppercase">Avg Wait Time</span>
          </div>
        </div>
      </div>

      {/* CALL NEXT ANNOUNCEMENT BANNER */}
      {lastCalledPatient && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 to-[#1d5bd8] text-white shadow-md flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-white">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-blue-200 tracking-wider block">
                Now Calling to Chair
              </span>
              <h3 className="text-base font-extrabold">
                Token {lastCalledPatient.queueNumber} — {lastCalledPatient.patientName}
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Proceed to {lastCalledPatient.room} ({lastCalledPatient.doctorName})
              </p>
            </div>
          </div>

          <button
            onClick={() => setLastCalledPatient(null)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queue by patient, ticket number (Q-101)..."
            className="w-full pl-10 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#008080]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#006666]" />
            <span>Doctor:</span>
          </label>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="All">All Doctors</option>
            <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
            <option value="Dr. Marcus Vance">Dr. Marcus Vance</option>
          </select>
        </div>
      </div>

      {/* QUEUE COLUMNS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: WAITING ROOM QUEUE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-teal-50/80 p-3 rounded-2xl border border-teal-200/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#006666]" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Waiting Room ({waitingList.length})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-[#006666]">In Arrival Order</span>
          </div>

          <div className="space-y-3">
            {waitingList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                Waiting room is currently empty.
              </div>
            ) : (
              waitingList.map((item, index) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onCallNext={handleCallNext}
                  isNextInLine={index === 0}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: CALLED & IN TREATMENT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-purple-50/80 p-3 rounded-2xl border border-purple-200/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 animate-ping" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Operatory Chairs ({calledList.length + inTreatmentList.length})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-purple-700">Active Visits</span>
          </div>

          <div className="space-y-3">
            {[...calledList, ...inTreatmentList].length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                No active patients in operatory chairs right now.
              </div>
            ) : (
              [...calledList, ...inTreatmentList].map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onCallNext={handleCallNext}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED TODAY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Completed / Finished ({completedList.length})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700">Today</span>
          </div>

          <div className="space-y-3">
            {completedList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                No completed visits logged today yet.
              </div>
            ) : (
              completedList.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onCallNext={handleCallNext}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* WALK-IN REGISTRATION MODAL */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#008080]" />
                <span>Register Walk-In Ticket</span>
              </h3>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Robert Miller"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Assign Doctor
                </label>
                <select
                  value={walkInDoctor}
                  onChange={(e) => setWalkInDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                  <option value="Dr. Marcus Vance">Dr. Marcus Vance</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Room / Chair
                </label>
                <select
                  value={walkInRoom}
                  onChange={(e) => setWalkInRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Chair 1 - Operatory A">Chair 1 - Operatory A</option>
                  <option value="Chair 2 - Operatory B">Chair 2 - Operatory B</option>
                  <option value="Chair 3 - Cosmetic Suite">Chair 3 - Cosmetic Suite</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Treatment / Reason
                </label>
                <input
                  type="text"
                  value={walkInTreatment}
                  onChange={(e) => setWalkInTreatment(e.target.value)}
                  placeholder="e.g. Acute Toothache"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Triage Priority
                </label>
                <select
                  value={walkInPriority}
                  onChange={(e) => setWalkInPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Normal">Normal</option>
                  <option value="Emergency">Emergency</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkIn}
                  className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {submittingWalkIn ? 'Issuing Ticket...' : 'Issue Token & Add'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
