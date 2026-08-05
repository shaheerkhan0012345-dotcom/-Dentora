import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import {
  InvoiceRecord,
  PaymentRecord,
  ExpenseRecord,
  InventoryRecord,
  StockAdjustmentLog,
  SupplierRecord,
  FinancialAnalyticsSummary,
} from '../types/financial';

// SEED / DEMO INITIAL DATA FOR FIRST BOOT WHEN FIRESTORE IS EMPTY

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv_8801',
    invoiceNo: 'INV-2026-001',
    patientId: 'PT-8801',
    patientName: 'Sarah Jenkins',
    patientPhone: '+1 (555) 234-5678',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Elena Rostova',
    items: [
      { id: 'itm_1', description: 'Tooth 16 Composite Restoration (3 Surfaces)', quantity: 1, unitPrice: 220, totalPrice: 220 },
      { id: 'itm_2', description: 'Comprehensive Oral Hygiene & Scaling', quantity: 1, unitPrice: 150, totalPrice: 150 },
      { id: 'itm_3', description: 'Periapical Digital X-Ray (Tooth 16)', quantity: 2, unitPrice: 100, totalPrice: 200 },
    ],
    subtotal: 570,
    discount: 50,
    tax: 26,
    taxRate: 5,
    grandTotal: 546,
    paidAmount: 390,
    remainingBalance: 156,
    paymentStatus: 'Partially Paid',
    invoiceDate: '2026-08-01',
    dueDate: '2026-08-15',
    notes: 'Patient requested partial payment via JazzCash and cash balance.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Receptionist Fatima',
  },
  {
    id: 'inv_8802',
    invoiceNo: 'INV-2026-002',
    patientId: 'PT-8802',
    patientName: 'Marcus Vance',
    patientPhone: '+1 (555) 345-6789',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Marcus Vance',
    items: [
      { id: 'itm_4', description: 'Tooth 21 Zirconia Porcelain Crown Placement', quantity: 1, unitPrice: 1200, totalPrice: 1200 },
    ],
    subtotal: 1200,
    discount: 100,
    tax: 55,
    taxRate: 5,
    grandTotal: 1155,
    paidAmount: 1155,
    remainingBalance: 0,
    paymentStatus: 'Paid',
    invoiceDate: '2026-07-28',
    dueDate: '2026-08-10',
    notes: 'Paid in full via Visa Credit Card.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Admin',
  },
  {
    id: 'inv_8803',
    invoiceNo: 'INV-2026-003',
    patientId: 'PT-8803',
    patientName: 'Emily Watson',
    patientPhone: '+1 (555) 456-7890',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Elena Rostova',
    items: [
      { id: 'itm_5', description: 'Orthodontic Retainer Adjustment & Polishing', quantity: 1, unitPrice: 350, totalPrice: 350 },
    ],
    subtotal: 350,
    discount: 0,
    tax: 17.5,
    taxRate: 5,
    grandTotal: 367.5,
    paidAmount: 0,
    remainingBalance: 367.5,
    paymentStatus: 'Pending',
    invoiceDate: '2026-08-02',
    dueDate: '2026-08-16',
    notes: 'Pending copay verification.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Dr. Elena Rostova',
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_101',
    invoiceId: 'inv_8801',
    invoiceNo: 'INV-2026-001',
    patientId: 'PT-8801',
    patientName: 'Sarah Jenkins',
    amount: 200,
    method: 'Cash',
    collectedBy: 'Receptionist Fatima',
    referenceNumber: 'CASH-9921',
    notes: 'Initial deposit upon completion of procedure',
    date: '2026-08-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay_102',
    invoiceId: 'inv_8801',
    invoiceNo: 'INV-2026-001',
    patientId: 'PT-8801',
    patientName: 'Sarah Jenkins',
    amount: 190,
    method: 'JazzCash',
    collectedBy: 'Receptionist Fatima',
    referenceNumber: 'JC-8827391',
    notes: 'Partial online transfer',
    date: '2026-08-02',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay_103',
    invoiceId: 'inv_8802',
    invoiceNo: 'INV-2026-002',
    patientId: 'PT-8802',
    patientName: 'Marcus Vance',
    amount: 1155,
    method: 'Card',
    collectedBy: 'Admin',
    referenceNumber: 'POS-77312',
    notes: 'Visa Card Swipe',
    date: '2026-07-28',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp_201',
    expenseId: 'EXP-1001',
    category: 'Medicines',
    description: 'Bulk order of Amoxicillin 500mg and Ibuprofen 400mg',
    vendor: 'PharmaPlus Distributors',
    amount: 1450,
    paymentMethod: 'Bank Transfer',
    expenseDate: '2026-07-25',
    invoiceAttachment: 'INV-PH-8821.pdf',
    status: 'Paid',
    recordedBy: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exp_202',
    expenseId: 'EXP-1002',
    category: 'Utilities',
    description: 'Electricity & Solar Back-up Grid Bill',
    vendor: 'Electric Supply Corp',
    amount: 820,
    paymentMethod: 'Bank Transfer',
    expenseDate: '2026-08-01',
    status: 'Paid',
    recordedBy: 'Accountant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exp_203',
    expenseId: 'EXP-1003',
    category: 'Laboratory',
    description: 'Zirconia Crown and Bridge CAD/CAM Lab Charges',
    vendor: 'Precision Dental Lab',
    amount: 2100,
    paymentMethod: 'Bank Transfer',
    expenseDate: '2026-08-02',
    status: 'Pending',
    recordedBy: 'Dr. Elena Rostova',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_INVENTORY: InventoryRecord[] = [
  {
    id: 'inv_item_1',
    itemId: 'SK-1001',
    itemName: '3D Clear Aligner Trays (Box of 50)',
    category: 'Implants',
    supplierName: 'AlignTech Dental Ltd',
    purchasePrice: 180,
    sellingPrice: 400,
    currentStock: 4,
    minimumStock: 10,
    maximumStock: 50,
    expiryDate: '2027-12-31',
    batchNumber: 'BT-99201',
    location: 'Cabinet A - Shelf 2',
    reorderStatus: 'Low Stock',
    unit: 'Boxes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv_item_2',
    itemId: 'SK-1002',
    itemName: 'Composite Dental Resin Gel (Nano Hybrid)',
    category: 'Composite',
    supplierName: 'Dentsply Sirona',
    purchasePrice: 45,
    sellingPrice: 120,
    currentStock: 2,
    minimumStock: 8,
    maximumStock: 30,
    expiryDate: '2026-08-25',
    batchNumber: 'BT-88310',
    location: 'Cabinet B - Drawer 1',
    reorderStatus: 'Low Stock',
    unit: 'Syringes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv_item_3',
    itemId: 'SK-1003',
    itemName: 'Nitrile Dental Gloves (Medium Powder-Free)',
    category: 'Gloves',
    supplierName: 'MediGlove Pakistan',
    purchasePrice: 12,
    sellingPrice: 20,
    currentStock: 120,
    minimumStock: 30,
    maximumStock: 200,
    expiryDate: '2028-05-10',
    batchNumber: 'BT-1002',
    location: 'Store Room - Rack 3',
    reorderStatus: 'In Stock',
    unit: 'Boxes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv_item_4',
    itemId: 'SK-1004',
    itemName: 'Dental Anesthetic Carpules 2% Lidocaine',
    category: 'Anesthesia',
    supplierName: 'PharmaPlus Distributors',
    purchasePrice: 35,
    sellingPrice: 70,
    currentStock: 45,
    minimumStock: 20,
    maximumStock: 100,
    expiryDate: '2026-09-15',
    batchNumber: 'BT-3391',
    location: 'Refrigerated Unit C',
    reorderStatus: 'In Stock',
    unit: 'Packs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: 'sup_1',
    supplierName: 'PharmaPlus Distributors',
    contactPerson: 'Mr. Tariq Mahmood',
    phone: '+92 (300) 555-1234',
    email: 'orders@pharmaplus.pk',
    address: 'Plot 44, Industrial Area I-9, Islamabad',
    notes: 'Primary supplier for local anesthetics and antibiotics.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sup_2',
    supplierName: 'Precision Dental Lab',
    contactPerson: 'Dr. Shahbaz Ahmed',
    phone: '+92 (321) 444-9876',
    email: 'cadcam@precisionlab.com',
    address: 'Suite 12, Blue Area, Islamabad',
    notes: 'Premium CAD/CAM zirconia and ceramic crown lab partner.',
    createdAt: new Date().toISOString(),
  },
];

// ==========================================
// 1. INVOICE SERVICES
// ==========================================

export function subscribeToInvoices(callback: (invoices: InvoiceRecord[]) => void) {
  const invoicesRef = collection(db, 'invoices');
  return onSnapshot(
    invoicesRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data to Firestore asynchronously if empty
        INITIAL_INVOICES.forEach((inv) => {
          setDoc(doc(db, 'invoices', inv.id), inv).catch(() => {});
        });
        callback(INITIAL_INVOICES);
      } else {
        const list: InvoiceRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as InvoiceRecord);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.READ, 'invoices');
      callback(INITIAL_INVOICES);
    }
  );
}

