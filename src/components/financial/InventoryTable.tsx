import React, { useState } from 'react';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  RefreshCw,
  Truck,
  Filter,
  Calendar,
  Layers,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { InventoryRecord, InventoryReorderStatus } from '../../types/financial';

interface InventoryTableProps {
  inventory: InventoryRecord[];
  onOpenCreateModal: () => void;
  onOpenStockModal: (item: InventoryRecord) => void;
  onOpenSupplierModal: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  onOpenCreateModal,
  onOpenStockModal,
  onOpenSupplierModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.reorderStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: InventoryReorderStatus) => {
    switch (status) {
      case 'In Stock':
        return <Badge variant="emerald" size="sm">In Stock</Badge>;
      case 'Low Stock':
        return <Badge variant="amber" size="sm">Low Stock</Badge>;
      case 'Critical':
        return <Badge variant="rose" size="sm">Critical (0)</Badge>;
      case 'Expired':
        return <Badge variant="slate" size="sm">Expired</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search supply SKU, item name, supplier..."
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
            <option value="Implants">Implants</option>
            <option value="Composite">Composite</option>
            <option value="Gloves">Gloves</option>
            <option value="Anesthesia">Anesthesia</option>
            <option value="Medicines">Medicines</option>
            <option value="Dental Instruments">Dental Instruments</option>
            <option value="Cleaning Supplies">Cleaning Supplies</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-[#1d5bd8]"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSupplierModal}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-slate-600" />
            <span>Vendors</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-extrabold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">SKU & Item Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Min / Max</th>
                <th className="p-4">Batch / Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-black">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{item.itemName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{item.itemId} • Vendor: {item.supplierName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {item.category}
                    </td>

                    <td className="p-4">
                      <span className="font-black text-slate-900 text-sm">
                        {item.currentStock} {item.unit}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 font-medium">
                      Min: {item.minimumStock} • Max: {item.maximumStock}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{item.batchNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Exp: {item.expiryDate}</span>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(item.reorderStatus)}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => onOpenStockModal(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[11px] rounded-xl cursor-pointer transition-colors"
                      >
                        Adjust Stock
                      </button>
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
