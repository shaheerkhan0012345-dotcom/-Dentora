import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  UserCheck,
  DollarSign,
  Phone,
  Mail,
  Fingerprint,
} from 'lucide-react';
import {
  StaffMember,
  RoleDefinition,
  AttendanceRecord,
  LeaveRequest,
  LeaveStatus,
  StaffRoleType,
  StaffStatus,
} from '../../types/admin';
import {
  subscribeToStaff,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  subscribeToRoles,
  saveRole,
  subscribeToAttendance,
  logAttendanceCheckIn,
  logAttendanceCheckOut,
  subscribeToLeaveRequests,
  submitLeaveRequest,
  updateLeaveRequestStatus,
} from '../../services/staffService';
import { StaffProfileModal } from './StaffProfileModal';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleEditorModal } from './RoleEditorModal';
import { AttendanceCalendar } from './AttendanceCalendar';
import { LeaveRequestTable } from './LeaveRequestTable';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface StaffTableProps {
  currentUserRole?: string;
  currentUserName?: string;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  currentUserRole = 'Admin',
  currentUserName = 'Dr. Elena Rostova',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'roles' | 'attendance' | 'leaves'>('directory');

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    const unsubStaff = subscribeToStaff(setStaffList);
    const unsubRoles = subscribeToRoles(setRoles);
    const unsubAtt = subscribeToAttendance(setAttendance);
    const unsubLeaves = subscribeToLeaveRequests(setLeaves);

    return () => {
      unsubStaff();
      unsubRoles();
      unsubAtt();
      unsubLeaves();
    };
  }, []);

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStaff) {
      await updateStaffMember(editingStaff.id, staffData, currentUserName);
    } else {
      await addStaffMember(staffData, currentUserName);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      await deleteStaffMember(id, currentUserName);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const canSeeSalary = currentUserRole === 'Admin' || currentUserRole === 'Accountant';

  return (
    <div className="space-y-6">
      {/* SUB-TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-[#1d5bd8]" />
            <span>Staff Directory ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'roles'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Roles & Permissions (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'attendance'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Attendance & Biometrics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'leaves'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Leave Requests</span>
          </button>
        </div>

        {activeSubTab === 'directory' && (
          <button
            onClick={handleOpenAddStaff}
            className="px-4 py-2 bg-[#1d5bd8] hover:bg-[#154dbf] text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: STAFF DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name, ID, or designation..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#1d5bd8]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Dental Assistant">Dental Assistant</option>
                <option value="Accountant">Accountant</option>
                <option value="Inventory Manager">Inventory Manager</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* STAFF GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={staff.fullName} size="lg" status={staff.status === 'Active' ? 'online' : 'offline'} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-slate-900 leading-tight">{staff.fullName}</h3>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{staff.employeeId}</span>
                        </div>
                        <span className="text-xs text-[#1d5bd8] font-extrabold block mt-0.5">{staff.designation}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">{staff.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="p-1.5 text-slate-400 hover:text-[#1d5bd8] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Phone:</span>
                      </span>
                      <span className="font-semibold">{staff.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email:</span>
                      </span>
                      <span className="font-semibold text-[11px] truncate max-w-[160px]">{staff.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Working Hours:</span>
                      </span>
                      <span className="font-bold text-slate-800">{staff.workingHours}</span>
                    </div>

                    {canSeeSalary && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-900">
                        <span className="font-extrabold text-amber-800 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                          <span>Monthly Salary:</span>
                        </span>
                        <span className="font-black text-amber-900">Rs. {staff.salary.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Badge
                    variant={
                      staff.status === 'Active'
                        ? 'emerald'
                        : staff.status === 'On Leave'
                        ? 'amber'
                        : 'rose'
                    }
                    size="sm"
                  >
                    {staff.status}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Role: {staff.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ROLES & PERMISSIONS */}
      {activeSubTab === 'roles' && (
        <PermissionMatrix
          roles={roles}
          onSaveRole={async (r) => {
            await saveRole(r, currentUserName);
          }}
          onAddNewRoleClick={() => setIsRoleModalOpen(true)}
        />
      )}

      {/* SUB-TAB 3: ATTENDANCE & BIOMETRICS */}
      {activeSubTab === 'attendance' && (
        <AttendanceCalendar
          attendanceRecords={attendance}
          staffList={staffList}
          onCheckIn={async (staffId, staffName, staffRole) => {
            await logAttendanceCheckIn(staffId, staffName, staffRole, currentUserName);
          }}
          onCheckOut={async (attId) => {
            await logAttendanceCheckOut(attId, currentUserName);
          }}
        />
      )}

      {/* SUB-TAB 4: LEAVE REQUESTS */}
      {activeSubTab === 'leaves' && (
        <LeaveRequestTable
          leaveRequests={leaves}
          staffList={staffList}
          onSubmitRequest={async (req) => {
            await submitLeaveRequest(req, currentUserName);
          }}
          onUpdateStatus={async (id, status, appBy, reason) => {
            await updateLeaveRequestStatus(id, status, appBy, reason);
          }}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
        />
      )}

      {/* MODALS */}
      <StaffProfileModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staff={editingStaff}
        onSave={handleSaveStaff}
        currentUserRole={currentUserRole}
      />

      <RoleEditorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSaveRole={async (r) => {
          await saveRole(r, currentUserName);
        }}
      />
    </div>
  );
};
