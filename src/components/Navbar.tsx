import React from 'react';
import { Role, User as UserType } from '../types';
import {
  HeartPulse,
  Stethoscope,
  Pill,
  ShieldAlert,
  User,
  Activity,
  LogOut,
  UserCheck,
  Lock,
  Users,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserType | null;
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
  alertCount: number;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  onLogout,
  alertCount,
  onOpenProfile
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-white/95 text-slate-900 shadow-sm border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Emergency Strip */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-200 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-rose-400 font-semibold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            BIT Emergency Medical Hotline: Ext 108 / +91 4295 226000
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300">Campus Health Center - Sathyamangalam</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-300">
          <span>OPD Hours: 8:30 AM - 8:00 PM</span>
          <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/30">
            24/7 Casualty Open
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">BIT Student Health Center</h1>
              <span className="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                Bannari Amman Institute of Technology
              </span>
            </div>
            <p className="text-xs text-slate-500">Appointment Scheduling & Medication Stock Control System</p>
          </div>
        </div>

        {/* Right Section: User Profile & Role Nav & Logout */}
        <div className="flex items-center flex-wrap gap-2">
          {/* User Profile Button */}
          {currentUser && (
            <button
              onClick={onOpenProfile}
              id="navbar-profile-btn"
              title="Click to view health center profile"
              className="flex items-center space-x-2 bg-slate-50 hover:bg-teal-50/80 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 text-xs transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 group-hover:bg-teal-600 text-teal-700 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-900 leading-none group-hover:text-teal-900 flex items-center gap-1">
                  {currentUser.name}
                  <span className="text-[10px] text-teal-600 font-normal">View</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {currentUser.rollNumber || currentUser.username} ({currentUser.role.toUpperCase()})
                </div>
              </div>
            </button>
          )}

          {/* Role Navigation: ONLY Admin can switch portals; Non-admins are locked to their own authorized portal */}
          {isAdmin ? (
            <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs overflow-x-auto">
              <button
                id="role-btn-student"
                onClick={() => onRoleChange('student')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === 'student'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                id="role-btn-doctor"
                onClick={() => onRoleChange('doctor')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === 'doctor'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>

              <button
                id="role-btn-pharmacist"
                onClick={() => onRoleChange('pharmacist')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all relative cursor-pointer ${
                  currentRole === 'pharmacist'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Pharmacy</span>
                {alertCount > 0 && (
                  <span className="bg-amber-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full ml-1">
                    {alertCount}
                  </span>
                )}
              </button>

              <button
                id="role-btn-admin"
                onClick={() => onRoleChange('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          ) : (
            /* Non-Admin Portal Indicator & Private Profile Access */
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-800">
                {currentUser?.role === 'student' && <User className="w-3.5 h-3.5 text-teal-700" />}
                {currentUser?.role === 'doctor' && <Stethoscope className="w-3.5 h-3.5 text-teal-700" />}
                {currentUser?.role === 'pharmacist' && <Pill className="w-3.5 h-3.5 text-teal-700" />}
                <span className="capitalize">{currentUser?.role} Portal</span>
                <span className="text-[10px] bg-teal-200/70 text-teal-900 px-1.5 py-0.2 rounded font-mono">
                  Authorized
                </span>
              </div>

              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>My Profile</span>
              </button>
            </div>
          )}

          {/* Logout Button */}
          {currentUser && (
            <button
              id="navbar-logout-btn"
              onClick={onLogout}
              title="Sign Out of Portal"
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

