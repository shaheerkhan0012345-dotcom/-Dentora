import React, { useState } from 'react';
import { Search, Plus, Trash2, Receipt, Calendar, Building2, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ExpenseRecord } from '../../types/financial';

interface ExpenseTableProps {
  expenses: ExpenseRecord[];
  onOpenCreateForm: () => void;
  onDeleteExpense: (id: string) => Promise<void>;
  userRole?: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onOpenCreateForm,
  onDeleteExpense,
  userRole = 'Admin',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.expenseId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || exp.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalExpenseAmount = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by vendor, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1d5bd8]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-[#1d5bd8]"
          >
            <option value="All">All Categories</option>
            <option value="Medicines">Medicines</option>
            <option value="Equipment">Equipment</option>
            <option value="Utilities">Utilities</option>
            <option value="Rent">Rent</option>
            <option value="Staff Salary">Staff Salary</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Marketing">Marketing</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-2xl text-xs font-bold text-rose-900">
            Total: <span className="font-black">${totalExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <button
            onClick={onOpenCreateForm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Expense ID & Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method & Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                    No matching expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-black">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{exp.description}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{exp.expenseId} • Rec by {exp.recordedBy}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-full">
                        {exp.category}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-800">
                      {exp.vendor || 'N/A'}
                    </td>

                    <td className="p-4 font-black text-rose-600 text-xs">
                      ${exp.amount.toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{exp.paymentMethod}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{exp.expenseDate}</span>
                    </td>

                    <td className="p-4">
                      <Badge variant={exp.status === 'Paid' ? 'emerald' : 'amber'} size="sm">
                        {exp.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      {userRole === 'Admin' && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this expense entry?')) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
