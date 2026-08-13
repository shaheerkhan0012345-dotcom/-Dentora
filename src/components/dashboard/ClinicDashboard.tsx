import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Clinic, ClinicStatus } from '../../types/clinic';
import { SubscriptionCard } from './SubscriptionCard';
import { Building2, Plus, Search, CheckCircle2, AlertTriangle, Archive, Edit, ExternalLink, MapPin, Phone, Mail, Globe, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ClinicDashboard: React.FC<{ userName?: string }> = ({ userName = 'Super Admin' }) => {
  const { clinics, currentClinic, switchClinicById, handleCreateClinic, handleUpdateClinic, handleSetClinicStatus } = useClinic();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  // Form state for creating/editing clinic
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxNumber: '',
    currency: 'USD',
    timezone: 'America/Los_Angeles (GMT-7)',
    openTime: '08:30 AM',
    closeTime: '06:00 PM',
    subscriptionPlan: 'Professional' as Clinic['subscriptionPlan'],
    ownerName: '',
  });

  const filteredClinics = clinics.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxNumber: '',
      currency: 'USD',
      timezone: 'America/Los_Angeles (GMT-7)',
      openTime: '08:30 AM',
      closeTime: '06:00 PM',
      subscriptionPlan: 'Professional',
      ownerName: userName,
    });
    setEditingClinic(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      logo: clinic.logo || '',
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website || '',
      taxNumber: clinic.taxNumber || '',
      currency: clinic.currency,
      timezone: clinic.timezone,
      openTime: clinic.workingHours.openTime,
      closeTime: clinic.workingHours.closeTime,
      subscriptionPlan: clinic.subscriptionPlan,
      ownerName: clinic.ownerName,
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClinic) {
      await handleUpdateClinic(
        editingClinic.id,
        {
          name: formData.name,
          logo: formData.logo,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          taxNumber: formData.taxNumber,
          currency: formData.currency,
          timezone: formData.timezone,
          workingHours: {
            openTime: formData.openTime,
            closeTime: formData.closeTime,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          },
          subscriptionPlan: formData.subscriptionPlan,
          ownerName: formData.ownerName,
        },
        userName
      );
    } else {
      await handleCreateClinic(
        {
          name: formData.name,
          logo: formData.logo || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=200&q=80',
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          taxNumber: formData.taxNumber,
          currency: formData.currency,
          timezone: formData.timezone,
          workingHours: {
            openTime: formData.openTime,
            closeTime: formData.closeTime,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          },
          subscriptionPlan: formData.subscriptionPlan,
          subscriptionStatus: 'active',
          ownerId: `user-${Date.now()}`,
          ownerName: formData.ownerName,
          status: 'active',
        },
        userName
      );
    }
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1d5bd8] border border-blue-200 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Multi-Clinic SaaS Master Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Clinic Directory & Tenant Isolation
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage independent dental clinics, configure isolated databases, and oversee subscriptions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-[#1d5bd8] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register New Clinic
        </button>
      </div>

      {/* ACTIVE CLINIC SUBSCRIPTION overview */}
      <SubscriptionCard
        clinicId={currentClinic.id}
        clinicName={currentClinic.name}
        userName={userName}
      />

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clinic by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'active', 'suspended', 'archived'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* CLINIC GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => {
            const isCurrent = clinic.id === currentClinic.id;

            return (
              <div
                key={clinic.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                  isCurrent
                    ? 'bg-blue-50/40 border-blue-300 ring-2 ring-[#1d5bd8]/20 shadow-md'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold overflow-hidden">
                        {clinic.logo ? (
                          <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#1d5bd8]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-1">{clinic.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {clinic.id}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                        clinic.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : clinic.status === 'suspended'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {clinic.status}
                    </span>
                  </div>

                  {/* Clinic Details */}
                  <div className="space-y-2 text-xs text-slate-600 my-4">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{clinic.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{clinic.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{clinic.email}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      Currency: {clinic.currency}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                      Plan: {clinic.subscriptionPlan}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => switchClinicById(clinic.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {isCurrent ? 'Active Clinic' : 'Switch To Clinic'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(clinic)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Clinic Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {clinic.status === 'active' ? (
                      <button
                        onClick={() => handleSetClinicStatus(clinic.id, 'suspended', userName)}
                        className="p-2 rounded-xl text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Suspend Clinic"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetClinicStatus(clinic.id, 'active', userName)}
                        className="p-2 rounded-xl text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Activate Clinic"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleSetClinicStatus(clinic.id, 'archived', userName)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Archive Clinic"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE / EDIT CLINIC MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingClinic ? 'Edit Clinic Details' : 'Register New Tenant Clinic'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Configure isolated clinic settings, currency, working hours & owner profile.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Teethly Manhattan Dental Spa"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Dr. Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@clinic.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2831"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address, city, zip"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/20 focus:border-[#1d5bd8]"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="PKR">PKR (Rs.)</option>
                      <option value="AED">AED (AED)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Plan</label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option value="Trial">Trial</option>
                      <option value="Basic">Basic</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tax / Registration No.</label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      placeholder="EIN / NTN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1d5bd8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                  >
                    {editingClinic ? 'Save Changes' : 'Create Clinic'}
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
