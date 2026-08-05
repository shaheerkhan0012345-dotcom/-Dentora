import React, { useState } from 'react';
import { X, Receipt, DollarSign, Calendar, Tag, Building2 } from 'lucide-react';
import { ExpenseCategory, ExpenseRecord, PaymentMethod } from '../../types/financial';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<ExpenseRecord, 'id' | 'expenseId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  userName: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Medicines',
  'Equipment',
  'Utilities',
  'Rent',
  'Staff Salary',
  'Maintenance',
  'Laboratory',
  'Marketing',
  'Miscellaneous',
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<ExpenseCategory>('Medicines');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [invoiceAttachment, setInvoiceAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) {
      alert('Please fill in valid description and expense amount.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        category,
        description,
        vendor,
        amount,
        paymentMethod,
        expenseDate,
        status,
        invoiceAttachment,
        recordedBy: userName,
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
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Record Clinic Expense</h3>
              <p className="text-[10px] text-slate-300 font-medium">
                Track operational costs, vendor bills & equipment purchases
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 block mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Bulk composite resin supplies, solar battery servicing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Vendor / Payee</label>
              <input
                type="text"
                placeholder="e.g. PharmaPlus / Lab"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Paid' | 'Pending')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-pointer"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending Approval</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 block mb-1">Invoice / Receipt Attachment Ref</label>
            <input
              type="text"
              placeholder="e.g. VENDOR-INV-9921.pdf"
              value={invoiceAttachment}
              onChange={(e) => setInvoiceAttachment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
