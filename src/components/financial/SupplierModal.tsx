import React, { useState } from 'react';
import { X, Truck, Plus, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { SupplierRecord } from '../../types/financial';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierRecord[];
  onAddSupplier: (data: Omit<SupplierRecord, 'id' | 'createdAt'>) => Promise<void>;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onAddSupplier,
}) => {
  if (!isOpen) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !phone.trim()) {
      alert('Supplier name and phone are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddSupplier({
        supplierName,
        contactPerson,
        phone,
        email,
        address,
        notes,
      });
      setShowAddForm(false);
      setSupplierName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden my-8">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Dental Suppliers & Vendor Directory</h3>
              <p className="text-[10px] text-slate-300 font-medium">
                Manage dental material vendors, lab partners & pharmaceutical suppliers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4 text-xs">
          
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900">Registered Suppliers ({suppliers.length})</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Form' : 'Add New Vendor'}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dentsply Sirona"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Representative</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Tariq"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    placeholder="+92 (300) 555-0192"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="vendor@dentsply.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Office / Depot Address</label>
                <input
                  type="text"
                  placeholder="Plot 12, Industrial Zone, Islamabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          )}

          {/* LIST */}
          <div className="max-h-64 overflow-y-auto space-y-2.5">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{sup.supplierName}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {sup.contactPerson || 'Vendor'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {sup.phone}
                  </span>
                  {sup.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {sup.email}
                    </span>
                  )}
                  {sup.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {sup.address}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
