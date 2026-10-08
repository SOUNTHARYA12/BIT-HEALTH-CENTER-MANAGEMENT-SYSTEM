import React, { useState, useEffect } from 'react';
import { AnalyticsStats, Doctor, Medicine, User as UserType, OnlineConsultation } from '../types';
import { fetchAnalytics, fetchDoctors, fetchInventory, fetchUsersDirectory, fetchConsultations } from '../services/api';
import {
  Activity,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Stethoscope,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Pill,
  Search,
  User,
  ShieldCheck,
  Phone,
  Mail,
  HeartPulse,
  Lock,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  GraduationCap
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'directory' | 'roster' | 'consultations'>('analytics');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [criticalInventory, setCriticalInventory] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Online Consultations State for Admin (Requirement #6)
  const [allConsultations, setAllConsultations] = useState<OnlineConsultation[]>([]);
  const [consultStatusFilter, setConsultStatusFilter] = useState<string>('all');
  const [consultSearch, setConsultSearch] = useState<string>('');
  const [selectedAdminConsult, setSelectedAdminConsult] = useState<OnlineConsultation | null>(null);

  // User Directory State for Admin
  const [users, setUsers] = useState<UserType[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const loadAdminData = () => {
    setIsLoading(true);
    Promise.all([
      fetchAnalytics(),
      fetchDoctors(),
      fetchInventory({ alertOnly: true })
    ])
      .then(([s, d, alertMeds]) => {
        setStats(s);
        setDoctors(d);
        setCriticalInventory(alertMeds);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const loadUserDirectory = () => {
    setLoadingUsers(true);
    fetchUsersDirectory({
      role: userRoleFilter === 'all' ? undefined : userRoleFilter,
      search: userSearch || undefined
    })
      .then(res => {
        setUsers(res.users);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoadingUsers(false);
      });
  };

  const loadConsultationsData = () => {
    fetchConsultations()
      .then(res => setAllConsultations(res))
      .catch(err => console.error('Error fetching admin consultations:', err));
  };

  useEffect(() => {
    loadAdminData();
    loadConsultationsData();
  }, []);

  useEffect(() => {
    if (activeAdminTab === 'directory') {
      loadUserDirectory();
    }
    if (activeAdminTab === 'consultations') {
      loadConsultationsData();
    }
  }, [activeAdminTab, userRoleFilter, userSearch]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-300">Admin</span>;
      case 'doctor':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-300">Doctor</span>;
      case 'pharmacist':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">Pharmacist</span>;
      case 'student':
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">Student</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-teal-700" /> BIT Health Center Administrative Control
            </h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin Privileges Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full permissions to view campus statistics, medical records, medication stock, and all user profiles.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { loadAdminData(); if (activeAdminTab === 'directory') loadUserDirectory(); }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center border border-slate-300 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`px-4 py-2.5 font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'analytics'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Executive Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('directory')}
          className={`px-4 py-2.5 font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'directory'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All User Profiles & Directory</span>
          <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.2 rounded-full font-bold ml-1">
            Admin Only
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('roster')}
          className={`px-4 py-2.5 font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'roster'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Duty Roster</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('consultations')}
          className={`px-4 py-2.5 font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'consultations'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Online Consultations</span>
          <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.2 rounded-full font-bold ml-1">
            {allConsultations.length}
          </span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Appointments</span>
              <div className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalAppointmentsToday || 0}</div>
              <span className="text-[10px] text-teal-700 mt-1 block">Live OPD Registrations</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Queue</span>
              <div className="text-3xl font-bold text-amber-700 mt-2">{stats?.activeQueueCount || 0}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Students Waiting / In Lounge</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Low Stock Medicines</span>
              <div className="text-3xl font-bold text-amber-700 mt-2">{stats?.totalLowStockItems || 0}</div>
              <span className="text-[10px] text-amber-700/80 mt-1 block">Below Threshold Level</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Near-Expiry Batches</span>
              <div className="text-3xl font-bold text-rose-700 mt-2">{stats?.totalNearExpiryItems || 0}</div>
              <span className="text-[10px] text-rose-700/80 mt-1 block">Expiring within 30 Days</span>
            </div>
          </div>

          {/* Department Visit Breakdown & Top Diagnoses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-teal-700" /> Department-Wise Student OPD Visits
              </h3>

              <div className="space-y-3 pt-2">
                {stats && Object.entries(stats.departmentWiseVisits).length > 0 ? (
                  Object.entries(stats.departmentWiseVisits).map(([dept, count]) => {
                    const total = stats.totalAppointmentsToday || 1;
                    const countNum = Number(count) || 0;
                    const pct = Math.round((countNum / total) * 100);

                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-800 font-medium">{dept}</span>
                          <span className="text-teal-700 font-bold">{countNum} visits ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 15)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No department data recorded yet.</p>
                )}
              </div>
            </div>

            {/* Top Diagnoses */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-amber-700" /> Top Diagnosed Health Conditions
              </h3>

              <div className="space-y-2 pt-2">
                {stats && stats.topDiagnoses && stats.topDiagnoses.length > 0 ? (
                  stats.topDiagnoses.map((diag, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800">{diag.diagnosis}</span>
                      <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                        {diag.count} cases
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No completed diagnosis logs available for today.</p>
                )}
              </div>
            </div>
          </div>

          {/* Critical Stock Alert Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center text-amber-700">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Stock Control Action Needed (Low Stock / Expiry)
                </h3>
                <p className="text-xs text-slate-500">Medicines requiring reorder request to Central Medical Store.</p>
              </div>
            </div>

            {criticalInventory.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-emerald-700 flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>All pharmacy inventory items are healthy and within required safety thresholds.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Batch</th>
                      <th className="py-2.5 px-3">Stock Level</th>
                      <th className="py-2.5 px-3">Threshold</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {criticalInventory.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{med.batchNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{med.stockQuantity} {med.unit}</td>
                        <td className="py-2.5 px-3 text-slate-500">{med.minThreshold}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{med.expiryDate}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            REORDER NEEDED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL USER PROFILES & CAMPUS DIRECTORY (Only accessible to Admin) */}
      {activeAdminTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setUserRoleFilter('all')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'all'
                  ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total User Directory</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
              <span className="text-[10px] text-teal-700 font-medium">All Campus Accounts</span>
            </div>

            <div
              onClick={() => setUserRoleFilter('student')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'student'
                  ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Registered Students</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {users.filter(u => u.role === 'student').length}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">BIT Student Registry</span>
            </div>

            <div
              onClick={() => setUserRoleFilter('doctor')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'doctor'
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Medical Officers</span>
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {users.filter(u => u.role === 'doctor').length}
              </div>
              <span className="text-[10px] text-blue-700 font-medium">Doctors on Staff</span>
            </div>

            <div
              onClick={() => setUserRoleFilter('pharmacist')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                userRoleFilter === 'pharmacist'
                  ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Pharmacy & Admin</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                {users.filter(u => u.role === 'pharmacist' || u.role === 'admin').length}
              </div>
              <span className="text-[10px] text-purple-700 font-medium">Clinical Governance</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal-700" /> Campus Healthcare User Profiles & Records
                </h3>
                <p className="text-xs text-slate-500">
                  Strict access control active: As Administrator, you have full clearance to inspect all registered student and staff profiles.
                </p>
              </div>

              {/* Controls: Search, Filter & Refresh */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search name, roll no, email..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="student">Students ({users.filter(u => u.role === 'student').length})</option>
                  <option value="doctor">Doctors ({users.filter(u => u.role === 'doctor').length})</option>
                  <option value="pharmacist">Pharmacists ({users.filter(u => u.role === 'pharmacist').length})</option>
                  <option value="admin">Administrators ({users.filter(u => u.role === 'admin').length})</option>
                </select>

                <button
                  type="button"
                  onClick={loadUserDirectory}
                  disabled={loadingUsers}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Reload & Synchronize Directory"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                  <span>{loadingUsers ? 'Syncing...' : 'Sync Directory'}</span>
                </button>
              </div>
            </div>

            {/* Selected User Full Profile Modal */}
            {selectedUser && (
              <div className="bg-teal-50 border-2 border-teal-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-slate-900">{selectedUser.name}</h4>
                        {getRoleBadge(selectedUser.role)}
                      </div>
                      <p className="text-xs text-slate-600">
                        Roll/Staff ID: <span className="font-mono font-bold text-teal-800">{selectedUser.rollNumber || selectedUser.username}</span> • {selectedUser.department}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-xs bg-white text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 font-bold cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Official Roll / Register No</span>
                    <span className="font-mono font-bold text-teal-800 text-sm">
                      {selectedUser.rollNumber || selectedUser.username}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-semibold text-slate-900 break-all">{selectedUser.email}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                    <span className="font-semibold text-slate-900">{selectedUser.phone || 'None recorded'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Blood Group</span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                      {selectedUser.bloodGroup || 'Not Recorded'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Department / Degree</span>
                    <span className="font-medium text-slate-900">{selectedUser.department || 'Campus Department'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Hostel / Campus Residence</span>
                    <span className="font-medium text-slate-900">{selectedUser.hostelBlock || selectedUser.roomNo || 'BIT Campus Hostel'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Registration Date</span>
                    <span className="font-mono text-slate-800">{selectedUser.joinedDate || 'Active Member'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                    <span className="font-semibold text-slate-900">
                      {selectedUser.emergencyContact || 'Parent / Guardian'} ({selectedUser.emergencyPhone || selectedUser.phone || 'Ext 108'})
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 sm:col-span-4">
                    <span className="text-slate-400 block text-[11px]">Allergies & Clinical Flags</span>
                    <span className="font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block mt-0.5">
                      {selectedUser.allergies || 'None reported'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Users Directory Table */}
            {loadingUsers ? (
              <div className="text-center py-10 text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading campus directory & synchronizing registered users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p>No user profiles match your filter.</p>
                <button
                  type="button"
                  onClick={() => { setUserRoleFilter('all'); setUserSearch(''); loadUserDirectory(); }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-teal-700 font-semibold cursor-pointer"
                >
                  Reset Filters & Refresh
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User & Register No</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department / Program</th>
                      <th className="p-3">Hostel / Room</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Blood Group</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id || u.username} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            {u.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            <span>{u.name}</span>
                          </div>
                          <div className="font-mono font-semibold text-[11px] text-teal-700 mt-0.5">
                            {u.rollNumber || u.username}
                          </div>
                        </td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                        <td className="p-3 text-slate-700">{u.department || 'Engineering'}</td>
                        <td className="p-3 text-slate-600 font-medium">{u.hostelBlock || u.roomNo || 'Campus'}</td>
                        <td className="p-3 text-slate-600">
                          <div>{u.phone || 'No phone'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                            {u.bloodGroup || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition-colors text-[11px] cursor-pointer"
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
        </div>
      )}

      {/* TAB 3: DOCTOR DUTY ROSTER */}
      {activeAdminTab === 'roster' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Stethoscope className="w-4 h-4 mr-2 text-teal-700" /> BIT Health Center Doctor Duty Roster
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{doc.name}</h4>
                    <p className="text-[11px] text-teal-700">{doc.specialization}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded">
                    {doc.currentStatus.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{doc.roomNo}</p>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  <span>Duty Days: {doc.availableDays.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ONLINE CONSULTATIONS MONITORING (User Requirement #6) */}
      {activeAdminTab === 'consultations' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-teal-700" /> Online Doctor Consultations Activity Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of digital doctor consultation requests, assigned medical officers, statuses, and prescriptions issued. (Confidential chat logs protected).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
                Total Requests: {allConsultations.length}
              </span>
              <button
                onClick={loadConsultationsData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Requests</span>
              <span className="text-xl font-bold text-amber-700">
                {allConsultations.filter(c => c.status === 'pending').length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accepted / In Progress</span>
              <span className="text-xl font-bold text-teal-700">
                {allConsultations.filter(c => c.status === 'accepted' || c.status === 'in_consultation').length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
              <span className="text-xl font-bold text-emerald-700">
                {allConsultations.filter(c => c.status === 'completed').length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Declined</span>
              <span className="text-xl font-bold text-rose-700">
                {allConsultations.filter(c => c.status === 'rejected').length}
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={consultSearch}
                onChange={e => setConsultSearch(e.target.value)}
                placeholder="Search by student name, roll number, or doctor name..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={consultStatusFilter}
                onChange={e => setConsultStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
                <option value="rejected">Declined</option>
              </select>
            </div>
          </div>

          {/* Consultations Table */}
          {allConsultations.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-slate-200">
              No online consultations logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Consultation #</th>
                    <th className="p-3">Student Patient</th>
                    <th className="p-3">Assigned Medical Officer</th>
                    <th className="p-3">Health Concern</th>
                    <th className="p-3">Requested / Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allConsultations
                    .filter(c => {
                      if (consultStatusFilter !== 'all' && c.status !== consultStatusFilter) return false;
                      if (consultSearch) {
                        const s = consultSearch.toLowerCase();
                        return (
                          c.studentName.toLowerCase().includes(s) ||
                          c.studentRoll.toLowerCase().includes(s) ||
                          c.doctorName.toLowerCase().includes(s) ||
                          c.consultationNumber.toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-700">
                          {c.consultationNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{c.studentRoll} • {c.department}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{c.doctorName}</div>
                          <div className="text-[10px] text-slate-500">{c.doctorSpecialization}</div>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="line-clamp-2 text-slate-700">{c.healthConcern}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-600">
                          <div>{c.createdAt.split('T')[0]}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Slot: {c.preferredTime || 'Immediate'}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : c.status === 'accepted'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : c.status === 'in_consultation'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                              : c.status === 'completed'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedAdminConsult(c)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition-colors text-[11px] cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Admin Modal for Inspecting Consultation Details */}
          {selectedAdminConsult && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-700 uppercase">
                      {selectedAdminConsult.consultationNumber}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">
                      Online Consultation Record
                    </h3>
                  </div>
                  <button onClick={() => setSelectedAdminConsult(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Student</span>
                    <span className="font-bold text-slate-900">{selectedAdminConsult.studentName} ({selectedAdminConsult.studentRoll})</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{selectedAdminConsult.department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Doctor Assigned</span>
                    <span className="font-bold text-slate-900">{selectedAdminConsult.doctorName}</span>
                    <p className="text-[11px] text-teal-700 mt-0.5">{selectedAdminConsult.doctorSpecialization}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-700 uppercase text-[10px]">Reported Symptoms & Health Concern:</span>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-950 leading-relaxed">
                    "{selectedAdminConsult.healthConcern}"
                  </div>
                </div>

                {selectedAdminConsult.doctorNotes && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-700 uppercase text-[10px]">Doctor Clinical Notes:</span>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800">
                      {selectedAdminConsult.doctorNotes}
                    </div>
                  </div>
                )}

                {selectedAdminConsult.prescriptions && selectedAdminConsult.prescriptions.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-slate-700 uppercase text-[10px]">
                      Prescribed Medicines ({selectedAdminConsult.prescriptions.length}):
                    </span>
                    <div className="space-y-1.5">
                      {selectedAdminConsult.prescriptions.map((p, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{p.medicineName}</span>
                            <span className="text-slate-500 ml-2">({p.dosage} • {p.frequency} • {p.duration})</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.dispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {p.dispensed ? 'Dispensed' : 'Pending Dispense'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Privacy Notice: Direct conversation text history is restricted to Patient & Doctor.</span>
                  <span className="font-semibold text-teal-800">Status: {selectedAdminConsult.status.toUpperCase()}</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedAdminConsult(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

