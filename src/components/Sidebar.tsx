import React from 'react';
import { Role, User } from '../types';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FileText,
  UserCheck,
  Pill,
  Sparkles,
  Stethoscope,
  Users,
  Activity,
  Package,
  History,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  HeartPulse
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarProps {
  currentRole: Role;
  currentUser: User | null;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentUser,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
  alertCount = 0
}) => {
  // Define navigation items per role
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'student':
        return [
          { id: 'book', label: 'Book Appointment', icon: Calendar },
          { id: 'consultation', label: 'Online Consultation', icon: MessageSquare },
          { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
          { id: 'my_tokens', label: 'Token & Visit History', icon: UserCheck },
          { id: 'pharmacy', label: 'Medicine Stock', icon: Pill },
          { id: 'triage', label: 'AI Health Triage', icon: Sparkles }
        ];

      case 'doctor':
        return [
          { id: 'queue', label: 'OPD Patient Queue', icon: Users },
          { id: 'online', label: 'Online Consultations', icon: MessageSquare }
        ];

      case 'pharmacist':
        return [
          { id: 'inventory', label: 'Medicine Inventory', icon: Pill, badge: alertCount > 0 ? alertCount : undefined, badgeColor: 'bg-rose-500' },
          { id: 'pending_prescriptions', label: 'Pending Dispensation', icon: Package },
          { id: 'logs', label: 'Stock Movement Logs', icon: History }
        ];

      case 'admin':
        return [
          { id: 'analytics', label: 'Campus Analytics', icon: Activity },
          { id: 'directory', label: 'User Directory', icon: Users },
          { id: 'roster', label: 'Doctor Roster', icon: Stethoscope },
          { id: 'consultations', label: 'Consultations Oversight', icon: MessageSquare }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    onTabChange(id);
    onCloseMobile();
  };

  const roleLabelMap: Record<Role, string> = {
    student: 'Student Portal',
    doctor: 'Doctor Console',
    pharmacist: 'Pharmacy Center',
    admin: 'Admin Operations'
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[69px] z-40 lg:z-30 h-screen lg:h-[calc(100vh-69px)] bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 shadow-sm ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Mobile Header Brand inside drawer */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3478F6] flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">BIT Health Center</h2>
                <span className="text-[10px] text-slate-500 capitalize">{roleLabelMap[currentRole]}</span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Role Portal Category Indicator */}
          {!isCollapsed && (
            <div className="hidden lg:flex items-center justify-between px-2.5 pt-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#3478F6] animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {roleLabelMap[currentRole]}
                </span>
              </div>
              <span className="text-[10px] font-semibold bg-blue-50 text-[#3478F6] px-2 py-0.5 rounded-full border border-blue-100">
                Active
              </span>
            </div>
          )}

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                    isCollapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-3'
                  } ${
                    isActive
                      ? 'bg-[#3478F6] text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-600'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#3478F6]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    {!isCollapsed && (
                      <span className="truncate text-left">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ml-2 shrink-0 ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge !== undefined && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {/* Quick Emergency Assistance Pill */}
          {!isCollapsed && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-3 border border-blue-100/80 text-xs">
              <div className="flex items-center space-x-2 text-[#3478F6] font-bold mb-1">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>24/7 Casualty Support</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Campus Ambulance & OPD: <strong className="text-slate-800">Ext 108</strong>
              </p>
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            ) : (
              <div className="flex items-center space-x-2 text-slate-500 hover:text-slate-800">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
