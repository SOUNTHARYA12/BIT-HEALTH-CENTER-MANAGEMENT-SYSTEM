import React, { useState } from 'react';
import { Role, User } from '../types';
import { loginUser, registerStudent } from '../services/api';
import { authenticateWithGoogle } from '../services/firebaseService';
import wideHealthcarePoster from '../assets/images/wide_clean_modern_healthcare_promotional_poster.png';
import campusDoctorHero from '../assets/images/campus_doctor_hero.jpg';
import {
  HeartPulse,
  User as UserIcon,
  Stethoscope,
  Pill,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Calendar,
  Activity,
  Phone,
  MapPin,
  ChevronRight,
  UserPlus,
  LogIn,
  GraduationCap,
  Mail,
  Home,
  Copy,
  X,
  CheckCircle2,
  HelpCircle,
  Ambulance,
  Sparkles
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

  // Modals & Notices
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [activeFeatureModal, setActiveFeatureModal] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainNotice, setDomainNotice] = useState<{ hostname: string; projectId: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Direct login helper for admin during domain authorization
  const handleDirectAdminLogin = () => {
    const adminUser: User = {
      id: 'USR-ADM-01',
      username: 'ADMIN-01',
      name: 'Health Administrator',
      role: 'admin',
      department: 'Campus Medical Infrastructure & Governance',
      email: 'sountharyar.ad23@bitsathy.ac.in',
      phone: 'Ext 226000',
      roomNo: 'Health Administration Office (Ground Floor)',
      joinedDate: '2023-08-16'
    };
    const token = 'bit_token_admin_' + Date.now();
    if (rememberMe) {
      localStorage.setItem('bit_health_token', token);
      localStorage.setItem('bit_health_user', JSON.stringify(adminUser));
    } else {
      sessionStorage.setItem('bit_health_token', token);
      sessionStorage.setItem('bit_health_user', JSON.stringify(adminUser));
    }
    onLoginSuccess(adminUser);
  };

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
    setDomainNotice(null);
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
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setDomainNotice({
          hostname: err.hostname || window.location.hostname,
          projectId: 'gen-lang-client-0511153661'
        });
        setError(null);
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before finishing authentication.');
      } else {
        let msg = err?.message || 'Firebase Google authentication failed.';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error) msg = parsed.error;
        } catch (_) {}
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#edf5f7] text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* ========================================================= */}
      {/* LEFT COLUMN: ~45% Width (Brand, Centered Card, Copyright) */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[45%] xl:w-[44%] flex flex-col justify-between p-3.5 sm:p-5 lg:p-6 xl:p-8 bg-[#edf5f7] z-10">
        
        {/* Top Header Branding (Compact & Precisely Aligned) */}
        <header className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00897b] flex items-center justify-center text-white shadow-xs shrink-0">
            <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0a2540] leading-tight">
              BIT Health Center
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
              Student Medical Appointment &amp; Dispensary Control System
            </p>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-300 mx-1.5 shrink-0" />
          <div className="hidden sm:block text-[10px] font-semibold text-slate-700 max-w-[125px] leading-tight shrink-0">
            Bannari Amman Institute of Technology
          </div>
        </header>

        {/* Centered Login Card */}
        <div className="my-auto w-full flex items-center justify-center py-1 sm:py-2">
          <div className="w-full max-w-[460px] bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-6 shadow-[0_10px_35px_-8px_rgba(7,29,54,0.08)] border border-white">
            
            {/* Card Header */}
            {authMode === 'login' ? (
              <div className="mb-3">
                <span className="text-[#00897b] text-[11px] font-bold tracking-wide uppercase">
                  Welcome Back
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a2540] tracking-tight leading-snug mt-0.5">
                  Sign In to Your Health Portal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                  Access your health services, book appointments, manage prescriptions and more.
                </p>
              </div>
            ) : (
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 text-[11px] font-bold tracking-wide uppercase">
                    New Student Enrollment
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(null); }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a2540] tracking-tight leading-snug mt-0.5">
                  Create Student Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                  Register with your official BIT Student Roll / Register Number.
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-2.5 rounded-xl space-y-1 animate-fadeIn">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">
                    <span className="font-bold block">Notice</span>
                    {error}
                  </div>
                </div>
                {(error.toLowerCase().includes('already exists') || error.toLowerCase().includes('already registered')) && (
                  <div className="pt-1.5 border-t border-rose-200/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-rose-700">Account already exists.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setSelectedRole('student');
                        if (regRollNumber) setIdentifier(regRollNumber);
                        setError(null);
                      }}
                      className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-semibold cursor-pointer shrink-0"
                    >
                      Switch to Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Domain Authorization Notice */}
            {domainNotice && (
              <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs p-2.5 rounded-xl space-y-1.5 animate-fadeIn">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-amber-950 text-xs block">Firebase Authorized Domain Notice</span>
                    <p className="text-amber-800 text-[10px] leading-tight mt-0.5">
                      Preview domain required in Firebase Console Authorized Domains:
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-amber-300 rounded-lg p-1.5 flex items-center justify-between gap-1.5">
                  <code className="font-mono text-[10px] text-slate-800 break-all select-all">
                    {domainNotice.hostname}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(domainNotice.hostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2000);
                    }}
                    className="shrink-0 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="pt-1.5 border-t border-amber-200/80 flex flex-wrap gap-1.5 items-center">
                  <button
                    type="button"
                    onClick={handleDirectAdminLogin}
                    className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-[11px] cursor-pointer flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Continue as Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomainNotice(null)}
                    className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-[11px] border border-slate-300 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* ==================================== */}
            {/* MODE 1: LOGIN FORM                   */}
            {/* ==================================== */}
            {authMode === 'login' ? (
              <div>
                {/* Role Selector (Single Row on Desktop & Tablets) */}
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Your Portal Role
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Student */}
                    <button
                      type="button"
                      id="tab-role-student"
                      onClick={() => handleRoleChange('student')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRole === 'student'
                          ? 'bg-[#00897b] text-white shadow-xs ring-1 ring-[#00897b]'
                          : 'bg-[#e6f4f6] text-[#00695c] hover:bg-[#d8eef1]'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Student</span>
                    </button>

                    {/* Doctor */}
                    <button
                      type="button"
                      id="tab-role-doctor"
                      onClick={() => handleRoleChange('doctor')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRole === 'doctor'
                          ? 'bg-[#00897b] text-white shadow-xs ring-1 ring-[#00897b]'
                          : 'bg-[#e6f4f6] text-[#00695c] hover:bg-[#d8eef1]'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                      <span>Doctor</span>
                    </button>

                    {/* Pharmacy */}
                    <button
                      type="button"
                      id="tab-role-pharmacist"
                      onClick={() => handleRoleChange('pharmacist')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRole === 'pharmacist'
                          ? 'bg-[#00897b] text-white shadow-xs ring-1 ring-[#00897b]'
                          : 'bg-[#e6f4f6] text-[#00695c] hover:bg-[#d8eef1]'
                      }`}
                    >
                      <Pill className="w-3.5 h-3.5 shrink-0" />
                      <span>Pharmacy</span>
                    </button>

                    {/* Admin */}
                    <button
                      type="button"
                      id="tab-role-admin"
                      onClick={() => handleRoleChange('admin')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRole === 'admin'
                          ? 'bg-[#00897b] text-white shadow-xs ring-1 ring-[#00897b]'
                          : 'bg-[#e6f4f6] text-[#00695c] hover:bg-[#d8eef1]'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
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
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Password
                    </label>
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
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b] focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Keep logged in & Forgot password row */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#00897b] focus:ring-[#00897b] accent-[#00897b]"
                      />
                      <span className="text-xs text-slate-600">Keep me logged in on this device</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-[#00897b] hover:text-[#00695c] font-semibold cursor-pointer transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#00897b] to-[#00796b] hover:from-[#00796b] hover:to-[#00695c] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer mt-1"
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

                  {/* Divider */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                      <span className="bg-white px-2.5 text-slate-400 font-semibold">OR CONTINUE WITH</span>
                    </div>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    id="google-signin-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs border border-slate-200 shadow-2xs flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="font-semibold text-slate-700">Sign In with Google</span>
                    </div>
                    <span className="text-[10px] bg-[#e0f2f1] text-[#00796b] px-2 py-0.5 rounded font-bold border border-[#b2dfdb]">
                      Firebase Auth
                    </span>
                  </button>
                </form>

                {/* Bottom Student Registration Panel */}
                <div className="mt-2.5 bg-[#e6f4f6]/70 border border-[#cae8ec] rounded-xl p-2.5 flex items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#00897b] flex items-center justify-center shrink-0">
                      <UserPlus className="w-4 h-4 text-[#00897b]" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">New Student?</h4>
                      <p className="text-[10px] text-slate-500 leading-tight truncate">Register for BIT Health Center account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="switch-to-register-btn"
                    onClick={() => { setAuthMode('register'); setError(null); }}
                    className="shrink-0 px-2.5 py-1 bg-white border border-[#00897b] text-[#00897b] hover:bg-[#e0f2f1] font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>Student Register</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* ==================================== */
              /* MODE 2: STUDENT REGISTRATION FORM    */
              /* ==================================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-2">
                <div className="bg-[#e6f4f6] border border-[#cae8ec] p-2 rounded-xl text-[11px] text-[#00695c] flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-[#00897b] shrink-0" />
                  <span>Enter your official BIT roll number to create your health center record.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Student Roll / Register No *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        id="reg-input-roll"
                        value={regRollNumber}
                        onChange={(e) => setRegRollNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 7376231AD101"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Full Student Name *
                    </label>
                    <input
                      type="text"
                      id="reg-input-name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Kavitha M."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Academic Department
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                    >
                      <option value="Artificial Intelligence & Data Science">AI &amp; Data Science</option>
                      <option value="Computer Science & Engineering">Computer Science &amp; Engg</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics &amp; Comm</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engg</option>
                      <option value="Civil Engineering">Civil Engg</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Hostel / Residential Block
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={regHostel}
                        onChange={(e) => setRegHostel(e.target.value)}
                        placeholder="e.g. Thamarai Block A"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      BIT Student Email ID
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. roll@bitsathy.ac.in"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Emergency Phone No
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Choose a password"
                      className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00897b]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-[#00897b] hover:from-emerald-700 hover:to-[#00796b] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer mt-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(null); }}
                    className="text-xs text-[#00897b] hover:text-[#00695c] font-semibold cursor-pointer underline"
                  >
                    Already have an account? Sign in here
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Small Copyright Text at bottom of left column */}
        <footer className="text-[10px] sm:text-[11px] text-slate-400 text-center sm:text-left mt-2 pt-1 shrink-0">
          © 2025 BIT Health Center. All rights reserved.
        </footer>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: ~55% Width (Premium Healthcare Hero Section) */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[55%] xl:w-[56%] relative flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 bg-gradient-to-br from-[#f2f9fa] via-[#e9f4f6] to-[#ddf0f2] border-t lg:border-t-0 lg:border-l border-slate-200/80 overflow-hidden min-h-full">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00897b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header & Branding Section */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold text-[#00897b] tracking-wider uppercase mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00897b]"></span>
              <span>Bannari Amman Institute of Technology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#071d36]">Your Health, </span>
              <span className="bg-gradient-to-r from-[#00897b] via-[#00796b] to-[#004d40] bg-clip-text text-transparent">Our Priority</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg font-medium leading-relaxed">
              Comprehensive healthcare services for a healthier and brighter campus life.
            </p>
          </div>

          {/* Slogan in Elegant Handwritten Font (Upper-Right Corner) */}
          <div className="sm:text-right shrink-0 pt-0.5 sm:pt-1">
            <span
              style={{ fontFamily: "'Caveat', cursive" }}
              className="text-xl sm:text-2xl lg:text-[27px] text-[#00695c] font-bold block transform -rotate-1 select-none whitespace-nowrap drop-shadow-xs"
            >
              “Healthy Minds, Healthy Campus, Brighter Future”
            </span>
          </div>
        </div>

        {/* 2. Middle Hero Body: Four Large Service Cards (Left) + Prominent Doctor & Campus (Right) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 xl:gap-6 items-stretch flex-1 my-3 sm:my-4">
          
          {/* Four Healthcare Service Cards (2 x 2 grid with custom illustrations and balanced layouts) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 flex flex-col justify-between">
            {/* Card 1: 24/7 Emergency Support */}
            <div
              onClick={() => setActiveFeatureModal('emergency')}
              className="bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-teal-400 shadow-[0_4px_18px_-4px_rgba(7,29,54,0.07)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 group-hover:bg-[#00897b] text-[#00897b] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <Ambulance className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                    Active 24/7
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897b] transition-colors" />
                </div>
              </div>

              {/* Text on left, Illustration on right */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-sm sm:text-[15px] text-[#071d36] group-hover:text-[#00897b] transition-colors leading-snug">
                    24/7 Emergency Support
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Immediate ambulance assistance, anytime.
                  </p>
                </div>

                {/* Medical Shield & Ambulance Illustration */}
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/80 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Medical Shield */}
                    <path d="M32 6L48 12V28C48 40 32 54 32 54C32 54 16 40 16 28V12L32 6Z" fill="#E0F2F1" stroke="#00897B" strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Shield Cross Accent */}
                    <path d="M32 16V34M23 25H41" stroke="#00897B" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Mini Ambulance / Siren Pulse */}
                    <circle cx="44" cy="14" r="3.5" fill="#EF4444" />
                    <circle cx="44" cy="14" r="5" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" className="animate-ping origin-center" />
                    {/* Ambulance silhouette / badge */}
                    <rect x="25" y="38" width="14" height="8" rx="2" fill="#004D40" />
                    <circle cx="28" cy="46" r="1.5" fill="#00897B" />
                    <circle cx="36" cy="46" r="1.5" fill="#00897B" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Easy Appointments */}
            <div
              onClick={() => setActiveFeatureModal('appointments')}
              className="bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-teal-400 shadow-[0_4px_18px_-4px_rgba(7,29,54,0.07)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 group-hover:bg-[#00897b] text-[#00897b] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/70">
                    Instant Token
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897b] transition-colors" />
                </div>
              </div>

              {/* Text on left, Illustration on right */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-sm sm:text-[15px] text-[#071d36] group-hover:text-[#00897b] transition-colors leading-snug">
                    Easy Appointments
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Book your slot in minutes and save time.
                  </p>
                </div>

                {/* Appointment Calendar Illustration */}
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-100/80 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Calendar Base */}
                    <rect x="14" y="16" width="36" height="36" rx="6" fill="#FFFFFF" stroke="#00897B" strokeWidth="2.5" />
                    {/* Calendar Header Bar */}
                    <path d="M14 24C14 20.6863 16.6863 18 20 18H44C47.3137 18 50 20.6863 50 24V26H14V24Z" fill="#00897B" />
                    {/* Spiral rings */}
                    <line x1="22" y1="12" x2="22" y2="18" stroke="#004D40" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="42" y1="12" x2="42" y2="18" stroke="#004D40" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Calendar grid dots */}
                    <circle cx="23" cy="33" r="1.5" fill="#94A3B8" />
                    <circle cx="32" cy="33" r="1.5" fill="#94A3B8" />
                    <circle cx="41" cy="33" r="1.5" fill="#94A3B8" />
                    <circle cx="23" cy="41" r="1.5" fill="#94A3B8" />
                    {/* Highlighted Selected Slot with Checkmark */}
                    <rect x="29" y="38" width="15" height="11" rx="3" fill="#E0F2F1" stroke="#00897B" strokeWidth="1.5" />
                    <path d="M33 43.5L35.5 46L40 41.5" stroke="#00897B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 3: Medicine Management */}
            <div
              onClick={() => setActiveFeatureModal('medicine')}
              className="bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-teal-400 shadow-[0_4px_18px_-4px_rgba(7,29,54,0.07)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 group-hover:bg-[#00897b] text-[#00897b] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <Pill className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                    ● In Stock
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/70">
                    ✓ Expiry Checked
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897b] transition-colors" />
                </div>
              </div>

              {/* Text on left, Illustration on right */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-sm sm:text-[15px] text-[#071d36] group-hover:text-[#00897b] transition-colors leading-snug">
                    Medicine Management
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Safe • Stocked • Ready dispensary supplies
                  </p>
                </div>

                {/* Medicine Bottle & Tablet Illustration */}
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/80 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Bottle Cap */}
                    <rect x="23" y="14" width="14" height="5" rx="1.5" fill="#004D40" />
                    <rect x="25" y="19" width="10" height="3" fill="#80CBC4" />
                    {/* Bottle Body */}
                    <rect x="20" y="22" width="20" height="30" rx="5" fill="#E0F2F1" stroke="#00897B" strokeWidth="2.5" />
                    {/* Bottle Label & Cross */}
                    <rect x="24" y="29" width="12" height="14" rx="2" fill="#FFFFFF" />
                    <path d="M30 32V40M26 36H34" stroke="#00897B" strokeWidth="2" strokeLinecap="round" />
                    {/* Floating Tablet / Capsule on the right */}
                    <g transform="rotate(35 45 42)">
                      <rect x="42" y="34" width="8" height="16" rx="4" fill="#00897B" />
                      <rect x="42" y="42" width="8" height="8" rx="0" fill="#80CBC4" />
                      <rect x="42" y="34" width="8" height="16" rx="4" stroke="#004D40" strokeWidth="1.5" />
                    </g>
                    {/* Small round pill */}
                    <circle cx="16" cy="47" r="4.5" fill="#FFFFFF" stroke="#00897B" strokeWidth="2" />
                    <line x1="13" y1="47" x2="19" y2="47" stroke="#00897B" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 4: AI Health Triage */}
            <div
              onClick={() => setActiveFeatureModal('triage')}
              className="bg-white/95 hover:bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-teal-400 shadow-[0_4px_18px_-4px_rgba(7,29,54,0.07)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 group-hover:bg-[#00897b] text-[#00897b] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200/70">
                    Non-Diagnostic Guidance
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897b] transition-colors" />
                </div>
              </div>

              {/* Text on left, Illustration on right */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-sm sm:text-[15px] text-[#071d36] group-hover:text-[#00897b] transition-colors leading-snug">
                    AI Health Triage
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Get instant guidance for your symptoms.
                  </p>
                </div>

                {/* Friendly AI Healthcare Assistant Illustration */}
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100/80 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Bot Antenna with medical pulse */}
                    <line x1="32" y1="13" x2="32" y2="19" stroke="#00897B" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="32" cy="11" r="3" fill="#26A69A" />
                    {/* Bot Head */}
                    <rect x="18" y="19" width="28" height="24" rx="8" fill="#FFFFFF" stroke="#00897B" strokeWidth="2.5" />
                    {/* Ear headphones / sensors */}
                    <rect x="14" y="26" width="4" height="10" rx="2" fill="#00897B" />
                    <rect x="46" y="26" width="4" height="10" rx="2" fill="#00897B" />
                    {/* Visor / Face Area */}
                    <rect x="22" y="24" width="20" height="14" rx="4" fill="#E0F2F1" />
                    {/* Friendly glowing eyes */}
                    <circle cx="27" cy="30" r="2.2" fill="#00897B" />
                    <circle cx="37" cy="30" r="2.2" fill="#00897B" />
                    {/* Friendly smile */}
                    <path d="M29 34C30 35.5 34 35.5 35 34" stroke="#00897B" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Stethoscope on bot collar / body */}
                    <path d="M26 44V49C26 51 28 53 32 53C36 53 38 51 38 49V44" stroke="#004D40" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="32" cy="54" r="2" fill="#00897B" />
                    {/* Sparkle star */}
                    <path d="M46 16L47.2 19L50.2 20.2L47.2 21.4L46 24.4L44.8 21.4L41.8 20.2L44.8 19L46 16Z" fill="#00897B" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Doctor & Campus Visual (Enlarged, fills available height, clear presence) */}
          <div className="lg:col-span-5 relative flex flex-col">
            <div className="relative flex-1 min-h-[260px] sm:min-h-[300px] lg:min-h-[380px] xl:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_12px_36px_-6px_rgba(7,29,54,0.18)] border-2 border-white bg-white group">
              <img
                src={campusDoctorHero}
                alt="Doctor at BIT Campus Health Center"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              {/* Subtle Gradient Blend at Image Bottom with Resident Doctor badge */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071d36]/95 via-[#071d36]/65 to-transparent p-3.5 sm:p-4 pt-8 text-white">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-xs sm:text-sm font-bold leading-tight text-white">Campus Medical Officers</p>
                </div>
                <p className="text-[11px] sm:text-xs text-teal-200 font-medium leading-tight mt-0.5">
                  Resident Physicians &amp; Health Pavilion Staff
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Curved Deep Navy-Blue Footer */}
        <div className="relative z-10 bg-[#071d36] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-white shadow-lg border border-slate-800/80 overflow-hidden shrink-0 mt-2">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-700/60">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <HeartPulse className="w-3.5 h-3.5 text-[#26a69a]" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                BIT Student Health Center
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-teal-300 font-semibold tracking-wide">
              “Caring Today | Healthier Tomorrow”
            </span>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-[#26a69a] shrink-0" />
              <span>
                Emergency: <strong className="text-white">108</strong> · Line: <strong className="text-white">+91 4295 226000</strong>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#26a69a] shrink-0" />
              <span>BIT Campus, Sathyamangalam - 638 401</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL: FORGOT PASSWORD RECOVERY                           */}
      {/* ========================================================= */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-teal-700">
                <HelpCircle className="w-5 h-5 text-[#00897b]" />
                <h3 className="font-bold text-slate-900 text-base">Account Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3.5 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-teal-50 border border-teal-100 p-2.5 rounded-xl text-teal-900">
                <p className="font-semibold text-xs text-teal-950 mb-0.5">Student &amp; Staff Self-Service</p>
                Students can log in directly using their BIT Roll Number. If you forgot your password:
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span><strong>Campus Health Helpdesk:</strong> Visit the Health Center front desk (Ground Floor) with your BIT Student ID Card.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span><strong>Telephone Assistance:</strong> Call campus extension <strong className="text-slate-900">108</strong> or <strong className="text-slate-900">+91 4295 226000</strong>.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span><strong>Email Support:</strong> Send an official request from your <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">@bitsathy.ac.in</code> email to <a href="mailto:healthadmin@bitsathy.ac.in" className="text-[#00897b] underline font-semibold">healthadmin@bitsathy.ac.in</a>.</span>
                </div>
              </div>

              {/* Demo Test Credentials Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1">
                <span className="font-bold text-slate-800 block">Default System Access Credentials:</span>
                <div className="grid grid-cols-2 gap-1.5 text-slate-700">
                  <div><strong>Student:</strong> 7376231AD101 / <code className="text-teal-700">student123</code></div>
                  <div><strong>Doctor:</strong> DOC-101 / <code className="text-teal-700">doctor101</code></div>
                  <div><strong>Pharmacy:</strong> PHARM-01 / <code className="text-teal-700">pharm123</code></div>
                  <div><strong>Admin:</strong> ADMIN-01 / <code className="text-teal-700">admin123</code></div>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="px-4 py-1.5 bg-[#00897b] hover:bg-[#00796b] text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FEATURE DETAIL POPUP                               */}
      {/* ========================================================= */}
      {activeFeatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-[#00897b]">
                <Activity className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  {activeFeatureModal === 'emergency' && '24/7 Campus Emergency Support'}
                  {activeFeatureModal === 'appointments' && 'Campus Appointment Scheduling'}
                  {activeFeatureModal === 'medicine' && 'Medication Dispensary & Inventory'}
                  {activeFeatureModal === 'triage' && 'AI Health Triage (Non-Diagnostic)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeatureModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3.5 space-y-2.5 text-xs text-slate-600 leading-relaxed">
              {activeFeatureModal === 'emergency' && (
                <>
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 p-2.5 rounded-xl font-medium">
                    Immediate acute assistance and campus ambulance dispatch are active 24 hours a day, 7 days a week.
                  </div>
                  <p>
                    For acute distress, asthma attacks, sports injuries, or immediate medical evacuation:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Internal Campus Emergency Ext: <strong className="text-rose-700">108</strong></li>
                    <li>Direct Line: <strong className="text-slate-900">+91 4295 226000</strong></li>
                    <li>Casualty Unit: BIT Health Pavilion (Ground Floor)</li>
                  </ul>
                </>
              )}

              {activeFeatureModal === 'appointments' && (
                <>
                  <p>
                    Students and faculty can easily book real-time OPD consultation slots with our resident Chief Medical Officer, Pediatric Specialist, Dental Surgeon, and Mental Wellness Counselor.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Instant digital token generation</li>
                    <li>Live doctor queue tracking from your hostel</li>
                    <li>Automatic SMS &amp; portal notifications</li>
                  </ul>
                </>
              )}

              {activeFeatureModal === 'medicine' && (
                <>
                  <p>
                    Our fully stocked campus dispensary provides essential prescribed pharmaceuticals with continuous batch and expiry control:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Automated low-stock safety thresholds</li>
                    <li>Prescription barcode and digital dispensing</li>
                    <li>Emergency first-aid packs and antipyretics</li>
                  </ul>
                </>
              )}

              {activeFeatureModal === 'triage' && (
                <>
                  <div className="bg-teal-50 border border-teal-200 text-teal-900 p-2.5 rounded-xl font-medium">
                    Preliminary, Non-Diagnostic Guidance
                  </div>
                  <p>
                    The AI Health Triage provides initial symptom assessment and recommendations for clinic visits or self-care. It is strictly non-diagnostic and does not replace evaluation by a qualified medical practitioner.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Always consult the campus medical officer on duty for medical diagnoses and prescriptions.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveFeatureModal(null)}
                className="px-4 py-1.5 bg-[#00897b] hover:bg-[#00796b] text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
