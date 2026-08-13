import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Filter,
  Download,
  LayoutGrid,
  List,
  RefreshCcw,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { PatientRecord, PatientFilterOptions, PatientSortOption } from '../../../types/patient';
import { UserRole } from '../../../types/user';
import {
  subscribeToPatients,
  createPatient,
  updatePatient,
  softDeletePatient,
  initialSeedPatients
} from '../../../services/patientService';
import { PatientSearch } from '../../patients/PatientSearch';
import { PatientFilters } from '../../patients/PatientFilters';
import { PatientTable } from '../../patients/PatientTable';
import { PatientCard } from '../../patients/PatientCard';
import { PatientSkeleton } from '../../patients/PatientSkeleton';
import { PatientEmptyState } from '../../patients/PatientEmptyState';
import { PatientFormModal } from '../../patients/PatientFormModal';
import { PatientProfile } from '../../patients/PatientProfile';
import { PatientFormData } from '../../../schemas/patientSchema';

interface PatientsTabProps {
  userRole?: UserRole;
  userName?: string;
}

const defaultFilters: PatientFilterOptions = {
  gender: 'All',
  doctor: 'All',
  status: 'Active', // Default hides Archived unless explicitly changed
  bloodGroup: 'All',
  minAge: null,
  maxAge: null,
  regDateFrom: '',
  regDateTo: '',
};

