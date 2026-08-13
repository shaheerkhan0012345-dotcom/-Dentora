import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Printer,
  DollarSign,
  History,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { InvoiceRecord, InvoicePaymentStatus } from '../../types/financial';
import { generateInvoicePDF } from '../../utils/pdfInvoiceGenerator';

interface InvoiceTableProps {
  invoices: InvoiceRecord[];
  onOpenCreateForm: () => void;
  onOpenPaymentModal: (invoice: InvoiceRecord) => void;
  onOpenHistoryModal: (invoice: InvoiceRecord) => void;
  userRole?: string;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onOpenCreateForm,
  onOpenPaymentModal,
  onOpenHistoryModal,
  userRole = 'Admin',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || inv.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoicePaymentStatus) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="emerald" size="sm">Paid</Badge>;
      case 'Partially Paid':
        return <Badge variant="amber" size="sm">Partially Paid</Badge>;
      case 'Pending':
        return <Badge variant="rose" size="sm">Pending</Badge>;
      case 'Refunded':
        return <Badge variant="slate" size="sm">Refunded</Badge>;
      case 'Cancelled':
        return <Badge variant="slate" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, patient name, ID, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1d5bd8]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-[#1d5bd8]"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* CREATE BUTTON (STAFF/ADMIN ONLY) */}
        {userRole !== 'Patient' && (
          <button
            onClick={onOpenCreateForm}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Invoice # & Patient</th>
                <th className="p-4">Clinician</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Balance Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* INVOICE & PATIENT */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1d5bd8] flex items-center justify-center shrink-0 font-black">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{inv.invoiceNo}</span>
                          <span className="text-[11px] text-slate-500 font-bold">{inv.patientName}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{inv.patientId} • {inv.invoiceDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* CLINICIAN */}
                    <td className="p-4">
                      <span className="font-extrabold text-slate-800 block">{inv.doctorName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Due: {inv.dueDate}</span>
                    </td>

                    {/* GRAND TOTAL */}
                    <td className="p-4 font-black text-slate-900 text-xs">
                      ${inv.grandTotal.toFixed(2)}
                    </td>

                    {/* PAID */}
                    <td className="p-4 font-extrabold text-emerald-600 text-xs">
                      ${inv.paidAmount.toFixed(2)}
                    </td>

                    {/* REMAINING BALANCE */}
                    <td className="p-4">
                      <span className={`font-black text-xs ${inv.remainingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        ${inv.remainingBalance.toFixed(2)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-4">
                      {getStatusBadge(inv.paymentStatus)}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* RECEIVE PAYMENT BUTTON */}
                        {inv.remainingBalance > 0 && (
                          <button
                            onClick={() => onOpenPaymentModal(inv)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Collect Payment"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* PRINT PDF */}
                        <button
                          onClick={() => generateInvoicePDF(inv)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                          title="Print / Export PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* HISTORY */}
                        <button
                          onClick={() => onOpenHistoryModal(inv)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                          title="Payment Ledger History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
