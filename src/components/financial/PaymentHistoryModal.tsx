import React from 'react';
import { X, History, DollarSign, Calendar, User, Tag } from 'lucide-react';
import { InvoiceRecord, PaymentRecord } from '../../types/financial';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  payments: PaymentRecord[];
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  invoice,
  payments,
}) => {
  if (!isOpen || !invoice) return null;

  const invoicePayments = payments.filter(
    (p) => p.invoiceId === invoice.id || p.invoiceNo === invoice.invoiceNo
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d5bd8] flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Payment Ledger</h3>
              <p className="text-[10px] text-slate-300 font-medium">
                Invoice #{invoice.invoiceNo} • {invoice.patientName}
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

        {/* SUMMARY BAR */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-3 gap-2 text-xs text-slate-800 font-bold text-center">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block font-extrabold">Total Amount</span>
            <span>${invoice.grandTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-emerald-600 block font-extrabold">Total Paid</span>
            <span className="text-emerald-600">${invoice.paidAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-rose-600 block font-extrabold">Balance Due</span>
            <span className="text-rose-600">${invoice.remainingBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* LIST */}
        <div className="p-5 max-h-80 overflow-y-auto space-y-3">
          {invoicePayments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-semibold">
              No payments recorded yet for this invoice.
            </div>
          ) : (
            invoicePayments.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">${p.amount.toFixed(2)}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-[#1d5bd8] font-extrabold text-[10px] rounded-full border border-blue-200/50">
                      {p.method}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {p.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {p.collectedBy}
                    </span>
                  </div>
                  {p.referenceNumber && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      Ref: <span className="font-bold text-slate-600">{p.referenceNumber}</span>
                    </div>
                  )}
                  {p.notes && (
                    <p className="text-[10px] text-slate-600 italic">"{p.notes}"</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-xl">
                    Verified
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