export const PatientsTab: React.FC<PatientsTabProps> = ({
  userRole = 'Admin',
  userName = 'Dr. Elena Rostova',
}) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PatientFilterOptions>(defaultFilters);
  const [sortOption, setSortOption] = useState<PatientSortOption>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeProfilePatient, setActiveProfilePatient] = useState<PatientRecord | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);

  // Doctors list for filter dropdown
  const doctorOptions = useMemo(() => {
    const set = new Set<string>();
    set.add('Dr. Elena Rostova');
    set.add('Dr. Marcus Vance');
    patients.forEach((p) => {
      if (p.assignedDoctor) set.add(p.assignedDoctor);
    });
    return Array.from(set);
  }, [patients]);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPatients((list) => {
      setPatients(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter and sort patients
  const processedPatients = useMemo(() => {
    return patients
      .filter((p) => {
        // Status filter
        if (filters.status !== 'All' && p.status !== filters.status) return false;

        // Gender filter
        if (filters.gender !== 'All' && p.gender !== filters.gender) return false;

        // Doctor filter
        if (filters.doctor !== 'All' && p.assignedDoctor !== filters.doctor) return false;

        // Blood Group
        if (filters.bloodGroup !== 'All' && p.bloodGroup !== filters.bloodGroup) return false;

        // Age filter
        if (filters.minAge !== null && p.age < filters.minAge) return false;
        if (filters.maxAge !== null && p.age > filters.maxAge) return false;

        // Search text matching: Name, Patient ID, Phone, CNIC, Email
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.fullName.toLowerCase().includes(q);
          const matchId = p.patientId.toLowerCase().includes(q);
          const matchPhone = p.phone.includes(q);
          const matchCnic = p.cnic?.toLowerCase().includes(q) || false;
          const matchEmail = p.email.toLowerCase().includes(q);

          if (!matchName && !matchId && !matchPhone && !matchCnic && !matchEmail) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'alphabetical') {
          return a.fullName.localeCompare(b.fullName);
        }
        if (sortOption === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOption === 'lastVisit') {
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        }
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [patients, search, filters, sortOption]);

  // Handle Form Submission (Create or Edit)
  const handleSavePatient = async (data: PatientFormData) => {
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const allergiesArray = data.allergies
      ? data.allergies.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const chronicArray = data.chronicDiseases
      ? data.chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (editingPatient) {
      // Edit mode
      await updatePatient(editingPatient.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        gender: data.gender,
        dob: data.dob,
        age: data.age,
        cnic: data.cnic,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        bloodGroup: data.bloodGroup,
        allergies: allergiesArray,
        medicalHistory: data.medicalHistory,
        currentMedication: data.currentMedication,
        chronicDiseases: chronicArray,
        smoking: data.smoking,
        pregnancyStatus: data.pregnancyStatus,
        notes: data.notes,
        assignedDoctor: data.assignedDoctor,
        primaryDentist: data.primaryDentist,
        firstVisitDate: data.firstVisitDate,
        preferredTime: data.preferredTime,
        status: data.status,
      });

      // Update active profile if open
      if (activeProfilePatient && activeProfilePatient.id === editingPatient.id) {
        setActiveProfilePatient({
          ...activeProfilePatient,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName,
          phone: data.phone,
          email: data.email,
          assignedDoctor: data.assignedDoctor,
          status: data.status,
          allergies: allergiesArray,
        });
      }
    } else {
      // Create mode
      const nextIdNum = 8800 + Math.floor(Math.random() * 1000);
      const patientId = `PT-${nextIdNum}`;

      await createPatient({
        patientId,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        gender: data.gender,
        dob: data.dob,
        age: data.age,
        cnic: data.cnic,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        bloodGroup: data.bloodGroup,
        allergies: allergiesArray,
        medicalHistory: data.medicalHistory,
        currentMedication: data.currentMedication,
        chronicDiseases: chronicArray,
        smoking: data.smoking,
        pregnancyStatus: data.pregnancyStatus,
        notes: data.notes,
        assignedDoctor: data.assignedDoctor,
        primaryDentist: data.primaryDentist,
        firstVisitDate: data.firstVisitDate || new Date().toISOString().split('T')[0],
        lastVisit: 'Today',
        nextAppointment: 'Unscheduled',
        preferredTime: data.preferredTime,
        status: data.status,
        balance: 0,
        totalVisits: 1,
      });
    }

    setEditingPatient(null);
  };

  // Handle Soft Delete
  const handleSoftDelete = async (p: PatientRecord) => {
    if (confirm(`Are you sure you want to soft delete (archive) patient ${p.fullName} (#${p.patientId})?`)) {
      await softDeletePatient(p.id, p.fullName);
      if (activeProfilePatient?.id === p.id) {
        setActiveProfilePatient(null);
      }
    }
  };

  // Bulk Archive
  const handleBulkArchive = async () => {
    if (confirm(`Archive ${selectedIds.length} selected patient records?`)) {
      for (const id of selectedIds) {
        const item = patients.find((p) => p.id === id);
        if (item) {
          await softDeletePatient(item.id, item.fullName);
        }
      }
      setSelectedIds([]);
    }
  };

  // Export CSV
  const handleExportCSV = (listToExport?: PatientRecord[]) => {
    const data = listToExport || processedPatients;
    if (data.length === 0) return;

    const headers = [
      'Patient ID',
      'Full Name',
      'Gender',
      'Age',
      'Phone',
      'Email',
      'Assigned Doctor',
      'Status',
      'Last Visit',
      'Balance',
      'Blood Group',
      'Allergies'
    ];

    const rows = data.map((p) => [
      `"${p.patientId}"`,
      `"${p.fullName}"`,
      `"${p.gender}"`,
      `"${p.age}"`,
      `"${p.phone}"`,
      `"${p.email}"`,
      `"${p.assignedDoctor}"`,
      `"${p.status}"`,
      `"${p.lastVisit || ''}"`,
      `"${p.balance}"`,
      `"${p.bloodGroup || ''}"`,
      `"${(p.allergies || []).join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dentora_Patient_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === processedPatients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedPatients.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const canCreateOrEdit = userRole === 'Admin' || userRole === 'Receptionist';

  // RENDER DETAILED PROFILE VIEW IF A PATIENT IS SELECTED
  if (activeProfilePatient) {
    return (
      <PatientProfile
        patient={activeProfilePatient}
        onBack={() => setActiveProfilePatient(null)}
        onEditPatient={(pt) => {
          setEditingPatient(pt);
          setIsFormModalOpen(true);
        }}
        userRole={userRole}
        userName={userName}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER & MAIN ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1d5bd8]" />
            <span>Patient Electronic Health Records Directory</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage <strong className="text-slate-900">{patients.length}</strong> registered patient health profiles, dental charts, and documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1d5bd8]" />
            <span className="hidden sm:inline">Export Directory CSV</span>
          </button>

          {canCreateOrEdit && (
            <button
              onClick={() => {
                setEditingPatient(null);
                setIsFormModalOpen(true);
              }}
              className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <PatientSearch
        value={search}
        onChange={setSearch}
        totalResults={processedPatients.length}
      />

      {/* FILTER & VIEW CONTROLS TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-[#1d5bd8] font-black'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as PatientSortOption)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
            >
              <option value="newest">Newest Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
              <option value="lastVisit">Recent Visit Date</option>
            </select>
          </div>
        </div>

        {/* VIEW MODE TOGGLE (TABLE vs CARDS) */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* EXPANDABLE ADVANCED FILTERS PANEL */}
      {showFilters && (
        <PatientFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
          doctorOptions={doctorOptions}
        />
      )}

      {/* DIRECTORY DISPLAY AREA */}
      {loading ? (
        <PatientSkeleton />
      ) : processedPatients.length === 0 ? (
        <PatientEmptyState
          onAddPatient={canCreateOrEdit ? () => setIsFormModalOpen(true) : undefined}
          onResetFilters={() => {
            setSearch('');
            setFilters(defaultFilters);
          }}
          isFiltered={search !== '' || filters.status !== 'Active' || filters.gender !== 'All' || filters.doctor !== 'All'}
        />
      ) : viewMode === 'table' ? (
        <PatientTable
          patients={processedPatients}
          onViewProfile={setActiveProfilePatient}
          onEditPatient={(pt) => {
            setEditingPatient(pt);
            setIsFormModalOpen(true);
          }}
          onSoftDeletePatient={handleSoftDelete}
          userRole={userRole}
          sortOption={sortOption}
          onSortChange={setSortOption}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onBulkArchive={handleBulkArchive}
          onExportCSV={handleExportCSV}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onViewProfile={setActiveProfilePatient}
              onEdit={(pt) => {
                setEditingPatient(pt);
                setIsFormModalOpen(true);
              }}
              onSoftDelete={handleSoftDelete}
              userRole={userRole}
              isSelected={selectedIds.includes(patient.id)}
              onSelectToggle={() => handleToggleSelectOne(patient.id)}
            />
          ))}
        </div>
      )}

      {/* ADD / EDIT PATIENT FORM MODAL */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPatient(null);
        }}
        onSubmitPatient={handleSavePatient}
        initialData={editingPatient}
        doctorOptions={doctorOptions}
      />

    </div>
  );
};