export async function createInvoice(
  data: Omit<InvoiceRecord, 'id' | 'invoiceNo' | 'remainingBalance' | 'createdAt' | 'updatedAt'>,
  createdBy: string
): Promise<string> {
  const seq = Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `INV-2026-${seq}`;

  const remainingBalance = Math.max(0, data.grandTotal - data.paidAmount);
  let status: InvoiceRecord['paymentStatus'] = 'Pending';
  if (data.paidAmount >= data.grandTotal && data.grandTotal > 0) {
    status = 'Paid';
  } else if (data.paidAmount > 0) {
    status = 'Partially Paid';
  }

  const invoiceDoc: Omit<InvoiceRecord, 'id'> = {
    ...data,
    invoiceNo,
    remainingBalance,
    paymentStatus: status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
  };

  try {
    const docRef = await addDoc(collection(db, 'invoices'), invoiceDoc);

    // If initial paidAmount > 0, create a payment record
    if (data.paidAmount > 0) {
      await addDoc(collection(db, 'payments'), {
        invoiceId: docRef.id,
        invoiceNo,
        patientId: data.patientId,
        patientName: data.patientName,
        amount: data.paidAmount,
        method: 'Cash',
        collectedBy: createdBy,
        date: data.invoiceDate,
        notes: 'Initial payment upon invoice creation',
        createdAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'invoices');
    throw error;
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceRecord['paymentStatus'],
  updatedBy: string
) {
  try {
    const ref = doc(db, 'invoices', invoiceId);
    await updateDoc(ref, {
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `invoices/${invoiceId}`);
    throw error;
  }
}

// ==========================================
// 2. PAYMENT SERVICES
// ==========================================

export function subscribeToPayments(callback: (payments: PaymentRecord[]) => void) {
  const ref = collection(db, 'payments');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_PAYMENTS.forEach((p) => {
          setDoc(doc(db, 'payments', p.id), p).catch(() => {});
        });
        callback(INITIAL_PAYMENTS);
      } else {
        const list: PaymentRecord[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as PaymentRecord);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.READ, 'payments');
      callback(INITIAL_PAYMENTS);
    }
  );
}

export async function addPaymentToInvoice(
  invoice: InvoiceRecord,
  paymentData: {
    amount: number;
    method: PaymentRecord['method'];
    referenceNumber?: string;
    notes?: string;
    date: string;
  },
  collectedBy: string
) {
  try {
    const newPaidAmount = invoice.paidAmount + paymentData.amount;
    const newRemaining = Math.max(0, invoice.grandTotal - newPaidAmount);

    let newStatus: InvoiceRecord['paymentStatus'] = 'Partially Paid';
    if (newPaidAmount >= invoice.grandTotal) {
      newStatus = 'Paid';
    }

    // 1. Create payment record
    await addDoc(collection(db, 'payments'), {
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: paymentData.amount,
      method: paymentData.method,
      collectedBy,
      referenceNumber: paymentData.referenceNumber || '',
      notes: paymentData.notes || '',
      date: paymentData.date,
      createdAt: new Date().toISOString(),
    });

    // 2. Update invoice balances
    const invRef = doc(db, 'invoices', invoice.id);
    await updateDoc(invRef, {
      paidAmount: newPaidAmount,
      remainingBalance: newRemaining,
      paymentStatus: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'payments');
    throw error;
  }
}

// ==========================================
// 3. EXPENSE SERVICES
// ==========================================

export function subscribeToExpenses(callback: (expenses: ExpenseRecord[]) => void) {
  const ref = collection(db, 'expenses');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_EXPENSES.forEach((e) => {
          setDoc(doc(db, 'expenses', e.id), e).catch(() => {});
        });
        callback(INITIAL_EXPENSES);
      } else {
        const list: ExpenseRecord[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as ExpenseRecord);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.READ, 'expenses');
      callback(INITIAL_EXPENSES);
    }
  );
}

