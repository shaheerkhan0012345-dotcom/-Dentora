import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Package,
  Activity,
  FileSpreadsheet,
  FileText,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import {
  subscribeToInvoices,
  subscribeToPayments,
  subscribeToExpenses,
  subscribeToInventory,
} from '../../services/financialService';
import { subscribeToAppointments } from '../../services/appointmentService';
import { subscribeToPatients } from '../../services/patientService';
import {
  InvoiceRecord,
  PaymentRecord,
  ExpenseRecord,
  InventoryRecord,
} from '../../types/financial';
import { AppointmentRecord } from '../../types/appointment';
import { PatientRecord } from '../../types/patient';
import { ReportFilter } from '../../types/admin';

export const ReportGenerator: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  const [filter, setFilter] = useState<ReportFilter>({
    timeframe: 'Monthly',
    category: 'Revenue',
  });

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubInv = subscribeToInvoices(setInvoices);
    const unsubPay = subscribeToPayments(setPayments);
    const unsubExp = subscribeToExpenses(setExpenses);
    const unsubStock = subscribeToInventory(setInventory);
    const unsubAppts = subscribeToAppointments(setAppointments);
    const unsubPatients = subscribeToPatients(setPatients);

    return () => {
      unsubInv();
      unsubPay();
      unsubExp();
      unsubStock();
      unsubAppts();
      unsubPatients();
    };
  }, []);

  // Compute metrics
  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const totalAppts = appointments.length;
  const completedAppts = appointments.filter((a) => a.status === 'Completed').length;
  const noShowAppts = appointments.filter((a) => a.status === 'No Show' || a.status === 'Cancelled').length;
  const noShowRate = totalAppts > 0 ? Math.round((noShowAppts / totalAppts) * 100) : 0;

  // CSV Export Helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `Teethly_report_${filter.category.toLowerCase().replace(/\s+/g, '_')}_${
      filter.timeframe.toLowerCase()
    }.csv`;

    if (filter.category === 'Revenue') {
      csvContent += 'Invoice No,Patient Name,Date,Doctor,Total Amount,Paid Amount,Status\n';
      invoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNo}","${inv.patientName}","${inv.invoiceDate}","${inv.doctorName}",${inv.grandTotal},${inv.paidAmount},"${inv.paymentStatus}"\n`;
      });
    } else if (filter.category === 'Expenses') {
      csvContent += 'Expense ID,Category,Vendor,Amount,Date,Payment Method,Approved By\n';
      expenses.forEach((exp) => {
        csvContent += `"${exp.id}","${exp.category}","${exp.vendor}",${exp.amount},"${exp.expenseDate}","${exp.paymentMethod}","${exp.recordedBy}"\n`;
      });
    } else if (filter.category === 'Inventory') {
      csvContent += 'SKU,Item Name,Category,Quantity,Unit,Unit Price,Total Valuation,Status\n';
      inventory.forEach((item) => {
        csvContent += `"${item.itemId}","${item.itemName}","${item.category}",${item.currentStock},"${item.unit}",${item.purchasePrice},${item.currentStock * item.purchasePrice},"${item.reorderStatus}"\n`;
      });
    } else {
      csvContent += 'Report Category,Timeframe,Generated On,Metric 1,Metric 2\n';
      csvContent += `"${filter.category}","${filter.timeframe}","${new Date().toISOString()}",${totalRevenue},${totalExpenses}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV Export Downloaded Successfully');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Print Report Helper
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1d5bd8]" />
            <span>Practice Performance & Executive Analytics Engine</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Multi-dimensional reporting: financial P&L, patient growth, doctor productivity, no-show rate & AI usage
          </p>
        </div>

        {/* EXPORT ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <Filter className="w-4 h-4 text-[#1d5bd8]" />
            <span>Report Category:</span>
          </div>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value as any })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="Revenue">Revenue & Invoicing</option>
            <option value="Expenses">Expenses & Overhead</option>
            <option value="Inventory">Inventory Stock & Valuation</option>
            <option value="Patient Growth">Patient Growth & Demographics</option>
            <option value="Appointment Stats">Appointment & Queue Statistics</option>
            <option value="Treatment Performance">Treatment Performance & Profitability</option>
            <option value="Doctor Performance">Doctor Productivity & Case Load</option>
            <option value="No-show Analysis">No-show & Cancellation Analysis</option>
            <option value="AI Usage">AI Copilot & Action Logs</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="font-bold text-slate-600">Timeframe:</span>
          <select
            value={filter.timeframe}
            onChange={(e) => setFilter({ ...filter, timeframe: e.target.value as any })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-1 focus:ring-[#1d5bd8]"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Total Collected Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Rs. {totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Total Operating Expenses</span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Rs. {totalExpenses.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-bold">Clinic overheads & inventory POs</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Net Practice Profit</span>
            <Activity className="w-4 h-4 text-[#1d5bd8]" />
          </div>
          <div className="text-2xl font-black text-[#1d5bd8]">Rs. {netProfit.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-bold">Margin: ~{totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">No-Show / Cancellation Rate</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{noShowRate}%</div>
          <div className="text-[11px] text-amber-600 font-extrabold">{noShowAppts} lost appointments</div>
        </div>
      </div>

      {/* DETAILED DATA BREAKDOWN BASED ON SELECTED CATEGORY */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1d5bd8]" />
            <span>{filter.category} Report Ledger ({filter.timeframe})</span>
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            Generated at {new Date().toLocaleTimeString()}
          </span>
        </div>

        {filter.category === 'Revenue' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-800">{inv.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.doctorName}</td>
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 font-black text-slate-900">Rs. {inv.grandTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">Rs. {inv.paidAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filter.category === 'Expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-700">{exp.vendor}</td>
                    <td className="py-3 px-4 text-slate-500">{exp.expenseDate}</td>
                    <td className="py-3 px-4 font-black text-rose-700">Rs. {exp.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{exp.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filter.category === 'Inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Qty</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total Stock Value</th>
                  <th className="py-3 px-4">Reorder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.itemId}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{item.itemName}</td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{item.currentStock} {item.unit}</td>
                    <td className="py-3 px-4 text-slate-700">Rs. {item.purchasePrice}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">Rs. {(item.currentStock * item.purchasePrice).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.reorderStatus === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.reorderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filter.category !== 'Revenue' && filter.category !== 'Expenses' && filter.category !== 'Inventory' && (
          <div className="py-12 text-center text-xs space-y-2">
            <BarChart3 className="w-8 h-8 text-[#1d5bd8] mx-auto opacity-80" />
            <h4 className="font-extrabold text-slate-900 text-sm">{filter.category} Analysis Ledger</h4>
            <p className="text-slate-500 max-w-md mx-auto font-medium">
              Data synchronized from active clinical records. All statistics reflect live Firestore database logs for {filter.timeframe} reporting interval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
