import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Plus, Receipt, History, AlertCircle } from 'lucide-react';
import { FinancialSummaryCards } from '../../financial/FinancialSummaryCards';
import { InvoiceTable } from '../../financial/InvoiceTable';
import { ExpenseTable } from '../../financial/ExpenseTable';
import { InvoiceForm } from '../../financial/InvoiceForm';
import { PaymentModal } from '../../financial/PaymentModal';
import { PaymentHistoryModal } from '../../financial/PaymentHistoryModal';
import { ExpenseForm } from '../../financial/ExpenseForm';
import {
  subscribeToInvoices,
  subscribeToPayments,
  subscribeToExpenses,
  subscribeToInventory,
  createInvoice,
  addPaymentToInvoice,
  createExpense,
  deleteExpense,
  computeFinancialSummary,
} from '../../../services/financialService';
import { subscribeToPatients } from '../../../services/patientService';
import {
  InvoiceRecord,
  PaymentRecord,
  ExpenseRecord,
  InventoryRecord,
} from '../../../types/financial';
import { PatientRecord } from '../../../types/patient';
import { useAuth } from '../../../hooks/useAuth';

export const InvoicesTab: React.FC = () => {
  const { currentUser } = useAuth();
  const userName = currentUser?.displayName || 'Admin / Accountant';
  const userRole = currentUser?.role || 'Admin';

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'expenses'>('invoices');

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  // Modals
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceRecord | null>(null);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState<InvoiceRecord | null>(null);

  useEffect(() => {
    const unsubInv = subscribeToInvoices(setInvoices);
    const unsubPay = subscribeToPayments(setPayments);
    const unsubExp = subscribeToExpenses(setExpenses);
    const unsubInvItem = subscribeToInventory(setInventory);

    const unsubPatients = subscribeToPatients((pList) => {
      setPatients(pList);
    });

    return () => {
      unsubInv();
      unsubPay();
      unsubExp();
      unsubInvItem();
      unsubPatients();
    };
  }, []);

  const isPatient = userRole === 'Patient';

  // Strict patient filtering
  const displayInvoices = isPatient
    ? invoices.filter((inv) => {
        const pClean = (currentUser?.displayName || '').toLowerCase().trim();
        const emailClean = (currentUser?.email || '').toLowerCase().trim();
        const invPName = (inv.patientName || '').toLowerCase().trim();
        const invPId = (inv.patientId || '').toLowerCase().trim();

        const matchesName = pClean ? (invPName.includes(pClean) || pClean.includes(invPName)) : false;
        const matchesEmail = emailClean ? invPId.includes(emailClean) : false;

        return matchesName || matchesEmail;
      })
    : invoices;

  const financialSummary = computeFinancialSummary(invoices, payments, expenses);
  const lowStockCount = inventory.filter(
    (item) => item.reorderStatus === 'Low Stock' || item.reorderStatus === 'Critical'
  ).length;

  const handleCreateInvoiceSubmit = async (data: any) => {
    await createInvoice(data, userName);
  };

  const handlePaymentSubmit = async (invoice: InvoiceRecord, paymentData: any) => {
    await addPaymentToInvoice(invoice, paymentData, userName);
  };

  const handleCreateExpenseSubmit = async (data: any) => {
    await createExpense(data, userName);
  };

  const handleDeleteExpenseSubmit = async (id: string) => {
    await deleteExpense(id);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#1d5bd8]" />
            <span>{isPatient ? 'My Invoices & Payment Receipts' : 'Clinic Billing, Invoices & Financial Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isPatient
              ? 'View your treatment invoices, digital receipts, and pay outstanding balances online'
              : 'Auto-numbered invoice generation, multi-channel payment collection & expense accounting'}
          </p>
        </div>

        {/* SUBTAB TOGGLE (STAFF/ADMIN ONLY) */}
        {!isPatient && (
          <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                activeSubTab === 'invoices'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices & Payments
            </button>
            <button
              onClick={() => setActiveSubTab('expenses')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                activeSubTab === 'expenses'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinic Expenses
            </button>
          </div>
        )}
      </div>

      {/* SUMMARY STATS WIDGETS (HIDE FOR PATIENT) */}
      {!isPatient && (
        <FinancialSummaryCards summary={financialSummary} lowStockCount={lowStockCount} />
      )}

      {/* TAB CONTENT */}
      {activeSubTab === 'invoices' || isPatient ? (
        <InvoiceTable
          invoices={displayInvoices}
          onOpenCreateForm={() => setIsInvoiceFormOpen(true)}
          onOpenPaymentModal={(inv) => setSelectedInvoiceForPayment(inv)}
          onOpenHistoryModal={(inv) => setSelectedInvoiceForHistory(inv)}
          userRole={userRole}
        />
      ) : (
        <ExpenseTable
          expenses={expenses}
          onOpenCreateForm={() => setIsExpenseFormOpen(true)}
          onDeleteExpense={handleDeleteExpenseSubmit}
          userRole={userRole}
        />
      )}

      {/* MODALS */}
      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => setIsInvoiceFormOpen(false)}
        onSubmit={handleCreateInvoiceSubmit}
        patients={patients}
      />

      <PaymentModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
        onSubmit={handlePaymentSubmit}
        userName={userName}
      />

      <PaymentHistoryModal
        isOpen={!!selectedInvoiceForHistory}
        onClose={() => setSelectedInvoiceForHistory(null)}
        invoice={selectedInvoiceForHistory}
        payments={payments}
      />

      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleCreateExpenseSubmit}
        userName={userName}
      />

    </div>
  );
};
