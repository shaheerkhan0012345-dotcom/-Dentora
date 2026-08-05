import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Landmark, Wallet, CheckCircle2 } from 'lucide-react';
import { InvoiceRecord, PaymentMethod, PaymentRecord } from '../../types/financial';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  onSubmit: (
    invoice: InvoiceRecord,
    paymentData: {
      amount: number;
      method: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
      date: string;
    }
  ) => Promise<void>;
  userName: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSubmit,
  userName,
}) => {
  if (!isOpen || !invoice) return null;

  const [amount, setAmount] = useState<number>(invoice.remainingBalance || 0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(invoice, {
        amount,
        method,
        referenceNumber,
        notes,
        date,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Record Patient Payment</h3>
              <p className="text-[10px] text-emerald-100 font-medium">
                Invoice #{invoice.invoiceNo} • {invoice.patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUMMARY BAR */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-between text-xs font-bold text-emerald-950">
          <div>
            <span className="text-[10px] uppercase text-emerald-700 block font-extrabold">Grand Total</span>
            <span>${invoice.grandTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-emerald-700 block font-extrabold">Paid So Far</span>
            <span className="text-emerald-700">${invoice.paidAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-rose-600 block font-extrabold">Remaining Due</span>
            <span className="text-rose-600 font-black">${invoice.remainingBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* AMOUNT */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-extrabold text-slate-700">Payment Amount ($)</label>
              <button
                type="button"
                onClick={() => setAmount(invoice.remainingBalance)}
                className="text-[10px] font-bold text-[#1d5bd8] hover:underline cursor-pointer"
              >
                Pay Full Balance
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.remainingBalance}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm"
              required
            />
          </div>

          {/* METHOD */}
          <div>
            <label className="font-extrabold text-slate-700 block mb-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Cash', icon: DollarSign },
                { name: 'Card', icon: CreditCard },
                { name: 'Bank Transfer', icon: Landmark },
                { name: 'JazzCash', icon: Wallet },
                { name: 'EasyPaisa', icon: Wallet },
              ].map((m) => {
                const IconComp = m.icon;
                const isSelected = method === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMethod(m.name as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-left font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1d5bd8]/10 border-[#1d5bd8] text-[#1d5bd8]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REFERENCE & DATE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Ref / Slip #</label>
              <input
                type="text"
                placeholder="e.g. POS-9821"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label className="font-extrabold text-slate-700 block mb-1">Collector Notes</label>
            <input
              type="text"
              placeholder="e.g. Received copay at front desk"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[10px] text-slate-500 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Collected by <strong>{userName}</strong>. Payment receipt will be automatically appended to the patient's record.
            </span>
          </div>

          {/* ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-2">
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