export async function createExpense(
  data: Omit<ExpenseRecord, 'id' | 'expenseId' | 'createdAt' | 'updatedAt'>,
  recordedBy: string
) {
  const seq = Math.floor(1000 + Math.random() * 9000);
  const expenseId = `EXP-${seq}`;

  const docObj: Omit<ExpenseRecord, 'id'> = {
    ...data,
    expenseId,
    recordedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, 'expenses'), docObj);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'expenses');
    throw error;
  }
}

export async function deleteExpense(id: string) {
  try {
    await deleteDoc(doc(db, 'expenses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
    throw error;
  }
}

// ==========================================
// 4. INVENTORY & STOCK SERVICES
// ==========================================

export function subscribeToInventory(callback: (inventory: InventoryRecord[]) => void) {
  const ref = collection(db, 'inventory');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_INVENTORY.forEach((inv) => {
          setDoc(doc(db, 'inventory', inv.id), inv).catch(() => {});
        });
        callback(INITIAL_INVENTORY);
      } else {
        const list: InventoryRecord[] = [];
        snapshot.forEach((snap) => {
          const item = { id: snap.id, ...snap.data() } as InventoryRecord;
          
          // Re-evaluate stock status dynamically
          let reorderStatus: InventoryRecord['reorderStatus'] = 'In Stock';
          if (item.currentStock === 0) {
            reorderStatus = 'Critical';
          } else if (item.currentStock <= item.minimumStock) {
            reorderStatus = 'Low Stock';
          }
          list.push({ ...item, reorderStatus });
        });
        list.sort((a, b) => a.itemName.localeCompare(b.itemName));
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.READ, 'inventory');
      callback(INITIAL_INVENTORY);
    }
  );
}

