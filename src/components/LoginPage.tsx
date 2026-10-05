import React, { useState } from 'react';
import { Role, User } from '../types';
import { loginUser, registerStudent } from '../services/api';
import { authenticateWithGoogle } from '../services/firebaseService';
import {
  HeartPulse,
  User as UserIcon,
  Stethoscope,
  Pill,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  LogIn,
  GraduationCap,
  Phone,
  Mail,
  Home
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form state
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState('Artificial Intelligence & Data Science');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regHostel, setRegHostel] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switch role tab
  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Roll Number or Employee ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginUser({
        identifier: identifier.trim(),
        password: password,
        role: selectedRole
      });

      if (rememberMe) {
        localStorage.setItem('bit_health_token', res.token);
        localStorage.setItem('bit_health_user', JSON.stringify(res.user));
      } else {
        sessionStorage.setItem('bit_health_token', res.token);
        sessionStorage.setItem('bit_health_user', JSON.stringify(res.user));
      }

      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRollNumber.trim()) {
      setError('Please enter your Student Register / Roll Number.');
      return;
    }
    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regPassword) {
      setError('Please choose a secure password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await registerStudent({
        rollNumber: regRollNumber.trim().toUpperCase(),
        name: regName.trim(),
        department: regDept,
        email: regEmail.trim(),
        phone: regPhone.trim(),
        hostelBlock: regHostel,
        password: regPassword
      });

      localStorage.setItem('bit_health_token', res.token);
      localStorage.setItem('bit_health_user', JSON.stringify(res.user));

      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Student registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticateWithGoogle();
      if (rememberMe) {
        localStorage.setItem('bit_health_token', res.token);
        localStorage.setItem('bit_health_user', JSON.stringify(res.user));
      } else {
        sessionStorage.setItem('bit_health_token', res.token);
        sessionStorage.setItem('bit_health_user', JSON.stringify(res.user));
      }
      onLoginSuccess(res.user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.message || 'Firebase Google authentication failed or was closed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      {/* Top Emergency Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs text-slate-200 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-rose-400 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 animate-pulse" />
            BIT Health Helpline: Ext 108 / 226000
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Bannari Amman Institute of Technology</span>
        </div>
        <div className="text-slate-300 text-xs">
          OPD Hours: <span className="text-teal-300 font-medium">08:30 AM - 08:00 PM</span> (24/7 Casualty Support)
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Form & Mode Switcher */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* Header Brand */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
                  <HeartPulse className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      BIT Health Center Portal
                    </h1>
                    <span className="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                      SSO Auth
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Student Medical Appointment & Dispensary Control System
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Login vs Register */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="mode-btn-login"
                  onClick={() => { setAuthMode('login'); setError(null); }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  id="mode-btn-register"
                  onClick={() => { setAuthMode('register'); setSelectedRole('student'); setError(null); }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Student Register</span>
                </button>
              </div>
            </div>

            {/* Role Tab Selector (Only show for Login mode) */}
            {authMode === 'login' && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select Your Portal Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    id="tab-role-student"
                    onClick={() => handleRoleChange('student')}
                    className={`flex flex-col sm:flex-row items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedRole === 'student'
                        ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mb-1 sm:mb-0" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    id="tab-role-doctor"
                    onClick={() => handleRoleChange('doctor')}
                    className={`flex flex-col sm:flex-row items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedRole === 'doctor'
                        ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 mb-1 sm:mb-0" />
                    <span>Doctor</span>
                  </button>

                  <button
                    type="button"
                    id="tab-role-pharmacist"
                    onClick={() => handleRoleChange('pharmacist')}
                    className={`flex flex-col sm:flex-row items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedRole === 'pharmacist'
                        ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Pill className="w-4 h-4 mb-1 sm:mb-0" />
                    <span>Pharmacy</span>
                  </button>

                  <button
                    type="button"
                    id="tab-role-admin"
                    onClick={() => handleRoleChange('admin')}
                    className={`flex flex-col sm:flex-row items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-1 sm:mb-0" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Authentication Notice</span>
                  {error}
                </div>
              </div>
            )}

            {/* MODE 1: LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {selectedRole === 'student' && 'BIT Roll Number / Student Register No'}
                    {selectedRole === 'doctor' && 'Medical Officer ID or Email'}
                    {selectedRole === 'pharmacist' && 'Dispensary Employee ID'}
                    {selectedRole === 'admin' && 'Health Admin Account ID'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="login-input-identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'student'
                          ? 'e.g. 7376231AD101'
                          : selectedRole === 'doctor'
                          ? 'e.g. DOC-101'
                          : selectedRole === 'pharmacist'
                          ? 'e.g. PHARM-01'
                          : 'e.g. ADMIN-01'
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Account Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-input-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white border-slate-300 text-teal-600 focus:ring-teal-600 focus:ring-offset-white"
                    />
                    <span className="text-xs text-slate-600">Keep me logged in on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to {selectedRole.toUpperCase()} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs border border-slate-300 shadow-xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign In with Google</span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-semibold border border-teal-200">
                    Firebase Auth
                  </span>
                </button>
              </form>
            ) : (
              /* MODE 2: STUDENT REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Register using your official BIT Student Roll / Register Number.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Student Register / Roll No *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        id="reg-input-roll"
                        value={regRollNumber}
                        onChange={(e) => setRegRollNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 7376231AD101"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Student Name *
                    </label>
                    <input
                      type="text"
                      id="reg-input-name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Kavitha M."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Academic Department
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hostel / Residential Block
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regHostel}
                        onChange={(e) => setRegHostel(e.target.value)}
                        placeholder="e.g. Thamarai Hostel - Block A"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Student BIT Email ID
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. kavitha.ad23@bitsathy.ac.in"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emergency Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Choose a password"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer mt-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Student Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Right Column: Campus & Portal Features Showcase */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Campus Info Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-teal-50 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center space-x-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>Bannari Amman Institute of Technology</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Integrated Campus Healthcare Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Streamlining outpatient appointments, emergency triage, doctor consultation notes, and pharmacy stock replenishment across all student hostels and campus faculties.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Student Register Number Auth:</span> Register & log in directly using your official BIT student register number.
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Instant Appointment Token:</span> Digital token booking with real-time OPD queue status.
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">AI Symptom Triage Assistant:</span> Smart preliminary health analysis powered by Gemini AI.
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Paperless Prescriptions:</span> Seamless doctor-to-pharmacy prescription dispensing.
                  </div>
                </div>
              </div>
            </div>

            {/* Health Center Emergency Callout */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">24/7 Campus Emergency Casualty</h4>
                <p className="text-xs text-rose-700">
                  For immediate acute care or ambulance requests, call Ext <strong className="text-rose-900">108</strong> or <strong className="text-rose-900">04295 226000</strong>.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-600 text-center">
        <p>BIT Student Health Center Management System • Sathyamangalam, Erode, Tamil Nadu 638401</p>
      </footer>
    </div>
  );
};
