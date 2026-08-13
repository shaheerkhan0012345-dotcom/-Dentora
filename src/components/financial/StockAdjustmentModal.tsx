import React, { useState } from 'react';
import { X, Package, RefreshCw, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { InventoryRecord, StockOperationType } from '../../types/financial';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryRecord | null;
  onSubmit: (
    item: InventoryRecord,
    operation: StockOperationType,
    qty: number,
    reason: string
  ) => Promise<void>;
  userName: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  item,
  onSubmit,
  userName,
}) => {
  if (!isOpen || !item) return null;

  const [operation, setOperation] = useState<StockOperationType>('Stock In');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('Vendor shipment received');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 && operation !== 'Adjust Stock') {
      alert('Quantity must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(item, operation, quantity, reason);
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
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Adjust Stock Level</h3>
              <p className="text-[10px] text-slate-300 font-medium">
                {item.itemName} ({item.itemId})
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

        {/* SUMMARY */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between text-xs font-bold text-amber-950">
          <div>
            <span className="text-[10px] uppercase text-amber-700 block font-extrabold">Current Stock</span>
            <span className="font-black text-sm">{item.currentStock} {item.unit}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-amber-700 block font-extrabold">Min Threshold</span>
            <span>{item.minimumStock} {item.unit}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-amber-700 block font-extrabold">Batch #</span>
            <span>{item.batchNumber}</span>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="font-extrabold text-slate-700 block mb-1">Operation Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'Stock In', label: 'Stock In (Receive)', color: 'emerald' },
                { type: 'Stock Out', label: 'Stock Out (Used)', color: 'rose' },
                { type: 'Adjust Stock', label: 'Direct Set Count', color: 'blue' },
                { type: 'Return Stock', label: 'Supplier Return', color: 'amber' },
              ].map((op) => (
                <button
                  key={op.type}
                  type="button"
                  onClick={() => setOperation(op.type as StockOperationType)}
                  className={`p-2.5 rounded-xl border font-bold text-xs text-left cursor-pointer transition-all ${
                    operation === op.type
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 block mb-1">
              Quantity {operation === 'Adjust Stock' ? 'Set Total To' : 'Change Amount'} ({item.unit})
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm"
              required
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-700 block mb-1">Reason / Note</label>
            <input
              type="text"
              placeholder="e.g. Weekly procedure consumption, PO-8821 delivery"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[10px] text-slate-500 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Updated by <strong>{userName}</strong>. All stock logs are audit-tracked in real-time.</span>
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Updating...' : 'Save Stock Update'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
