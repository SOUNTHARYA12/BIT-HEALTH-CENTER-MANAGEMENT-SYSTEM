/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Role, User } from './types';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { StudentPortal } from './components/StudentPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { PharmacyPortal } from './components/PharmacyPortal';
import { AdminPortal } from './components/AdminPortal';
import { ProfileModal } from './components/ProfileModal';
import { fetchStockAlerts, logoutUser, fetchCurrentUser } from './services/api';
import { logoutFirebaseAuth } from './firebase';
import { Building2, PhoneCall } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [alertCount, setAlertCount] = useState<number>(0);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Restore stored session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('bit_health_token') || sessionStorage.getItem('bit_health_token');
    const storedUserStr = localStorage.getItem('bit_health_user') || sessionStorage.getItem('bit_health_user');

    if (storedToken && storedUserStr) {
      try {
        const userObj: User = JSON.parse(storedUserStr);
        setCurrentUser(userObj);
        setCurrentRole(userObj.role);

        // Verify session with backend
        fetchCurrentUser(storedToken)
          .then(validUser => {
            setCurrentUser(validUser);
            setCurrentRole(validUser.role);
          })
          .catch(() => {
            // If token invalid, clear session
            localStorage.removeItem('bit_health_token');
            localStorage.removeItem('bit_health_user');
            sessionStorage.removeItem('bit_health_token');
            sessionStorage.removeItem('bit_health_user');
            setCurrentUser(null);
          });
      } catch (e) {
        setCurrentUser(null);
      }
    }
    setInitializing(false);
  }, []);

  // Poll stock alert count periodically for navbar badge
  useEffect(() => {
    if (!currentUser) return;
    const checkAlerts = () => {
      fetchStockAlerts()
        .then(data => setAlertCount(data.totalAlerts))
        .catch(() => {});
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('bit_health_token') || sessionStorage.getItem('bit_health_token');
    if (token) {
      logoutUser(token);
    }
    logoutFirebaseAuth();
    localStorage.removeItem('bit_health_token');
    localStorage.removeItem('bit_health_user');
    sessionStorage.removeItem('bit_health_token');
    sessionStorage.removeItem('bit_health_user');
    setCurrentUser(null);
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    if (localStorage.getItem('bit_health_user')) {
      localStorage.setItem('bit_health_user', JSON.stringify(updatedUser));
    }
    if (sessionStorage.getItem('bit_health_user')) {
      sessionStorage.setItem('bit_health_user', JSON.stringify(updatedUser));
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-teal-700 font-semibold">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading BIT Health Center Portal...</span>
        </div>
      </div>
    );
  }

  // Show Login Page if not authenticated
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onLogout={handleLogout}
        alertCount={alertCount}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {currentRole === 'student' && <StudentPortal currentUser={currentUser} />}
        {currentRole === 'doctor' && <DoctorPortal currentUser={currentUser} />}
        {currentRole === 'pharmacist' && <PharmacyPortal />}
        {currentRole === 'admin' && <AdminPortal />}
      </main>

      {/* Profile & Privacy Modal */}
      <ProfileModal
        currentUser={currentUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">BIT Student Health Center System</span>
            <span className="text-slate-400">•</span>
            <span>Bannari Amman Institute of Technology</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-600">
            <span className="flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-teal-600" /> Sathyamangalam, Erode, Tamil Nadu
            </span>
            <span className="flex items-center">
              <PhoneCall className="w-3.5 h-3.5 mr-1 text-teal-600" /> Ext 108 / 226000
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

