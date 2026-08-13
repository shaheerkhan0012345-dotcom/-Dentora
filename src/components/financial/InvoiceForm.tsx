import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  User,
  Stethoscope,
  DollarSign,
  Calendar,
  Percent,
} from 'lucide-react';
import { PatientRecord } from '../../types/patient';
import { InvoiceItem, InvoiceRecord } from '../../types/financial';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    invoice: Omit<
      InvoiceRecord,
      'id' | 'invoiceNo' | 'remainingBalance' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<void>;
  patients: PatientRecord[];
  doctors?: string[];
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  doctors = ['Dr. Elena Rostova', 'Dr. Marcus Vance', 'Dr. Sarah Jenkins'],
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || patients[0]?.patientId || ''
  );
  const [doctorName, setDoctorName] = useState<string>(doctors[0] || 'Dr. Elena Rostova');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'itm_1',
      description: 'Comprehensive Oral Hygiene & Dental Polishing',
      quantity: 1,
      unitPrice: 150,
      totalPrice: 150,
    },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(5); // 5%
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `itm_${Date.now().toString().slice(-4)}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: 'description' | 'quantity' | 'unitPrice',
    val: string | number
  ) => {
    setItems((prev) =>
      prev.map((itm) => {
        if (itm.id !== id) return itm;
        const updated = { ...itm, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = Number(field === 'quantity' ? val : updated.quantity) || 0;
          const price = Number(field === 'unitPrice' ? val : updated.unitPrice) || 0;
          updated.totalPrice = qty * price;
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100) * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discount + (taxAmount > 0 ? taxAmount : 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patientObj = patients.find(
      (p) => p.id === selectedPatientId || p.patientId === selectedPatientId
    );
    if (!patientObj) {
      alert('Please select a valid patient.');
      return;
    }

    if (items.some((i) => !i.description || i.totalPrice <= 0)) {
      alert('Please provide valid descriptions and amounts for all line items.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        patientId: patientObj.patientId || patientObj.id,
        patientName: patientObj.fullName,
        patientPhone: patientObj.phone,
        doctorId: 'DOC-101',
        doctorName,
        items,
        subtotal,
        discount,
        tax: taxAmount,
        taxRate,
        grandTotal,
        paidAmount,
        paymentStatus: paidAmount >= grandTotal ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending',
        invoiceDate,
        dueDate,
        notes,
      });

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden my-8">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d5bd8] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Generate Patient Invoice</h3>
              <p className="text-[10px] text-slate-300 font-medium">
                Itemized treatment billing statement with automated tax & discount calculation
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

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* PATIENT & DOCTOR SELECTOR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-pointer"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">
                Attending Clinician <span className="text-rose-500">*</span>
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-pointer"
                required
              >
                {doctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* ITEMIZED LINE ITEMS */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider">
                Treatment & Service Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-blue-50 text-[#1d5bd8] hover:bg-blue-100 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((itm, idx) => (
                <div
                  key={itm.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-2"
                >
                  <span className="font-black text-slate-400 text-[10px] w-4">{idx + 1}.</span>

                  <input
                    type="text"
                    placeholder="Description (e.g. Tooth 16 Composite restoration)"
                    value={itm.description}
                    onChange={(e) => handleItemChange(itm.id, 'description', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={itm.quantity}
                      onChange={(e) =>
                        handleItemChange(itm.id, 'quantity', parseInt(e.target.value) || 1)
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                      required
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Unit Price ($)"
                      value={itm.unitPrice}
                      onChange={(e) =>
                        handleItemChange(itm.id, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-right"
                      required
                    />

                    <div className="w-20 text-right font-black text-slate-900 text-xs">
                      ${itm.totalPrice.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(itm.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOTALS & DISCOUNTS */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal:</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold">Discount ($):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs"
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] text-slate-400 font-bold">Tax Rate (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs text-right"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm font-black text-white pt-1">
              <span>Grand Total:</span>
              <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-300">
                Initial Payment Collected ($):
              </span>
              <input
                type="number"
                min="0"
                max={grandTotal}
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 bg-emerald-950 border border-emerald-500/50 rounded-lg text-emerald-300 font-black text-xs text-right"
              />
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Invoice / Payment Notes</label>
            <input
              type="text"
              placeholder="e.g. Copay covered by insurance, patient balance pending next visit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          {/* ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Generating...' : 'Save & Issue Invoice'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
