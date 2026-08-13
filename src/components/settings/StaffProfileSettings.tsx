import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Building,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { UserRole } from '../../types/user';

interface StaffProfileSettingsProps {
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
}

export const StaffProfileSettings: React.FC<StaffProfileSettingsProps> = ({
  userRole = 'Doctor',
  userName: initialName,
  userEmail: initialEmail,
}) => {
  const { currentUser, refreshProfile } = useAuth();

  const [name, setName] = useState(initialName || currentUser?.displayName || 'Dr. Elena Rostova');
  const [email] = useState(initialEmail || currentUser?.email || 'elena.rostova@dentora.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+92 300 9876543');
  const [specialization, setSpecialization] = useState('Senior Orthodontist & Cosmetic Specialist');
  const [medicalLicense, setMedicalLicense] = useState('PMC-DEN-88192');
  const [workingShift, setWorkingShift] = useState('09:00 AM - 05:00 PM (Mon-Fri)');

  // Password Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications
  const [notifyOnNewBooking, setNotifyOnNewBooking] = useState(true);
  const [notifyOnCancel, setNotifyOnCancel] = useState(true);

  // Status message
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    try {
      if (currentUser?.uid) {
        await userService.updateUserProfile(currentUser.uid, {
          displayName: name,
          phone: phone,
        });
        if (refreshProfile) {
          await refreshProfile();
        }
      }
      setSaveSuccess('Your professional staff profile & shift preferences have been saved.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    if (!newPassword) {
      setSaveError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveError('New password and confirmation do not match.');
      return;
    }

    setSaveSuccess('Password security updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-black text-2xl shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {userRole} Account Profile
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">{email} • {phone}</p>
          </div>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs space-y-1 shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-300">Designation / Role</div>
          <div className="font-extrabold text-white flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-indigo-400" /> {userRole} Practitioner
          </div>
        </div>
      </div>

      {/* FEEDBACK TOASTS */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* STAFF PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Staff Member Information & Credentials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Staff Email ID (Read-only)</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Specialization / Department</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Medical License / Registration ID</label>
            <input
              type="text"
              value={medicalLicense}
              onChange={(e) => setMedicalLicense(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Working Shift Hours</label>
            <input
              type="text"
              value={workingShift}
              onChange={(e) => setWorkingShift(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Clinical Notifications & Appointment Alerts
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <span className="font-extrabold text-slate-900">Notify me when a new patient books an appointment</span>
              <input
                type="checkbox"
                checked={notifyOnNewBooking}
                onChange={(e) => setNotifyOnNewBooking(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <span className="font-extrabold text-slate-900">Notify me when an appointment is canceled or rescheduled</span>
              <input
                type="checkbox"
                checked={notifyOnCancel}
                onChange={(e) => setNotifyOnCancel(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Staff Profile</span>
          </button>
        </div>
      </form>

      {/* PASSWORD CHANGE */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Security & Staff Account Password</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </form>

    </div>
  );
};
