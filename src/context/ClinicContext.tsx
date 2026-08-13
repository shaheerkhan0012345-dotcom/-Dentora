import React, { createContext, useContext, useEffect, useState } from 'react';
import { Clinic } from '../types/clinic';
import { DEFAULT_CLINICS, subscribeToClinics, createClinic, updateClinic, setClinicStatus } from '../services/clinicService';

interface ClinicContextType {
  currentClinic: Clinic;
  clinics: Clinic[];
  loading: boolean;
  setCurrentClinic: (clinic: Clinic) => void;
  switchClinicById: (id: string) => void;
  handleCreateClinic: (data: Omit<Clinic, 'id' | 'createdDate'>, performedBy: string) => Promise<void>;
  handleUpdateClinic: (id: string, data: Partial<Clinic>, performedBy: string) => Promise<void>;
  handleSetClinicStatus: (id: string, status: Clinic['status'], performedBy: string) => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clinics, setClinics] = useState<Clinic[]>(DEFAULT_CLINICS);
  const [currentClinic, setCurrentClinic] = useState<Clinic>(DEFAULT_CLINICS[0]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToClinics((updatedClinics) => {
      setClinics(updatedClinics);
      if (updatedClinics.length > 0) {
        // Keep current clinic updated if modified in state
        setCurrentClinic((prev) => {
          const matched = updatedClinics.find((c) => c.id === prev.id);
          return matched || updatedClinics[0];
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchClinicById = (id: string) => {
    const matched = clinics.find((c) => c.id === id);
    if (matched) {
      setCurrentClinic(matched);
    }
  };

  const handleCreateClinic = async (data: Omit<Clinic, 'id' | 'createdDate'>, performedBy: string) => {
    const newC = await createClinic(data, performedBy);
    setCurrentClinic(newC);
  };

  const handleUpdateClinic = async (id: string, data: Partial<Clinic>, performedBy: string) => {
    await updateClinic(id, data, performedBy);
  };

  const handleSetClinicStatus = async (id: string, status: Clinic['status'], performedBy: string) => {
    await setClinicStatus(id, status, performedBy);
  };

  return (
    <ClinicContext.Provider
      value={{
        currentClinic,
        clinics,
        loading,
        setCurrentClinic,
        switchClinicById,
        handleCreateClinic,
        handleUpdateClinic,
        handleSetClinicStatus,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
