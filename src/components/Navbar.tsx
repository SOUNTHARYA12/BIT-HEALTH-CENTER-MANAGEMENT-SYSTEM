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
    <header className="bg-white/95 text-slate-900 border-b border-slate-200/90 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Institutional Emergency Bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center text-rose-400 font-semibold tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              Emergency Casualty: Ext 108 · +91 4295 226000
            </span>
            <span className="hidden sm:inline text-slate-600">/</span>
            <span className="hidden sm:inline text-slate-400">Campus Health Center, Sathyamangalam</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span>OPD: 8:30 AM – 8:00 PM</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
              24/7 Casualty Open
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-950">
                BIT Student Health Center
              </h1>
              <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                BIT Sathy
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Bannari Amman Institute of Technology · Clinical Appointments & Medication Control
            </p>
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
              className="flex items-center space-x-2.5 bg-slate-50 hover:bg-teal-50/70 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 text-xs transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 group-hover:bg-teal-600 text-teal-800 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-900 group-hover:text-teal-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {currentUser.rollNumber || currentUser.username} · <span className="capitalize">{currentUser.role}</span>
                </div>
              </div>
            </button>
          )}

          {/* Role Navigation: ONLY Admin can switch portals; Non-admins are locked to their own authorized portal */}
          {isAdmin ? (
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
              <button
                id="role-btn-student"
                onClick={() => onRoleChange('student')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentRole === 'student'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                id="role-btn-doctor"
                onClick={() => onRoleChange('doctor')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentRole === 'doctor'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>

              <button
                id="role-btn-pharmacist"
                onClick={() => onRoleChange('pharmacist')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors relative cursor-pointer ${
                  currentRole === 'pharmacist'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          ) : (
            /* Non-Admin Portal Indicator & Private Profile Access */
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-900">
                {currentUser?.role === 'student' && <User className="w-3.5 h-3.5 text-teal-700" />}
                {currentUser?.role === 'doctor' && <Stethoscope className="w-3.5 h-3.5 text-teal-700" />}
                {currentUser?.role === 'pharmacist' && <Pill className="w-3.5 h-3.5 text-teal-700" />}
                <span className="capitalize">{currentUser?.role} Portal</span>
                <span className="text-[10px] bg-teal-200/70 text-teal-950 px-1.5 py-0.2 rounded font-mono">
                  Authorized
                </span>
              </div>

              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
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
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
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

