import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { LeaveRequest, LeaveType, LeaveStatus, StaffMember } from '../../types/admin';

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
  staffList: StaffMember[];
  onSubmitRequest: (req: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status' | 'doctorAvailabilitySynced'>) => Promise<void>;
  onUpdateStatus: (requestId: string, status: LeaveStatus, approvedBy: string, rejectionReason?: string) => Promise<void>;
  currentUserRole: string;
  currentUserName: string;
}

export const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({
  leaveRequests,
  staffList,
  onSubmitRequest,
  onUpdateStatus,
  currentUserRole,
  currentUserName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleOpenModal = () => {
    setSelectedStaffId(staffList[0]?.id || '');
    setLeaveType('Annual');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find((s) => s.id === selectedStaffId);
    if (!staff) return;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        staffId: staff.id,
        staffName: staff.fullName,
        staffRole: staff.role,
        leaveType,
        startDate,
        endDate,
        totalDays: totalDays > 0 ? totalDays : 1,
        reason,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await onUpdateStatus(id, 'Approved', currentUserName);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalId) return;
    try {
      await onUpdateStatus(rejectModalId, 'Rejected', currentUserName, rejectionReason);
      setRejectModalId(null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const canApprove = currentUserRole === 'Admin' || currentUserRole === 'Doctor';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Staff Leave Management & Doctor Availability Sync</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Submit leave applications, track balances, approve requests & auto-block doctor schedule calendars
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* LEAVE REQUESTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Total Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Doctor Schedule Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{req.staffName}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{req.staffRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{req.totalDays} Day(s)</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{req.reason}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {req.doctorAvailabilitySynced ? (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Calendar Blocked</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'Pending' && canApprove ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModalId(req.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] shadow-2xs cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: APPLY FOR LEAVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Submit Leave Application</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Member *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Maternity">Maternity/Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for the absence request..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT REASON */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-slate-900">Reject Leave Application</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State reason for rejecting leave application..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
