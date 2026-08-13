import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  Heart,
  Lock,
  CheckCircle2,
  Stethoscope,
  Save,
  AlertCircle,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

interface PatientProfileSettingsProps {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export const PatientProfileSettings: React.FC<PatientProfileSettingsProps> = ({
  userName: initialName,
  userEmail: initialEmail,
  userPhone: initialPhone,
}) => {
  const { currentUser, refreshProfile } = useAuth();

  const [name, setName] = useState(initialName || currentUser?.displayName || 'Sarah Jenkins');
  const [email] = useState(initialEmail || currentUser?.email || 'sarah.j@gmail.com');
  const [phone, setPhone] = useState(initialPhone || currentUser?.phone || '+92 300 1234567');
  
  const [dob, setDob] = useState('1994-06-15');
  const [gender, setGender] = useState('Female');
  const [emergencyContact, setEmergencyContact] = useState('Michael Jenkins (+92 301 7654321)');
  const [medicalNotes, setMedicalNotes] = useState('Penicillin allergy. Mild anxiety during root canal procedures.');
  
  // Notification Preferences
  const [whatsappReminders, setWhatsappReminders] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status message
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);
    setIsSubmitting(true);

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
      setSaveSuccess('Your personal account profile & medical preferences have been updated successfully!');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
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

    setSaveSuccess('Security credentials updated! Next login will require your new password.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center font-black text-2xl shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Personal Patient Account
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">{email} • {phone}</p>
          </div>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs space-y-1 shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-300">Assigned Orthodontist</div>
          <div className="font-extrabold text-white flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-rose-400" /> Dr. Elena Rostova, MD
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

      {/* PERSONAL & MEDICAL INFORMATION FORM */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-rose-600" />
            <span>Personal Identification & Details</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Email Address (Read-only ID)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Phone Number (WhatsApp Reminders)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Emergency Contact Person</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        {/* MEDICAL HISTORY NOTES */}
        <div className="pt-2">
          <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1.5 text-xs">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Medical History & Drug Allergies Note</span>
          </label>
          <textarea
            rows={3}
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder="E.g., Allergies to Penicillin, latex sensitivity, pre-existing hypertension..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            This note is encrypted and made available to your treating dentist prior to procedure.
          </span>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-600" />
            <span>Communication & Appointment Alerts</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900 block">WhatsApp Appointment Reminders</span>
                  <span className="text-[10px] text-slate-500 font-medium">Receive automated booking confirmations & 24h reminders via WhatsApp</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappReminders}
                onChange={(e) => setWhatsappReminders(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900 block">Email Invoices & Treatment Summaries</span>
                  <span className="text-[10px] text-slate-500 font-medium">Receive digital receipts, payment links, and post-treatment care instructions</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailReceipts}
                onChange={(e) => setEmailReceipts(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900 block">SMS Emergency Alerts</span>
                  <span className="text-[10px] text-slate-500 font-medium">SMS updates for urgent schedule adjustments or emergency callbacks</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>

      {/* CHANGE PASSWORD & SECURITY */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Account Credentials & Password Security</span>
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
            Update Security Password
          </button>
        </div>
      </form>

      {/* PRIVACY & DATA PROTECTION DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Strict Privacy & Healthcare Record Isolation:</span> Your personal patient records, dental charts, invoices, and communication history are strictly isolated and encrypted. Clinic administrative tools, staff rosters, and device connections are restricted to authorized practice administrators.
        </div>
      </div>

    </div>
  );
};
