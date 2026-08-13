import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, DollarSign, Calendar, Clock, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { StaffMember, StaffRoleType, StaffStatus, WeeklyScheduleDay } from '../../types/admin';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
  onSave: (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  currentUserRole: string;
}

const DEFAULT_DAYS: WeeklyScheduleDay[] = [
  { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '14:00' },
  { day: 'Sunday', isWorking: false, startTime: '00:00', endTime: '00:00' },
];

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave,
  currentUserRole,
}) => {
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<StaffRoleType>('Doctor');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState<number>(100000);
  const [workingHours, setWorkingHours] = useState('09:00 AM - 05:00 PM');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleDay[]>(DEFAULT_DAYS);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [biometricId, setBiometricId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'emergency'>('profile');

  useEffect(() => {
    if (staff) {
      setFullName(staff.fullName || '');
      setEmployeeId(staff.employeeId || '');
      setEmail(staff.email || '');
      setPhone(staff.phone || '');
      setCnic(staff.cnic || '');
      setDesignation(staff.designation || '');
      setDepartment(staff.department || '');
      setRole(staff.role || 'Doctor');
      setJoiningDate(staff.joiningDate || '');
      setSalary(staff.salary || 0);
      setWorkingHours(staff.workingHours || '');
      setWeeklySchedule(staff.weeklySchedule || DEFAULT_DAYS);
      setEmergencyName(staff.emergencyContact?.name || '');
      setEmergencyRelation(staff.emergencyContact?.relation || '');
      setEmergencyPhone(staff.emergencyContact?.phone || '');
      setStatus(staff.status || 'Active');
      setBiometricId(staff.biometricId || '');
    } else {
      setFullName('');
      setEmployeeId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
      setEmail('');
      setPhone('');
      setCnic('');
      setDesignation('');
      setDepartment('Clinical Care');
      setRole('Doctor');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setSalary(150000);
      setWorkingHours('09:00 AM - 05:00 PM');
      setWeeklySchedule(DEFAULT_DAYS);
      setEmergencyName('');
      setEmergencyRelation('');
      setEmergencyPhone('');
      setStatus('Active');
      setBiometricId(`BIO-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [staff, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        employeeId,
        fullName,
        email,
        phone,
        cnic,
        designation,
        department,
        role,
        joiningDate,
        salary,
        workingHours,
        weeklySchedule,
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone,
        },
        status,
        biometricId,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleToggle = (index: number) => {
    const updated = [...weeklySchedule];
    updated[index].isWorking = !updated[index].isWorking;
    setWeeklySchedule(updated);
  };

  const canSeeSalary = currentUserRole === 'Admin' || currentUserRole === 'Accountant';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden my-8">
        {/* HEADER */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>{staff ? 'Edit Staff Profile' : 'Add New Staff Member'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise employee profile, credentials, working hours, and emergency contact
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-[#1d5bd8] text-[#1d5bd8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Personal & Role Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'schedule'
                ? 'border-[#1d5bd8] text-[#1d5bd8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekly Schedule & Hours
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'emergency'
                ? 'border-[#1d5bd8] text-[#1d5bd8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Emergency & Biometric
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@teethly.clinic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CNIC / ID Number</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="35202-0000000-0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">System Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRoleType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-1 focus:ring-[#1d5bd8]"
                >
                  <option value="Admin">Admin</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Dental Assistant">Dental Assistant</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Custom">Custom Role</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Endodontist"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Endodontics / Front Desk"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StaffStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-1 focus:ring-[#1d5bd8]"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {canSeeSalary ? (
                <div className="sm:col-span-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                  <label className="block font-black text-amber-900 mb-1 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span>Monthly Salary (PKR / Confidential)</span>
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-black text-slate-900"
                  />
                  <span className="text-[10px] text-amber-700 font-medium block mt-1">
                    Visible strictly to Administrators & Finance Accountants
                  </span>
                </div>
              ) : (
                <div className="sm:col-span-2 bg-slate-100 p-3 rounded-2xl text-[11px] text-slate-500 font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Salary details restricted by role permission</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">General Shift Hours Description</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#1d5bd8]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Weekly Duty Roster</label>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                  {weeklySchedule.map((dayItem, idx) => (
                    <div key={dayItem.day} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={dayItem.isWorking}
                          onChange={() => handleScheduleToggle(idx)}
                          className="w-4 h-4 text-[#1d5bd8] rounded-xs cursor-pointer"
                        />
                        <span className={`font-bold ${dayItem.isWorking ? 'text-slate-900' : 'text-slate-400'}`}>
                          {dayItem.day}
                        </span>
                      </div>

                      {dayItem.isWorking ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={dayItem.startTime}
                            onChange={(e) => {
                              const copy = [...weeklySchedule];
                              copy[idx].startTime = e.target.value;
                              setWeeklySchedule(copy);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px]"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="time"
                            value={dayItem.endTime}
                            onChange={(e) => {
                              const copy = [...weeklySchedule];
                              copy[idx].endTime = e.target.value;
                              setWeeklySchedule(copy);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px]"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 italic">Off Day</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <h4 className="text-xs font-black text-indigo-900">Emergency Contact Person</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Spouse / Parent"
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Brother / Wife"
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+92 300 1112233"
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biometric Scanner Device ID</label>
                <input
                  type="text"
                  value={biometricId}
                  onChange={(e) => setBiometricId(e.target.value)}
                  placeholder="BIO-101"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Connects to hardware biometric attendance terminals
                </p>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : staff ? 'Update Staff Member' : 'Save Staff Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
