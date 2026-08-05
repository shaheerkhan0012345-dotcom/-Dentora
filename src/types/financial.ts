export type InvoicePaymentStatus = 
  | 'Pending' 
  | 'Partially Paid' 
  | 'Paid' 
  | 'Refunded' 
  | 'Cancelled';

export type PaymentMethod = 
  | 'Cash' 
  | 'Card' 
  | 'Bank Transfer' 
  | 'JazzCash' 
  | 'EasyPaisa' 
  | 'Future Online Gateway';

export interface InvoiceItem {
  id: string;
  description: string;
  treatmentId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number; // absolute currency discount
  tax: number; // absolute tax amount
  taxRate?: number; // e.g. 5 for 5%
  grandTotal: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: InvoicePaymentStatus;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  collectedBy: string;
  referenceNumber?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Medicines'
  | 'Equipment'
  | 'Utilities'
  | 'Rent'
  | 'Staff Salary'
  | 'Maintenance'
  | 'Laboratory'
  | 'Marketing'
  | 'Miscellaneous';

export type ExpenseStatus = 'Paid' | 'Pending' | 'Cancelled';

export interface ExpenseRecord {
  id: string;
  expenseId: string;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  invoiceAttachment?: string;
  status: ExpenseStatus;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryCategory = 
  | 'Medicines'
  | 'Dental Instruments'
  | 'Implants'
  | 'Gloves'
  | 'Masks'
  | 'Cotton'
  | 'Needles'
  | 'Anesthesia'
  | 'Composite'
  | 'Cement'
  | 'Cleaning Supplies';

export type StockOperationType = 'Stock In' | 'Stock Out' | 'Adjust Stock' | 'Return Stock';

export type InventoryReorderStatus = 'In Stock' | 'Low Stock' | 'Critical' | 'Expired';

export interface InventoryRecord {
  id: string;
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  supplierId?: string;
  supplierName: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  location: string;
  reorderStatus: InventoryReorderStatus;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentLog {
  id: string;
  inventoryItemId: string;
  itemName: string;
  operation: StockOperationType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface SupplierRecord {
  id: string;
  supplierName: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialAnalyticsSummary {
  todayRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  outstandingPayments: number;
  totalExpenses: number;
  estimatedProfit: number;
  topTreatments: { name: string; count: number; revenue: number }[];
  topDoctors: { name: string; revenue: number; patientCount: number }[];
  paymentMethodBreakdown: { method: string; total: number; count: number }[];
  revenueTrend: { month: string; revenue: number; expenses: number }[];
}
