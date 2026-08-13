import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User, Phone, Activity, Smile, Save, Sparkles, Check } from 'lucide-react';
import { patientFormSchema, PatientFormData } from '../../schemas/patientSchema';
import { PatientRecord } from '../../types/patient';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPatient: (data: PatientFormData) => Promise<void>;
  initialData?: PatientRecord | null;
  doctorOptions: string[];
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitPatient,
  initialData,
  doctorOptions,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'contact' | 'medical' | 'dental'>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'Unspecified',
      dob: '1995-01-01',
      age: 31,
      cnic: '',
      maritalStatus: 'Single',
      occupation: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      bloodGroup: 'O+',
      allergies: '',
      medicalHistory: '',
      currentMedication: '',
      chronicDiseases: '',
      smoking: 'Non-Smoker',
      pregnancyStatus: 'N/A',
      notes: '',
      assignedDoctor: doctorOptions[0] || 'Dr. Elena Rostova',
      primaryDentist: 'Dr. Elena Rostova, MD',
      firstVisitDate: new Date().toISOString().split('T')[0],
      preferredTime: 'Morning (9 AM - 12 PM)',
      status: 'Active',
    },
  });

  const dobValue = watch('dob');

  // Auto-calculate age from DOB
  useEffect(() => {
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (!isNaN(calculatedAge) && calculatedAge >= 0) {
        setValue('age', calculatedAge);
      }
    }
  }, [dobValue, setValue]);

  useEffect(() => {
    if (initialData) {
      setValue('firstName', initialData.firstName || '');
      setValue('lastName', initialData.lastName || '');
      setValue('gender', initialData.gender || 'Unspecified');
      setValue('dob', initialData.dob || '1995-01-01');
      setValue('age', initialData.age || 30);
      setValue('cnic', initialData.cnic || '');
      setValue('maritalStatus', initialData.maritalStatus || 'Single');
      setValue('occupation', initialData.occupation || '');
      setValue('phone', initialData.phone || '');
      setValue('whatsapp', initialData.whatsapp || '');
      setValue('email', initialData.email || '');
      setValue('address', initialData.address || '');
      setValue('city', initialData.city || '');
      setValue('postalCode', initialData.postalCode || '');
      setValue('emergencyContact', initialData.emergencyContact || '');
      setValue('emergencyPhone', initialData.emergencyPhone || '');
      setValue('bloodGroup', initialData.bloodGroup || 'O+');
      setValue('allergies', initialData.allergies?.join(', ') || '');
      setValue('medicalHistory', initialData.medicalHistory || '');
      setValue('currentMedication', initialData.currentMedication || '');
      setValue('chronicDiseases', initialData.chronicDiseases?.join(', ') || '');
      setValue('smoking', initialData.smoking || 'Non-Smoker');
      setValue('pregnancyStatus', initialData.pregnancyStatus || 'N/A');
      setValue('notes', initialData.notes || '');
      setValue('assignedDoctor', initialData.assignedDoctor || doctorOptions[0]);
      setValue('primaryDentist', initialData.primaryDentist || 'Dr. Elena Rostova, MD');
      setValue('firstVisitDate', initialData.firstVisitDate || new Date().toISOString().split('T')[0]);
      setValue('preferredTime', initialData.preferredTime || 'Morning (9 AM - 12 PM)');
      setValue('status', initialData.status || 'Active');
    } else {
      reset();
    }
  }, [initialData, setValue, reset, doctorOptions]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmitPatient(data);
      onClose();
    } catch (err) {
      console.error('Form Submit Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-2xl space-y-5 max-h-[90vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-[#1d5bd8]" />
              <span>{isEditMode ? `Edit Record: ${initialData?.fullName}` : 'Register New Patient EHR'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isEditMode ? 'Update patient details and clinical history' : 'Fill multi-section electronic health record questionnaire'}
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFormTab('personal')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeFormTab === 'personal' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#1d5bd8]" />
            <span>1. Personal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('contact')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeFormTab === 'contact' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('medical')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeFormTab === 'medical' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            <span>3. Medical</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('dental')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeFormTab === 'dental' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-indigo-600" />
            <span>4. Dental</span>
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          
          {/* SECTION 1: PERSONAL */}
          {activeFormTab === 'personal' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    placeholder="e.g. Alexander"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
                  />
                  {errors.firstName && <p className="text-rose-600 text-[10px] mt-0.5 font-bold">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    placeholder="e.g. Wright"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
                  />
                  {errors.lastName && <p className="text-rose-600 text-[10px] mt-0.5 font-bold">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unspecified">Unspecified</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    {...register('dob')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calculated Age</label>
                  <input
                    type="number"
                    {...register('age')}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNIC / Govt National ID</label>
                  <input
                    type="text"
                    {...register('cnic')}
                    placeholder="42201-XXXXXXX-X"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marital Status</label>
                  <select
                    {...register('maritalStatus')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    {...register('occupation')}
                    placeholder="e.g. Architect, Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CONTACT */}
          {activeFormTab === 'contact' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Phone Number *</label>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="(555) 234-5678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                  {errors.phone && <p className="text-rose-600 text-[10px] mt-0.5 font-bold">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    {...register('whatsapp')}
                    placeholder="+1 555 234 5678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                  {errors.email && <p className="text-rose-600 text-[10px] mt-0.5 font-bold">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="142 Market Street, Suite 2B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="Beverly Hills"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Postal / Zip Code</label>
                  <input
                    type="text"
                    {...register('postalCode')}
                    placeholder="90210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    {...register('emergencyContact')}
                    placeholder="David Jenkins (Father)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    {...register('emergencyPhone')}
                    placeholder="(555) 999-1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MEDICAL */}
          {activeFormTab === 'medical' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    {...register('bloodGroup')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Smoking Status</label>
                  <select
                    {...register('smoking')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="Non-Smoker">Non-Smoker</option>
                    <option value="Smoker">Smoker</option>
                    <option value="Former Smoker">Former Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pregnancy Status</label>
                  <input
                    type="text"
                    {...register('pregnancyStatus')}
                    placeholder="No / First Trimester / N/A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Allergies (comma separated)</label>
                <input
                  type="text"
                  {...register('allergies')}
                  placeholder="Penicillin Allergy, Latex Sensitivity, Local Anesthetic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chronic Diseases / Conditions</label>
                <input
                  type="text"
                  {...register('chronicDiseases')}
                  placeholder="Hypertension, Diabetes Type 2, Asthma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Medications</label>
                <textarea
                  rows={2}
                  {...register('currentMedication')}
                  placeholder="List active prescriptions and dosages..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">General Medical History & Notes</label>
                <textarea
                  rows={2}
                  {...register('medicalHistory')}
                  placeholder="Surgical history, prior dental procedures, family history..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SECTION 4: DENTAL */}
          {activeFormTab === 'dental' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Doctor *</label>
                  <select
                    {...register('assignedDoctor')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  >
                    {doctorOptions.map((docName) => (
                      <option key={docName} value={docName}>
                        {docName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Dentist / Specialist</label>
                  <input
                    type="text"
                    {...register('primaryDentist')}
                    placeholder="Dr. Elena Rostova, MD"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Visit Date</label>
                  <input
                    type="date"
                    {...register('firstVisitDate')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Visit Slot</label>
                  <select
                    {...register('preferredTime')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</option>
                    <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Record Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Orthodontic / Treatment Notes</label>
                <textarea
                  rows={3}
                  {...register('notes')}
                  placeholder="3D Clear aligner trajectory, bracket preferences, dental anxiety notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* FOOTER BUTTONS */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
              {Object.keys(errors).length > 0 && (
                <span className="text-rose-600">Please fix validation errors to save record</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-extrabold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving Record...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Save Record Updates' : 'Complete Patient Registration'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
