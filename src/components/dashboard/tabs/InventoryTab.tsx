import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw, Truck } from 'lucide-react';
import { InventoryTable } from '../../financial/InventoryTable';
import { StockAdjustmentModal } from '../../financial/StockAdjustmentModal';
import { SupplierModal } from '../../financial/SupplierModal';
import {
  subscribeToInventory,
  subscribeToSuppliers,
  createInventoryItem,
  performStockOperation,
  createSupplier,
} from '../../../services/financialService';
import {
  InventoryRecord,
  SupplierRecord,
  StockOperationType,
  InventoryCategory,
} from '../../../types/financial';
import { useAuth } from '../../../hooks/useAuth';

export const InventoryTab: React.FC = () => {
  const { currentUser } = useAuth();
  const userName = currentUser?.displayName || 'Admin';

  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState<InventoryRecord | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // New Item Form Modal State
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Composite');
  const [supplierName, setSupplierName] = useState('Dentsply Sirona');
  const [purchasePrice, setPurchasePrice] = useState(50);
  const [sellingPrice, setSellingPrice] = useState(120);
  const [currentStock, setCurrentStock] = useState(15);
  const [minimumStock, setMinimumStock] = useState(5);
  const [maximumStock, setMaximumStock] = useState(50);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [batchNumber, setBatchNumber] = useState('BT-9901');
  const [location, setLocation] = useState('Cabinet A');
  const [unit, setUnit] = useState('Boxes');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubInv = subscribeToInventory(setInventory);
    const unsubSup = subscribeToSuppliers(setSuppliers);

    return () => {
      unsubInv();
      unsubSup();
    };
  }, []);

  const handleStockSubmit = async (
    item: InventoryRecord,
    operation: StockOperationType,
    qty: number,
    reason: string
  ) => {
    await performStockOperation(item, operation, qty, reason, userName);
  };

  const handleAddSupplier = async (data: any) => {
    await createSupplier(data);
  };

  const handleCreateNewItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Item name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await createInventoryItem({
        itemName,
        category,
        supplierName,
        purchasePrice,
        sellingPrice,
        currentStock,
        minimumStock,
        maximumStock,
        expiryDate,
        batchNumber,
        location,
        unit,
      });

      setIsNewItemModalOpen(false);
      setItemName('');
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = inventory.filter(
    (i) => i.reorderStatus === 'Low Stock' || i.reorderStatus === 'Critical'
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span>Dental Clinic Inventory & Supply Chain</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor medical supplies, stock thresholds, batch numbers & automated vendor reorders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Vendor Directory ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* LOW STOCK BANNER ALERT */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-amber-950 block">
                {lowStockItems.length} Dental Supply Items Below Minimum Threshold!
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                {lowStockItems.map((i) => `${i.itemName} (${i.currentStock} ${i.unit})`).join(', ')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-xl shrink-0 cursor-pointer shadow-xs"
          >
            Issue Vendor Reorders
          </button>
        </div>
      )}

      {/* TABLE */}
      <InventoryTable
        inventory={inventory}
        onOpenCreateModal={() => setIsNewItemModalOpen(true)}
        onOpenStockModal={(item) => {
          setSelectedItemForStock(item);
          setIsStockModalOpen(true);
        }}
        onOpenSupplierModal={() => setIsSupplierModalOpen(true)}
      />

      {/* MODALS */}
      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        item={selectedItemForStock}
        onSubmit={handleStockSubmit}
        userName={userName}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        suppliers={suppliers}
        onAddSupplier={handleAddSupplier}
      />

      {/* NEW INVENTORY ITEM MODAL */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1d5bd8] flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Add New Supply Item</h3>
                  <p className="text-[10px] text-slate-300 font-medium">Register medical inventory item into stock catalog</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateNewItemSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nano-Hybrid Restorative Composite"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="Composite">Composite</option>
                    <option value="Implants">Implants</option>
                    <option value="Gloves">Gloves</option>
                    <option value="Anesthesia">Anesthesia</option>
                    <option value="Medicines">Medicines</option>
                    <option value="Dental Instruments">Dental Instruments</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch #</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#1d5bd8] text-white font-bold rounded-xl cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
