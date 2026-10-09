import React, { useState, useEffect, useRef } from 'react';
import { AppNotification, Role, User } from '../types';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../services/api';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Pill,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  Info,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  X,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface NotificationDropdownProps {
  currentUser: User | null;
  currentRole: Role;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  currentUser,
  currentRole,
  onNavigateTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'alerts'>('all');
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('all');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const userId = currentUser?.rollNumber || currentUser?.username || currentUser?.id;

  const loadNotifs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({
        role: currentRole,
        userId
      });
      setNotifications(data);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError('Unable to sync notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
    // Poll notifications every 15 seconds to receive real-time updates
    const interval = setInterval(loadNotifs, 15000);
    return () => clearInterval(interval);
  }, [currentRole, userId]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowAllModal(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => !n.read && (n.priority === 'urgent' || n.priority === 'critical')).length;

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead({
        role: currentRole,
        userId
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleItemClick = (n: AppNotification) => {
    if (!n.read) {
      markNotificationRead(n.id).catch(() => {});
      setNotifications(prev =>
        prev.map(item => (item.id === n.id ? { ...item, read: true } : item))
      );
    }

    if (n.linkTab && onNavigateTab) {
      onNavigateTab(n.linkTab);
      setIsOpen(false);
      setShowAllModal(false);
    }
  };

  // Humanize timestamp
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Category Icon & Styling Helper
  const getCategoryMeta = (category: AppNotification['category']) => {
    switch (category) {
      case 'appointment':
        return {
          icon: Calendar,
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-700',
          borderColor: 'border-teal-200',
          badgeText: 'Appointment'
        };
      case 'prescription':
        return {
          icon: Pill,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          badgeText: 'Dispensary'
        };
      case 'consultation':
        return {
          icon: MessageSquare,
          bgColor: 'bg-sky-50',
          textColor: 'text-sky-700',
          borderColor: 'border-sky-200',
          badgeText: 'Consultation'
        };
      case 'inventory':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          badgeText: 'Stock Alert'
        };
      case 'emergency':
        return {
          icon: ShieldAlert,
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200',
          badgeText: 'Casualty'
        };
      case 'system':
      default:
        return {
          icon: Info,
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          badgeText: 'Health Center'
        };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'unread') return !n.read;
    if (filterTab === 'alerts') return n.priority === 'urgent' || n.priority === 'critical' || n.category === 'inventory';
    return true;
  });

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        id="navbar-notification-btn"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={unreadCount > 0 ? `${unreadCount} unread health center notifications` : 'Health Center Notifications'}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'bg-teal-50 border-teal-400 text-teal-800 shadow-xs'
            : unreadCount > 0
            ? 'bg-white hover:bg-teal-50/70 border-slate-200 hover:border-teal-300 text-[#0a2540]'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <Bell className="w-4 h-4 transition-transform group-hover:scale-105" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 text-[10px] font-extrabold flex items-center justify-center rounded-full text-white shadow-xs ${
              criticalCount > 0
                ? 'bg-rose-600 animate-pulse'
                : 'bg-[#00897b]'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Health Center Notifications"
          className="absolute right-0 top-full mt-2.5 w-[360px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-[#00897b] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm text-[#0a2540] tracking-tight">
                    Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500">
                      All caught up
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 capitalize">
                  {currentRole} Portal Alerts · BIT Health Center
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={loadNotifs}
                title="Refresh notifications"
                className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all notifications as read"
                  className="flex items-center space-x-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/70 px-2.5 py-1 rounded-lg border border-teal-200/80 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="px-3.5 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-teal-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterTab === 'unread'
                  ? 'bg-white text-teal-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterTab('alerts')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterTab === 'alerts'
                  ? 'bg-white text-teal-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Alerts ({notifications.filter(n => n.priority === 'urgent' || n.priority === 'critical' || n.category === 'inventory').length})
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center text-xs text-rose-600 space-y-2">
                <AlertTriangle className="w-6 h-6 mx-auto text-rose-500" />
                <p>{error}</p>
                <button
                  onClick={loadNotifs}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold border border-rose-200 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-sm text-[#0a2540]">
                  {filterTab === 'unread' ? 'No unread notifications' : 'No notifications in this view'}
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  You are completely caught up with all updates, appointments, and dispensary alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map(n => {
                const meta = getCategoryMeta(n.category);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 sm:p-4 transition-colors cursor-pointer relative group flex items-start space-x-3 ${
                      !n.read
                        ? 'bg-teal-50/30 hover:bg-teal-50/60'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl ${meta.bgColor} ${meta.textColor} border ${meta.borderColor} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${meta.bgColor} ${meta.textColor} ${meta.borderColor}`}
                        >
                          {meta.badgeText}
                        </span>

                        {n.priority === 'urgent' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Urgent
                          </span>
                        )}
                        {n.priority === 'critical' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            Critical Alert
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium flex items-center ml-auto">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          {formatTimeAgo(n.timestamp)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold leading-snug line-clamp-1 ${
                          !n.read ? 'text-[#0a2540]' : 'text-slate-700'
                        }`}
                      >
                        {n.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Direct Link Action */}
                      {n.actionLabel && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="inline-flex items-center text-[10px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 group-hover:bg-teal-100/80 px-2 py-0.5 rounded-md border border-teal-200 transition-colors">
                            {n.actionLabel}
                            <ExternalLink className="w-2.5 h-2.5 ml-1" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right side Read status dot and hover actions */}
                    <div className="absolute right-3 top-3.5 flex flex-col items-end space-y-1.5">
                      {!n.read && (
                        <span
                          title="Unread notification"
                          className="w-2 h-2 rounded-full bg-[#00897b] ring-2 ring-teal-200"
                        />
                      )}

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        {!n.read && (
                          <button
                            onClick={e => handleMarkAsRead(e, n.id)}
                            title="Mark as read"
                            className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={e => handleDelete(e, n.id)}
                          title="Delete notification"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium px-1">
              {notifications.length} total alerts
            </span>

            <button
              onClick={() => {
                setShowAllModal(true);
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline px-2 py-1 rounded cursor-pointer"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive All Notifications Modal */}
      {showAllModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00897b] text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0a2540]">
                    Notification Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    BIT Student Health Center · {currentRole.toUpperCase()} Portal Activity Stream
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAllModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search notifications by title, medicine, doctor, or token..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
                {['all', 'appointment', 'prescription', 'consultation', 'inventory'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setModalCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      modalCategoryFilter === cat
                        ? 'bg-[#00897b] text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3">
              {notifications
                .filter(n => {
                  if (modalCategoryFilter !== 'all' && n.category !== modalCategoryFilter) {
                    return false;
                  }
                  if (modalSearch.trim()) {
                    const q = modalSearch.toLowerCase();
                    return (
                      n.title.toLowerCase().includes(q) ||
                      n.message.toLowerCase().includes(q) ||
                      (n.metadata && JSON.stringify(n.metadata).toLowerCase().includes(q))
                    );
                  }
                  return true;
                })
                .map(n => {
                  const meta = getCategoryMeta(n.category);
                  const IconComponent = meta.icon;

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-start space-x-3.5 mb-1 ${
                        !n.read
                          ? 'bg-teal-50/40 hover:bg-teal-50/70 border border-teal-200/60'
                          : 'bg-white hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl ${meta.bgColor} ${meta.textColor} border ${meta.borderColor} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${meta.bgColor} ${meta.textColor} ${meta.borderColor}`}
                            >
                              {meta.badgeText}
                            </span>
                            {n.priority && n.priority !== 'normal' && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  n.priority === 'critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {n.priority.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(n.timestamp).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-[#0a2540]">
                          {n.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="mt-2.5 flex items-center space-x-2">
                          {n.actionLabel && (
                            <span className="inline-flex items-center text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                              {n.actionLabel}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </span>
                          )}

                          {!n.read && (
                            <button
                              onClick={e => handleMarkAsRead(e, n.id)}
                              className="text-xs font-bold text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={e => handleDelete(e, n.id)}
                            className="text-xs text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {notifications.length} alerts for {currentRole}</span>
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-1.5 bg-[#00897b] hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
