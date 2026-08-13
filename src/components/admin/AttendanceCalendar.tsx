import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, Fingerprint, Plus, UserCheck } from 'lucide-react';
import { AttendanceRecord, StaffMember } from '../../types/admin';

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
  staffList: StaffMember[];
  onCheckIn: (staffId: string, staffName: string, staffRole: string) => Promise<void>;
  onCheckOut: (attendanceId: string) => Promise<void>;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceRecords,
  staffList,
  onCheckIn,
  onCheckOut,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [biometricSimulating, setBiometricSimulating] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === today);

  const handleSimulateCheckIn = async () => {
    const staff = staffList.find((s) => s.id === selectedStaffId);
    if (!staff) return;

    setIsProcessing(true);
    try {
      await onCheckIn(staff.id, staff.fullName, staff.role);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerBiometricScan = () => {
    setBiometricSimulating(true);
    setTimeout(async () => {
      setBiometricSimulating(false);
      await handleSimulateCheckIn();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & BIOMETRIC ACTION BAR */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Fingerprint className="w-4 h-4" />
            <span>Biometric Hardware Terminal Simulation</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Clinic Staff Attendance & Shift Tracker</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time check-in/out logs, biometric scanner integration, late arrival warnings & overtime
          </p>
        </div>

        {/* SIMULATION CARD */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400 w-full sm:w-auto"
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.role})
              </option>
            ))}
          </select>

          <button
            onClick={handleTriggerBiometricScan}
            disabled={biometricSimulating || isProcessing}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Fingerprint className={`w-4 h-4 ${biometricSimulating ? 'animate-pulse text-slate-900' : ''}`} />
            <span>{biometricSimulating ? 'Scanning Biometrics...' : 'Scan Fingerprint / Check-In'}</span>
          </button>
        </div>
      </div>

      {/* TODAY LOGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1d5bd8]" />
            <span>Today's Live Attendance Feed ({today})</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            Total Logged Today: {todayRecords.length}
          </span>
        </div>

        {todayRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No attendance check-ins logged for today yet. Use the Biometric Scanner above to check in.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Terminal ID</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {todayRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-slate-900">{rec.staffName}</td>
                    <td className="py-3 px-4 text-slate-600 font-bold">{rec.staffRole}</td>
                    <td className="py-3 px-4 font-black text-emerald-700">{rec.checkIn || '--'}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{rec.checkOut || 'Active Duty'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rec.status === 'Late' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-slate-500">
                      {rec.biometricDeviceId || 'HARDWARE-BIO-01'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!rec.checkOut ? (
                        <button
                          onClick={() => onCheckOut(rec.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Shift Ended</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HISTORICAL ATTENDANCE ARCHIVE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1d5bd8]" />
          <span>Historical Attendance Archive</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Late Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {attendanceRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-700">{rec.date}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{rec.staffName}</td>
                  <td className="py-3 px-4 text-slate-700">{rec.checkIn || '--'}</td>
                  <td className="py-3 px-4 text-slate-700">{rec.checkOut || '--'}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{rec.status}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {rec.lateArrivalMinutes > 0 ? `${rec.lateArrivalMinutes} mins` : 'On Time'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
