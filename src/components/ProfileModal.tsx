import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { fetchUsersDirectory, fetchUserProfile, updateUserProfile } from '../services/api';
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
  Sparkles
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

  // Active view: 'my_profile' for all users, or 'all_profiles' for Admin only
  const [activeTab, setActiveTab] = useState<'my_profile' | 'all_profiles'>('my_profile');

  // Edit mode for own profile
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editHostel, setEditHostel] = useState(currentUser.hostelBlock || '');
  const [editBloodGroup, setEditBloodGroup] = useState(currentUser.bloodGroup || 'B+ve');
  const [editEmergencyContact, setEditEmergencyContact] = useState(currentUser.emergencyContact || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(currentUser.emergencyPhone || '');
  const [editAllergies, setEditAllergies] = useState(currentUser.allergies || '');
  const [editGender, setEditGender] = useState(currentUser.gender || 'female');

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

  // Sync edit state when currentUser changes
  useEffect(() => {
    setEditPhone(currentUser.phone || '');
    setEditHostel(currentUser.hostelBlock || '');
    setEditBloodGroup(currentUser.bloodGroup || 'B+ve');
    setEditEmergencyContact(currentUser.emergencyContact || '');
    setEditEmergencyPhone(currentUser.emergencyPhone || '');
    setEditAllergies(currentUser.allergies || '');
    setEditGender(currentUser.gender || 'female');
  }, [currentUser]);

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
      const result = await updateUserProfile(currentUser.id, {
        phone: editPhone,
        hostelBlock: editHostel,
        bloodGroup: editBloodGroup,
        emergencyContact: editEmergencyContact,
        emergencyPhone: editEmergencyPhone,
        allergies: editAllergies,
        gender: editGender
      });

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

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Campus Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-300 flex items-center gap-1">
            <Stethoscope className="w-3 h-3" /> Medical Officer
          </span>
        );
      case 'pharmacist':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-300 flex items-center gap-1">
            <Pill className="w-3 h-3" /> Pharmacy Staff
          </span>
        );
      case 'student':
      default:
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
            <UserIcon className="w-3 h-3" /> BIT Student
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-teal-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  {isAdmin ? 'BIT Health Center Profile & Directory' : 'My Health Center Profile'}
                </h2>
                {getRoleBadge(currentUser.role)}
              </div>
              <p className="text-xs text-slate-300">
                {isAdmin
                  ? 'Administrator Access: Full permission to view all campus patient and staff records'
                  : 'Confidential Medical Record: Only accessible by you and authorized medical officers'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection (Only Admin can toggle between 'My Profile' and 'All Profiles') */}
        {isAdmin && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center space-x-3">
            <button
              onClick={() => { setActiveTab('my_profile'); setSelectedUserForAdmin(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'my_profile'
                  ? 'bg-white text-teal-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>My Admin Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('all_profiles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'all_profiles'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Campus Profiles Directory ({directoryUsers.length || 'All'})</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-1">
                Admin Only
              </span>
            </button>
          </div>
        )}

        {/* Non-Admin Privacy Banner */}
        {!isAdmin && (
          <div className="bg-emerald-50/80 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold">Privacy Protected:</span>
              <span className="text-emerald-800">You are viewing your private record ({currentUser.rollNumber || currentUser.username}). Other users cannot view your profile.</span>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
              BIT HIPAA/DISHA
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: MY PROFILE */}
          {activeTab === 'my_profile' && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
                      {getRoleBadge(currentUser.role)}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <span className="font-mono font-semibold text-teal-800">{currentUser.rollNumber || currentUser.username}</span>
                      {currentUser.department && ` • ${currentUser.department}`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Official Institutional Email: <span className="text-slate-700 font-medium">{currentUser.email}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isEditing
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Contact Info'}</span>
                </button>
              </div>

              {/* View or Edit Form */}
              {isEditing ? (
                <form onSubmit={handleSaveOwnProfile} className="bg-white border border-teal-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center">
                    <Edit3 className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                    Update Contact & Emergency Health Data
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Mobile Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
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
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                      <select
                        value={editBloodGroup}
                        onChange={e => setEditBloodGroup(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
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
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
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
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Emergency Phone Number</label>
                      <input
                        type="text"
                        value={editEmergencyPhone}
                        onChange={e => setEditEmergencyPhone(e.target.value)}
                        placeholder="e.g. 9443198765"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1">Known Drug Allergies / Medical Conditions</label>
                      <input
                        type="text"
                        value={editAllergies}
                        onChange={e => setEditAllergies(e.target.value)}
                        placeholder="e.g. Penicillin, Sulfa drugs, Asthma, None"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal & Campus Details */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                      Campus & Contact Details
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Roll No / Staff ID:</span>
                        <span className="font-mono font-bold text-slate-900">{currentUser.rollNumber || currentUser.username}</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Department / Unit:</span>
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
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <HeartPulse className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                      Emergency & Clinical Details
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Blood Group:</span>
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
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

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Known Allergies:</span>
                        <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {currentUser.allergies || 'None reported'}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Registered Date:</span>
                        <span className="font-medium text-slate-700">{currentUser.joinedDate || '2023-08-16'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital BIT Health Smart Card */}
              <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-teal-800/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] tracking-widest uppercase font-extrabold text-teal-400">
                        BIT Student Health Center
                      </span>
                      <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.2 rounded border border-teal-500/30">
                        Official Digital Pass
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{currentUser.name}</h3>
                    <p className="text-xs text-slate-300">
                      ID: <span className="font-mono font-bold text-teal-300">{currentUser.rollNumber || currentUser.username}</span> • {currentUser.department || 'BIT Campus'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/10 p-2.5 rounded-xl border border-white/15 backdrop-blur-sm">
                    <QrCode className="w-10 h-10 text-teal-300" />
                    <div className="text-[10px] text-slate-300">
                      <div className="font-bold text-white">OPD Verified</div>
                      <div>Scan at Counter</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN ALL PROFILES DIRECTORY (Only accessible to role: admin) */}
          {isAdmin && activeTab === 'all_profiles' && (
            <div className="space-y-4">
              {/* Directory Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, roll no, email..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Filter Role:</label>
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="all">All Campus Roles</option>
                    <option value="student">Students</option>
                    <option value="doctor">Doctors</option>
                    <option value="pharmacist">Pharmacists</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>
              </div>

              {/* Selected User Detailed Inspection Modal for Admin */}
              {selectedUserForAdmin && (
                <div className="bg-teal-50/70 border-2 border-teal-500/50 rounded-2xl p-5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
                        {selectedUserForAdmin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900">{selectedUserForAdmin.name}</h4>
                          {getRoleBadge(selectedUserForAdmin.role)}
                        </div>
                        <p className="text-xs text-slate-600">
                          {selectedUserForAdmin.rollNumber || selectedUserForAdmin.username} • {selectedUserForAdmin.department}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUserForAdmin(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-300"
                    >
                      Close Inspection
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Email Address:</span>
                      <span className="font-medium text-slate-900">{selectedUserForAdmin.email}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Contact Phone:</span>
                      <span className="font-semibold text-slate-900">{selectedUserForAdmin.phone || 'N/A'}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Hostel / Location:</span>
                      <span className="font-medium text-slate-900">{selectedUserForAdmin.hostelBlock || selectedUserForAdmin.roomNo || 'Campus'}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Blood Group:</span>
                      <span className="font-bold text-rose-700">{selectedUserForAdmin.bloodGroup || 'Unknown'}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Emergency Contact:</span>
                      <span className="font-medium text-slate-900">{selectedUserForAdmin.emergencyContact || 'N/A'} ({selectedUserForAdmin.emergencyPhone || 'N/A'})</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Allergies / Flags:</span>
                      <span className="font-medium text-amber-800">{selectedUserForAdmin.allergies || 'None reported'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* User Directory Table */}
              {loadingDirectory ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading campus user directory...
                </div>
              ) : directoryUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No user profiles found matching your search.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">User & ID</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Department / Clinic</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {directoryUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="font-mono text-[11px] text-teal-700">{user.rollNumber || user.username}</div>
                          </td>
                          <td className="p-3">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="p-3 text-slate-600">
                            {user.department || user.specialization || 'Campus'}
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>{user.phone || 'No phone'}</div>
                            <div className="text-[10px] text-slate-400">{user.email}</div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedUserForAdmin(user)}
                              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition-colors text-[11px]"
                            >
                              Inspect Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-teal-700" />
            <span>BIT Health Information Security & Privacy Compliance</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
