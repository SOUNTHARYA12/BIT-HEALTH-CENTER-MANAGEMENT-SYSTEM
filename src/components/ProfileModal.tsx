import React, { useState, useEffect } from 'react';
import { User, Role, Doctor } from '../types';
import { fetchUsersDirectory, updateUserProfile, fetchDoctors, updateDoctorStatus } from '../services/api';
import {
  User as UserIcon,
  Shield,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Home,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  Lock,
  Search,
  Users,
  Edit3,
  Save,
  X,
  Stethoscope,
  Pill,
  Activity,
  QrCode,
  Calendar,
  Sparkles,
  Award,
  Clock,
  DoorOpen,
  Briefcase
} from 'lucide-react';

interface ProfileModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isDoctor = currentUser.role === 'doctor';
  const isStudent = currentUser.role === 'student';
  const isPharmacist = currentUser.role === 'pharmacist';

  // Active view: 'my_profile' for all users, or 'all_profiles' for Admin only
  const [activeTab, setActiveTab] = useState<'my_profile' | 'all_profiles'>('my_profile');

  // Doctor schedule & profile lookup
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
        .then(docs => setDoctorsList(docs))
        .catch(err => console.error('Error fetching doctors:', err));
    }
  }, [isOpen]);

  const matchingDoctor = isDoctor
    ? doctorsList.find(
        d =>
          d.id === currentUser.username ||
          d.name.toLowerCase() === currentUser.name?.toLowerCase() ||
          d.id === currentUser.id ||
          d.id === currentUser.rollNumber
      )
    : null;

  // Edit mode for own profile
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editHostel, setEditHostel] = useState(currentUser.hostelBlock || '');
  const [editBloodGroup, setEditBloodGroup] = useState(currentUser.bloodGroup || 'B+ve');
  const [editEmergencyContact, setEditEmergencyContact] = useState(currentUser.emergencyContact || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(currentUser.emergencyPhone || '');
  const [editAllergies, setEditAllergies] = useState(currentUser.allergies || '');
  const [editGender, setEditGender] = useState(currentUser.gender || 'female');

  // Doctor specific editable fields
  const [editRoomNo, setEditRoomNo] = useState(currentUser.roomNo || '');
  const [editQualification, setEditQualification] = useState(currentUser.qualification || '');
  const [editSpecialization, setEditSpecialization] = useState(currentUser.specialization || '');
  const [editDoctorStatus, setEditDoctorStatus] = useState<Doctor['currentStatus']>('available');

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Admin User Directory State
  const [directoryUsers, setDirectoryUsers] = useState<User[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUserForAdmin, setSelectedUserForAdmin] = useState<User | null>(null);

  // Sync edit state when currentUser or matchingDoctor changes
  useEffect(() => {
    setEditPhone(currentUser.phone || '');
    setEditHostel(currentUser.hostelBlock || '');
    setEditBloodGroup(currentUser.bloodGroup || 'B+ve');
    setEditEmergencyContact(currentUser.emergencyContact || '');
    setEditEmergencyPhone(currentUser.emergencyPhone || '');
    setEditAllergies(currentUser.allergies || '');
    setEditGender(currentUser.gender || 'female');
    setEditRoomNo(currentUser.roomNo || matchingDoctor?.roomNo || 'Room 101 (Main Clinic)');
    setEditQualification(currentUser.qualification || matchingDoctor?.qualification || 'MBBS, MD (General Medicine)');
    setEditSpecialization(currentUser.specialization || matchingDoctor?.specialization || 'General Medicine');
    setEditDoctorStatus(matchingDoctor?.currentStatus || 'available');
  }, [currentUser, matchingDoctor]);

  // Load directory if admin visits 'all_profiles' tab
  useEffect(() => {
    if (isAdmin && activeTab === 'all_profiles' && isOpen) {
      setLoadingDirectory(true);
      fetchUsersDirectory({
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: searchQuery || undefined
      })
        .then(res => {
          setDirectoryUsers(res.users);
          setLoadingDirectory(false);
        })
        .catch(err => {
          console.error('Error fetching directory:', err);
          setErrorMessage(err.message || 'Failed to load directory');
          setLoadingDirectory(false);
        });
    }
  }, [isAdmin, activeTab, isOpen, roleFilter, searchQuery]);

  if (!isOpen) return null;

  const handleSaveOwnProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updateData: any = isDoctor
        ? {
            phone: editPhone,
            roomNo: editRoomNo,
            qualification: editQualification,
            specialization: editSpecialization
          }
        : {
            phone: editPhone,
            hostelBlock: editHostel,
            bloodGroup: editBloodGroup,
            emergencyContact: editEmergencyContact,
            emergencyPhone: editEmergencyPhone,
            allergies: editAllergies,
            gender: editGender
          };

      const result = await updateUserProfile(currentUser.id, updateData);

      // If doctor updated their duty status, update doctor status in DB
      if (isDoctor && matchingDoctor && editDoctorStatus !== matchingDoctor.currentStatus) {
        try {
          const updatedDoc = await updateDoctorStatus(matchingDoctor.id, editDoctorStatus);
          setDoctorsList(prev => prev.map(d => (d.id === updatedDoc.id ? updatedDoc : d)));
        } catch (statusErr) {
          console.warn('Doctor status sync error:', statusErr);
        }
      }

      setSuccessMessage('Your profile information was updated successfully.');
      setIsEditing(false);
      setIsSaving(false);
      if (onProfileUpdated) {
        onProfileUpdated(result.user);
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
      setIsSaving(false);
    }
  };

  const getDoctorConsultationHours = (doc: Doctor | null | undefined): string => {
    if (!doc) {
      return 'Not configured';
    }
    if (doc.timeSlots && doc.timeSlots.length > 0) {
      const start = doc.timeSlots[0];
      const end = doc.timeSlots[doc.timeSlots.length - 1];
      let days = '';
      if (doc.availableDays && doc.availableDays.length > 0) {
        if (
          doc.availableDays.length >= 5 &&
          doc.availableDays.includes('Mon') &&
          doc.availableDays.includes('Fri')
        ) {
          days = doc.availableDays.includes('Sat') ? ' (Mon – Sat)' : ' (Mon – Fri)';
        } else {
          days = ` (${doc.availableDays.join(', ')})`;
        }
      }
      return `${start} – ${end}${days}`;
    }
    return 'Not configured';
  };

  const getDoctorStatusInfo = (status?: Doctor['currentStatus']) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500 animate-pulse'
        };
      case 'in_consultation':
        return {
          label: 'In Consultation',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500'
        };
      case 'on_break':
        return {
          label: 'On Break',
          badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
          dotClass: 'bg-orange-500'
        };
      case 'offline':
        return {
          label: 'Not Available',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500'
        };
      default:
        return {
          label: 'Available',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500 animate-pulse'
        };
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Campus Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="bg-blue-50 text-[#3478F6] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
            <Stethoscope className="w-3 h-3" /> Medical Officer
          </span>
        );
      case 'pharmacist':
        return (
          <span className="bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
            <Pill className="w-3 h-3" /> Pharmacy Staff
          </span>
        );
      case 'student':
      default:
        return (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <UserIcon className="w-3 h-3" /> BIT Student
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-[#1E3A8A] to-[#2563EB] text-white p-6 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold shadow-md">
              <ShieldCheck className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  {isAdmin
                    ? 'Health Profile & Campus Directory'
                    : isDoctor
                    ? 'Medical Officer Profile'
                    : isPharmacist
                    ? 'Campus Pharmacy Staff Profile'
                    : 'My Campus Medical Profile'}
                </h2>
                {getRoleBadge(currentUser.role)}
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                {isAdmin
                  ? 'Administrator Access: Full records directory'
                  : isDoctor
                  ? 'Official BIT Medical Staff & Clinical Credential Record'
                  : 'Official BIT Student Health Center Record'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Tabs */}
        {isAdmin && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center space-x-3">
            <button
              onClick={() => { setActiveTab('my_profile'); setSelectedUserForAdmin(null); }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'my_profile'
                  ? 'bg-[#3478F6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>My Admin Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('all_profiles')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all_profiles'
                  ? 'bg-[#3478F6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Campus Directory ({directoryUsers.length || 'All'})</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: MY PROFILE */}
          {activeTab === 'my_profile' && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#3478F6] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
                      {getRoleBadge(currentUser.role)}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <span className="font-mono font-bold text-[#3478F6]">{currentUser.rollNumber || currentUser.username}</span>
                      {currentUser.department && ` • ${currentUser.department}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Official Email: <span className="text-slate-700 font-medium">{currentUser.email}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEditing
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-blue-50 text-[#3478F6] border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Contact Info'}</span>
                </button>
              </div>

              {/* Edit Mode */}
              {isEditing ? (
                <form onSubmit={handleSaveOwnProfile} className="bg-white border border-blue-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold text-[#3478F6] uppercase tracking-wider flex items-center">
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      {isDoctor ? 'Update Professional & Contact Information' : 'Update Contact & Emergency Health Data'}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isDoctor ? 'Medical Officer Profile' : 'Student Medical File'}
                    </span>
                  </div>

                  {isDoctor ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Official Contact Phone Number</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          placeholder="e.g. +91 94433 12345"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Consultation Room</label>
                        <input
                          type="text"
                          value={editRoomNo}
                          onChange={e => setEditRoomNo(e.target.value)}
                          placeholder="e.g. Room 101 (Main Clinic)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Specialization</label>
                        <input
                          type="text"
                          value={editSpecialization}
                          onChange={e => setEditSpecialization(e.target.value)}
                          placeholder="e.g. General Medicine"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Qualification</label>
                        <input
                          type="text"
                          value={editQualification}
                          onChange={e => setEditQualification(e.target.value)}
                          placeholder="e.g. MBBS, MD (General Medicine)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 font-semibold mb-1">Consultation Availability Status</label>
                        <select
                          value={editDoctorStatus}
                          onChange={e => setEditDoctorStatus(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                        >
                          <option value="available">Available</option>
                          <option value="in_consultation">In Consultation</option>
                          <option value="on_break">On Break</option>
                          <option value="offline">Not Available</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Mobile Phone Number</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Hostel Block / Residence / Room</label>
                        <input
                          type="text"
                          value={editHostel}
                          onChange={e => setEditHostel(e.target.value)}
                          placeholder="e.g. Thamarai Hostel - Block A (Room 204)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                        <select
                          value={editBloodGroup}
                          onChange={e => setEditBloodGroup(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                        >
                          {['A+ve', 'A-ve', 'B+ve', 'B-ve', 'O+ve', 'O-ve', 'AB+ve', 'AB-ve'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                        <select
                          value={editGender}
                          onChange={e => setEditGender(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Person & Relation</label>
                        <input
                          type="text"
                          value={editEmergencyContact}
                          onChange={e => setEditEmergencyContact(e.target.value)}
                          placeholder="e.g. Mr. Muthusamy (Father)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Emergency Phone Number</label>
                        <input
                          type="text"
                          value={editEmergencyPhone}
                          onChange={e => setEditEmergencyPhone(e.target.value)}
                          placeholder="e.g. 9443198765"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 font-semibold mb-1">Known Drug Allergies / Conditions</label>
                        <input
                          type="text"
                          value={editAllergies}
                          onChange={e => setEditAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Sulfa drugs, Dust, None"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 bg-[#3478F6] hover:bg-blue-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : isDoctor ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campus & Contact Details */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1.5 text-[#3478F6]" />
                      Campus & Contact Details
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Staff ID:</span>
                        <span className="font-mono font-bold text-slate-900">{currentUser.rollNumber || currentUser.username}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{currentUser.department || 'General Medicine'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Official Email:</span>
                        <span className="font-medium text-slate-800">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Contact Number:</span>
                        <span className="font-semibold text-slate-900">{currentUser.phone || 'Not configured'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Consultation Room:</span>
                        <span className="font-medium text-slate-800">{currentUser.roomNo || matchingDoctor?.roomNo || 'Room 101'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-[#3478F6]" />
                      Professional Information
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Specialization:</span>
                        <span className="font-semibold text-slate-900">
                          {currentUser.specialization || matchingDoctor?.specialization || 'General Medicine'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Qualification:</span>
                        <span className="font-semibold text-slate-900">
                          {currentUser.qualification || matchingDoctor?.qualification || 'Not configured'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Consultation Hours:</span>
                        <span className="font-medium text-slate-800">
                          {getDoctorConsultationHours(matchingDoctor)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Availability:</span>
                        {(() => {
                          const statusInfo = getDoctorStatusInfo(matchingDoctor?.currentStatus);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></span>
                              {statusInfo.label}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Consultation Room:</span>
                        <span className="font-semibold text-slate-900">
                          {currentUser.roomNo || matchingDoctor?.roomNo || 'Room 101'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal & Campus Details */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1.5 text-[#3478F6]" />
                      Campus & Contact Details
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Roll No / Staff ID:</span>
                        <span className="font-mono font-bold text-slate-900">{currentUser.rollNumber || currentUser.username}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{currentUser.department || 'General Campus'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-medium text-slate-800">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Contact Phone:</span>
                        <span className="font-semibold text-slate-900">{currentUser.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Hostel / Location:</span>
                        <span className="font-medium text-slate-800">{currentUser.hostelBlock || currentUser.roomNo || 'BIT Campus'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical & Emergency Profile */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <HeartPulse className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                      Emergency & Clinical Details
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Blood Group:</span>
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {currentUser.bloodGroup || 'B+ve'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Emergency Contact:</span>
                        <span className="font-medium text-slate-900">{currentUser.emergencyContact || 'Campus Warden / HOD'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Emergency Phone:</span>
                        <span className="font-mono font-bold text-slate-900">{currentUser.emergencyPhone || 'Ext 108'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Known Allergies:</span>
                        <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {currentUser.allergies || 'None reported'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital BIT Health Smart Card */}
              <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3478F6] text-white rounded-3xl p-6 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] tracking-widest uppercase font-extrabold text-blue-200">
                        BIT Student Health Center
                      </span>
                      <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {isDoctor ? 'Clinical Duty Pass' : 'Digital Health Pass'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1.5">{currentUser.name}</h3>
                    <p className="text-xs text-blue-100">
                      ID: <span className="font-mono font-bold text-white">{currentUser.rollNumber || currentUser.username}</span> • {currentUser.department || 'BIT Campus'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
                    <QrCode className="w-10 h-10 text-white" />
                    <div className="text-[10px] text-blue-100">
                      <div className="font-bold text-white">{isDoctor ? 'Medical Officer' : 'OPD Verified'}</div>
                      <div>{isDoctor ? 'Duty Verified' : 'Scan at Counter'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN DIRECTORY */}
          {isAdmin && activeTab === 'all_profiles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, roll no, email..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Role:</label>
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3478F6]"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="doctor">Doctors</option>
                    <option value="pharmacist">Pharmacists</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              {/* Directory Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User & ID</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {directoryUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="font-mono text-[11px] text-[#3478F6]">{u.rollNumber || u.username}</div>
                        </td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                        <td className="p-3 text-slate-600">{u.department || 'Campus'}</td>
                        <td className="p-3 text-slate-600">{u.phone || u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#3478F6]" />
            <span>BIT Health Information Security & Privacy Compliance</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