export async function createInventoryItem(
  data: Omit<InventoryRecord, 'id' | 'itemId' | 'reorderStatus' | 'createdAt' | 'updatedAt'>
) {
  const seq = Math.floor(1000 + Math.random() * 9000);
  const itemId = `SK-${seq}`;

  let reorderStatus: InventoryRecord['reorderStatus'] = 'In Stock';
  if (data.currentStock === 0) reorderStatus = 'Critical';
  else if (data.currentStock <= data.minimumStock) reorderStatus = 'Low Stock';

  const docObj: Omit<InventoryRecord, 'id'> = {
    ...data,
    itemId,
    reorderStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, 'inventory'), docObj);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'inventory');
    throw error;
  }
}

export async function performStockOperation(
  item: InventoryRecord,
  operation: 'Stock In' | 'Stock Out' | 'Adjust Stock' | 'Return Stock',
  qty: number,
  reason: string,
  performedBy: string
) {
  let newQty = item.currentStock;
  if (operation === 'Stock In' || operation === 'Return Stock') {
    newQty += qty;
  } else if (operation === 'Stock Out') {
    newQty = Math.max(0, newQty - qty);
  } else if (operation === 'Adjust Stock') {
    newQty = Math.max(0, qty);
  }

  let reorderStatus: InventoryRecord['reorderStatus'] = 'In Stock';
  if (newQty === 0) reorderStatus = 'Critical';
  else if (newQty <= item.minimumStock) reorderStatus = 'Low Stock';

  try {
    const ref = doc(db, 'inventory', item.id);
    await updateDoc(ref, {
      currentStock: newQty,
      reorderStatus,
      updatedAt: new Date().toISOString(),
    });

    // Log stock adjustment
    await addDoc(collection(db, `inventory/${item.id}/logs`), {
      inventoryItemId: item.id,
      itemName: item.itemName,
      operation,
      quantityChange: qty,
      previousStock: item.currentStock,
      newStock: newQty,
      reason,
      performedBy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inventory/${item.id}`);
    throw error;
  }
}

// ==========================================
// 5. SUPPLIER SERVICES
// ==========================================

export function subscribeToSuppliers(callback: (suppliers: SupplierRecord[]) => void) {
  const ref = collection(db, 'suppliers');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_SUPPLIERS.forEach((s) => {
          setDoc(doc(db, 'suppliers', s.id), s).catch(() => {});
        });
        callback(INITIAL_SUPPLIERS);
      } else {
        const list: SupplierRecord[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as SupplierRecord);
        });
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.READ, 'suppliers');
      callback(INITIAL_SUPPLIERS);
    }
  );
}

export async function createSupplier(data: Omit<SupplierRecord, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'suppliers'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'suppliers');
    throw error;
  }
}

// ==========================================
// 6. FINANCIAL ANALYTICS COMPUTATION
// ==========================================

export function computeFinancialSummary(
  invoices: InvoiceRecord[],
  payments: PaymentRecord[],
  expenses: ExpenseRecord[]
): FinancialAnalyticsSummary {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const currentYearStr = todayStr.substring(0, 4); // YYYY

  // Revenue from payments
  let todayRevenue = 0;
  let monthlyRevenue = 0;
  let yearlyRevenue = 0;

  const paymentMethodsMap: Record<string, { total: number; count: number }> = {};

  payments.forEach((p) => {
    const amt = p.amount || 0;
    const pDate = p.date || p.createdAt?.split('T')[0] || '';

    if (pDate === todayStr) todayRevenue += amt;
    if (pDate.startsWith(currentMonthStr)) monthlyRevenue += amt;
    if (pDate.startsWith(currentYearStr)) yearlyRevenue += amt;

    if (!paymentMethodsMap[p.method]) {
      paymentMethodsMap[p.method] = { total: 0, count: 0 };
    }
    paymentMethodsMap[p.method].total += amt;
    paymentMethodsMap[p.method].count += 1;
  });

  // Outstanding payments from invoices
  let outstandingPayments = 0;
  const treatmentCounts: Record<string, { count: number; revenue: number }> = {};
  const doctorRevenueMap: Record<string, { revenue: number; patientCount: Set<string> }> = {};

  invoices.forEach((inv) => {
    if (inv.paymentStatus !== 'Cancelled') {
      outstandingPayments += inv.remainingBalance || 0;
    }

    if (!doctorRevenueMap[inv.doctorName]) {
      doctorRevenueMap[inv.doctorName] = { revenue: 0, patientCount: new Set() };
    }
    doctorRevenueMap[inv.doctorName].revenue += inv.paidAmount || 0;
    doctorRevenueMap[inv.doctorName].patientCount.add(inv.patientId);

    inv.items.forEach((itm) => {
      const name = itm.description;
      if (!treatmentCounts[name]) {
        treatmentCounts[name] = { count: 0, revenue: 0 };
      }
      treatmentCounts[name].count += itm.quantity;
      treatmentCounts[name].revenue += itm.totalPrice;
    });
  });

  // Expenses total
  let totalExpenses = 0;
  expenses.forEach((exp) => {
    if (exp.status === 'Paid') {
      totalExpenses += exp.amount || 0;
    }
  });

  const estimatedProfit = monthlyRevenue - totalExpenses;

  const topTreatments = Object.entries(treatmentCounts)
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topDoctors = Object.entries(doctorRevenueMap)
    .map(([name, data]) => ({ name, revenue: data.revenue, patientCount: data.patientCount.size }))
    .sort((a, b) => b.revenue - a.revenue);

  const paymentMethodBreakdown = Object.entries(paymentMethodsMap).map(([method, data]) => ({
    method,
    total: data.total,
    count: data.count,
  }));

  // Revenue trend (last 6 months dummy/computed sample)
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const revenueTrend = months.map((m, idx) => ({
    month: m,
    revenue: idx === 5 ? monthlyRevenue : 4500 + idx * 800,
    expenses: idx === 5 ? totalExpenses : 2100 + idx * 300,
  }));

  return {
    todayRevenue,
    monthlyRevenue,
    yearlyRevenue,
    outstandingPayments,
    totalExpenses,
    estimatedProfit,
    topTreatments,
    topDoctors,
    paymentMethodBreakdown,
    revenueTrend,
  };
}
