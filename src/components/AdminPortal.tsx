import React, { useState, useEffect } from 'react';
import { AnalyticsStats, Doctor, Medicine, User as UserType } from '../types';
import { fetchAnalytics, fetchDoctors, fetchInventory, fetchUsersDirectory } from '../services/api';
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
  Lock
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'directory' | 'roster'>('analytics');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [criticalInventory, setCriticalInventory] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeAdminTab === 'directory') {
      loadUserDirectory();
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal-700" /> Campus Healthcare User Profiles & Records
                </h3>
                <p className="text-xs text-slate-500">
                  Strict access control active: As Administrator, you have full clearance to inspect student and staff profiles.
                </p>
              </div>

              {/* Role filter & search */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
                  className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="student">Students</option>
                  <option value="doctor">Doctors</option>
                  <option value="pharmacist">Pharmacists</option>
                  <option value="admin">Administrators</option>
                </select>
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
                    className="text-xs bg-white text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                  >
                    Close Inspection
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-semibold text-slate-900">{selectedUser.email}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                    <span className="font-semibold text-slate-900">{selectedUser.phone || 'None'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Blood Group</span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                      {selectedUser.bloodGroup || 'Not Recorded'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Location / Hostel</span>
                    <span className="font-medium text-slate-900">{selectedUser.hostelBlock || selectedUser.roomNo || 'Campus'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Emergency Contact Person</span>
                    <span className="font-semibold text-slate-900">{selectedUser.emergencyContact || 'Campus Authorities'} ({selectedUser.emergencyPhone || 'Ext 108'})</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Allergies & Clinical Flags</span>
                    <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
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
                Loading campus directory...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No user profiles match your filter.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User & ID</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department / Unit</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Blood Group</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="font-mono text-[11px] text-teal-700">{u.rollNumber || u.username}</div>
                        </td>
                        <td className="p-3">{getRoleBadge(u.role)}</td>
                        <td className="p-3 text-slate-700">{u.department || 'Campus'}</td>
                        <td className="p-3 text-slate-600">
                          <div>{u.phone || 'No phone'}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
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
    </div>
  );
};

