import React, { useState, useEffect, useRef } from 'react';
import {
  Doctor,
  Appointment,
  Medicine,
  TriageResult,
  User,
  OnlineConsultation,
  ChatMessage
} from '../types';
import {
  fetchDoctors,
  bookAppointment,
  fetchAppointments,
  fetchInventory,
  runAITriage,
  fetchConsultations,
  requestOnlineConsultation,
  sendChatMessage,
  fetchChatMessages
} from '../services/api';
import {
  Calendar,
  Clock,
  UserCheck,
  Search,
  Pill,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  Clock3,
  User as UserIcon,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Home,
  Check,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface StudentPortalProps {
  currentUser?: User | null;
  targetTab?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser, targetTab }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'consultation' | 'prescriptions' | 'my_tokens' | 'pharmacy' | 'triage'>('book');

  useEffect(() => {
    if (targetTab && ['book', 'consultation', 'prescriptions', 'my_tokens', 'pharmacy', 'triage'].includes(targetTab)) {
      setActiveTab(targetTab as any);
    }
  }, [targetTab]);

  // Form State
  const [studentRoll, setStudentRoll] = useState(currentUser?.rollNumber || currentUser?.username || '7376231AD101');
  const [studentName, setStudentName] = useState(currentUser?.name || 'Kavitha M.');
  const [department, setDepartment] = useState(currentUser?.department || 'Artificial Intelligence & Data Science');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [phone, setPhone] = useState(currentUser?.phone || '9876543210');
  const [hostelBlock, setHostelBlock] = useState(currentUser?.hostelBlock || 'Thamarai Hostel - Block A');

  useEffect(() => {
    if (currentUser) {
      setStudentRoll(currentUser.rollNumber || currentUser.username || '7376231AD101');
      setStudentName(currentUser.name || 'Student');
      setDepartment(currentUser.department || 'General Engineering');
      if (currentUser.phone) {
        setPhone(currentUser.phone);
      }
      setHostelBlock(currentUser.hostelBlock || 'BIT Campus Hostel');
    }
  }, [currentUser]);

  // Physical Appointment State
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');

  // Loaded Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [pharmacyMedicines, setPharmacyMedicines] = useState<Medicine[]>([]);
  const [medSearch, setMedSearch] = useState('');

  // Online Consultation State
  const [consultations, setConsultations] = useState<OnlineConsultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<OnlineConsultation | null>(null);
  const [consultSubView, setConsultSubView] = useState<'request' | 'list'>('request');
  const [consultDoctorId, setConsultDoctorId] = useState('');
  const [consultSymptoms, setConsultSymptoms] = useState('');
  const [consultPreferredTime, setConsultPreferredTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState<OnlineConsultation | null>(null);
  const [consultError, setConsultError] = useState('');

  // Chat State
  const [chatMessageText, setChatMessageText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // AI Triage State
  const [triageSymptoms, setTriageSymptoms] = useState('');
  const [triageDuration, setTriageDuration] = useState('2 days');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);

  // Status & Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Doctors
  useEffect(() => {
    fetchDoctors()
      .then(data => {
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctorId(data[0].id);
          if (data[0].timeSlots && data[0].timeSlots.length > 0) {
            setSelectedTimeSlot(data[0].timeSlots[0]);
          }
          setConsultDoctorId(data[0].id);
        }
      })
      .catch(err => console.error('Error loading doctors:', err));
  }, []);

  const loadAppointments = () => {
    fetchAppointments({ rollNumber: studentRoll })
      .then(data => setMyAppointments(data))
      .catch(err => console.error('Error loading appointments:', err));
  };

  const loadConsultations = () => {
    fetchConsultations({ rollNumber: studentRoll })
    .then(data => {
        setConsultations(data);
        if (selectedConsultation) {
          const updated = data.find(c => c.id === selectedConsultation.id);
          if (updated) setSelectedConsultation(updated);
        }
      })
      .catch(err => console.error('Error loading consultations:', err));
  };

  useEffect(() => {
    loadAppointments();
    loadConsultations();
  }, [studentRoll, activeTab]);

  // Polling for live chat & consultation status when active
  useEffect(() => {
    if (activeTab === 'consultation') {
      const interval = setInterval(() => {
        loadConsultations();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedConsultation?.id, studentRoll]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (selectedConsultation && selectedConsultation.messages) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConsultation?.messages?.length]);

  // Load Pharmacy Inventory when search tab active
  useEffect(() => {
    if (activeTab === 'pharmacy') {
      fetchInventory({ search: medSearch })
        .then(data => setPharmacyMedicines(data))
        .catch(err => console.error('Error loading pharmacy inventory:', err));
    }
  }, [activeTab, medSearch]);

  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find(d => d.id === docId);
    if (doc && doc.timeSlots.length > 0) {
      setSelectedTimeSlot(doc.timeSlots[0]);
    }
  };

  // Physical Appointment Submit
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedDoctorId || !appointmentDate || !selectedTimeSlot || !chiefComplaint) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await bookAppointment({
        studentName,
        rollNumber: studentRoll,
        department,
        gender,
        phone,
        hostelBlock,
        doctorId: selectedDoctorId,
        appointmentDate,
        timeSlot: selectedTimeSlot,
        chiefComplaint,
        urgency
      });

      setBookingSuccess(created);
      setIsSubmitting(false);
      setChiefComplaint('');
      loadAppointments();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to book appointment.');
      setIsSubmitting(false);
    }
  };

  // Online Consultation Request Submit
  const handleConsultRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultError('');
    if (!consultDoctorId || !consultSymptoms.trim()) {
      setConsultError('Please select a doctor and describe your symptoms/health concern.');
      return;
    }

    setIsConsultSubmitting(true);
    try {
      const created = await requestOnlineConsultation({
        studentName,
        studentRoll,
        department,
        gender,
        phone,
        hostelBlock,
        doctorId: consultDoctorId,
        healthConcern: consultSymptoms.trim(),
        preferredTime: consultPreferredTime
      });

      setConsultSuccess(created);
      setIsConsultSubmitting(false);
      setConsultSymptoms('');
      loadConsultations();
      setSelectedConsultation(created);
      setConsultSubView('list');
    } catch (err: any) {
      setConsultError(err.message || 'Failed to submit online consultation request.');
      setIsConsultSubmitting(false);
    }
  };

  // Send Chat Message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation || !chatMessageText.trim() || isSendingChat) return;

    const textToSend = chatMessageText.trim();
    setChatMessageText('');
    setIsSendingChat(true);

    try {
      await sendChatMessage(selectedConsultation.id, {
        senderId: studentRoll,
        senderName: studentName,
        senderRole: 'student',
        message: textToSend
      });
      loadConsultations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageSymptoms.trim()) return;

    setIsTriaging(true);
    setTriageResult(null);
    try {
      const result = await runAITriage({
        symptoms: triageSymptoms,
        duration: triageDuration,
        gender
      });
      setTriageResult(result);
    } catch (err) {
      console.error('Triage failed:', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId);
  const selectedConsultDoc = doctors.find(d => d.id === consultDoctorId);

  // Status helper for consultations
  const getConsultationStatusBadge = (status: OnlineConsultation['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock3 className="w-3 h-3 mr-1" />
            Pending Doctor Review
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted - Ready for Chat
          </span>
        );
      case 'in_consultation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
            <MessageSquare className="w-3 h-3 mr-1" />
            In Consultation (Live)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  // Collect all prescriptions
  const allPrescriptions: Array<{
    source: 'physical' | 'online';
    refId: string;
    doctorName: string;
    date: string;
    items: Array<{
      medicineName: string;
      dosage: string;
      duration: string | number;
      instructions?: string;
      dispensed?: boolean;
    }>;
    notes?: string;
  }> = [];

  // From appointments
  myAppointments.forEach(apt => {
    if (apt.prescriptions && apt.prescriptions.length > 0) {
      allPrescriptions.push({
        source: 'physical',
        refId: apt.tokenNumber,
        doctorName: apt.doctorName,
        date: apt.appointmentDate,
        items: apt.prescriptions.map(p => ({
          medicineName: p.medicineName,
          dosage: p.dosage,
          duration: `${p.durationDays} days`,
          dispensed: p.dispensed
        })),
        notes: apt.doctorNotes
      });
    }
  });

  // From online consultations
  consultations.forEach(c => {
    if (c.prescriptions && c.prescriptions.length > 0) {
      allPrescriptions.push({
        source: 'online',
        refId: c.consultationNumber,
        doctorName: c.doctorName,
        date: c.createdAt.split('T')[0],
        items: c.prescriptions.map(p => ({
          medicineName: p.medicineName,
          dosage: `${p.dosage} • ${p.frequency}`,
          duration: p.duration,
          instructions: p.instructions,
          dispensed: p.dispensed
        })),
        notes: c.doctorNotes
      });
    }
  });

  const activeConsultationsCount = consultations.filter(c => c.status === 'in_consultation' || c.status === 'accepted' || c.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-7">
      
      {/* ======================================================== */}
      {/* 1. STUDENT IDENTITY & HEALTH PROFILE BANNER               */}
      {/* ======================================================== */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00897b] via-teal-500 to-emerald-500" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Avatar, Name, Roll & Campus Metadata */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#00897b] text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0a2540] tracking-tight leading-tight">
                  {studentName}
                </h2>
                <span className="bg-slate-100 text-teal-800 font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {studentRoll}
                </span>
                <span className="hidden sm:inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  Active Student Record
                </span>
              </div>

              {/* Metadata row with clean icons */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center">
                  <Building2 className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
                  <span className="text-slate-700">{department}</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center">
                  <Home className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
                  <span className="text-slate-700">{hostelBlock}</span>
                </span>
                {phone && (
                  <>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center">
                      <Phone className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
                      <span className="text-slate-700 font-mono">{phone}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Verified Health Record Badge & Quick Counts */}
          <div className="flex flex-wrap items-center gap-2.5 lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex items-center space-x-2 text-xs bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200 text-teal-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#00897b]" />
              <span>Verified Health ID</span>
            </div>

            <div className="flex items-center space-x-3 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600">
              <span>Tokens: <strong className="text-[#0a2540]">{myAppointments.length}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Rx Orders: <strong className="text-[#0a2540]">{allPrescriptions.length}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. FOUR APPOINTMENT & ACTION CARDS                        */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Book Physical Appointment */}
        <button
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          className={`h-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
            activeTab === 'book'
              ? 'bg-teal-50/50 border-[#00897b] shadow-xs ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#00897b] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-[#00897b]" />
              </span>
              <span className="text-[10px] uppercase font-bold text-[#00897b] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                In-Person OPD
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-[#0a2540] group-hover:text-[#00897b] transition-colors">
              Book Physical Visit
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Schedule consultation &amp; receive digital clinic queue token.
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00897b]">
            <span>Schedule OPD Visit</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Card 2: Online Doctor Consultation */}
        <button
          onClick={() => { setActiveTab('consultation'); setConsultSuccess(null); }}
          className={`h-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group relative ${
            activeTab === 'consultation'
              ? 'bg-teal-50/50 border-[#00897b] shadow-xs ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </span>
              <div className="flex items-center space-x-1">
                {activeConsultationsCount > 0 && (
                  <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                    {activeConsultationsCount} Active
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Online
                </span>
              </div>
            </div>
            <h4 className="font-extrabold text-sm text-[#0a2540] group-hover:text-blue-700 transition-colors">
              Online Consultation
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Live text chat with campus doctors directly from hostel.
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>{activeConsultationsCount > 0 ? 'Open Active Room' : 'Start Consultation'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Card 3: Prescriptions */}
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`h-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
            activeTab === 'prescriptions'
              ? 'bg-teal-50/50 border-[#00897b] shadow-xs ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-purple-600" />
              </span>
              <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                Prescriptions
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-[#0a2540] group-hover:text-purple-700 transition-colors">
              Medical Prescriptions
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              View official dosage orders &amp; free dispensary pickup slips.
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>{allPrescriptions.length} Records Available</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Card 4: Appointment History / Tokens */}
        <button
          onClick={() => setActiveTab('my_tokens')}
          className={`h-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
            activeTab === 'my_tokens'
              ? 'bg-teal-50/50 border-[#00897b] shadow-xs ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5 text-emerald-700" />
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Token Log
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-[#0a2540] group-hover:text-emerald-700 transition-colors">
              Appointment History
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track live queue status, consultation notes &amp; tokens.
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>{myAppointments.length} Tokens Logged</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>

      {/* ======================================================== */}
      {/* 3. HORIZONTAL NAVIGATION TABS                             */}
      {/* ======================================================== */}
      <nav className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex items-center overflow-x-auto gap-1.5">
        <button
          id="student-tab-book"
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'book'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/70 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#00897b]" />
          <span>Book Physical Appointment</span>
        </button>

        <button
          id="student-tab-consultation"
          onClick={() => { setActiveTab('consultation'); setConsultSuccess(null); }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'consultation'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/70 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Online Doctor Consultation</span>
          {activeConsultationsCount > 0 && (
            <span className="bg-[#00897b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeConsultationsCount}
            </span>
          )}
        </button>

        <button
          id="student-tab-prescriptions"
          onClick={() => setActiveTab('prescriptions')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'prescriptions'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/70 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Prescriptions</span>
          {allPrescriptions.length > 0 && (
            <span className="bg-slate-200/80 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {allPrescriptions.length}
            </span>
          )}
        </button>

        <button
          id="student-tab-tokens"
          onClick={() => setActiveTab('my_tokens')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'my_tokens'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/70 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Appointment History</span>
          {myAppointments.length > 0 && (
            <span className="bg-teal-50 text-teal-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-teal-200">
              {myAppointments.length}
            </span>
          )}
        </button>

        <button
          id="student-tab-pharmacy"
          onClick={() => setActiveTab('pharmacy')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'pharmacy'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/70 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Pill className="w-4 h-4 text-teal-600" />
          <span>Dispensary Search</span>
        </button>

        <button
          id="student-tab-triage"
          onClick={() => setActiveTab('triage')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'triage'
              ? 'bg-white text-amber-900 shadow-xs border border-slate-200/70 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>AI Health Triage</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* TAB 1: BOOK PHYSICAL APPOINTMENT                          */}
      {/* ======================================================== */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-start">
          
          {/* Main Appointment Form Column (~2/3 width) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs">
            {bookingSuccess ? (
              <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block">
                    Appointment Successfully Booked!
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] mt-1 font-mono">
                    Token: {bookingSuccess.tokenNumber}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Scheduled for <strong>{bookingSuccess.doctorName}</strong> on <strong>{bookingSuccess.appointmentDate}</strong> at <strong>{bookingSuccess.timeSlot}</strong>
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 text-left text-xs space-y-2.5 max-w-md mx-auto text-slate-700 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Student Patient:</span>
                    <span className="font-bold text-slate-900">{bookingSuccess.studentName} ({bookingSuccess.rollNumber})</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-800">{bookingSuccess.department}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Chief Concern:</span>
                    <span className="font-medium text-amber-800">{bookingSuccess.chiefComplaint}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Token Status:</span>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide">
                      {bookingSuccess.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-3">
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Book Another Appointment
                  </button>
                  <button
                    onClick={() => setActiveTab('my_tokens')}
                    className="px-5 py-2.5 bg-[#00897b] hover:bg-[#00796b] text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <span>View Live Token Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0a2540] tracking-tight leading-snug">
                    Schedule In-Person Medical Appointment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Book an in-person physical consultation with BIT campus medical officers.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section 1: Patient Identity & Campus Verification */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00897b] flex items-center justify-center text-[11px] font-bold">1</span>
                    <span>Student Verification Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Student Roll Number *</label>
                      <input
                        type="text"
                        value={studentRoll}
                        onChange={e => setStudentRoll(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Student Name *</label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel / Residential Block *</label>
                      <input
                        type="text"
                        value={hostelBlock}
                        onChange={e => setHostelBlock(e.target.value)}
                        placeholder="e.g. Thamarai Hostel Block A"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Medical Officer Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00897b] flex items-center justify-center text-[11px] font-bold">2</span>
                      <span>Select Medical Officer / Specialist *</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{doctors.length} doctors available</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctors.map(doc => {
                      const isSelected = selectedDoctorId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleDoctorChange(doc.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-teal-50/70 border-[#00897b] ring-2 ring-teal-500/20 text-slate-900 shadow-xs'
                              : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 pr-2">
                              <h4 className="font-extrabold text-xs sm:text-sm text-[#0a2540] truncate">{doc.name}</h4>
                              <p className="text-xs text-[#00897b] font-semibold mt-0.5 truncate">{doc.specialization}</p>
                              <p className="text-[11px] text-slate-500 mt-1 flex items-center">
                                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                <span className="truncate">{doc.roomNo}</span>
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  doc.currentStatus === 'available'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {doc.currentStatus}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-[#00897b] text-white flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Consultation Schedule (Date & Preferred Time Slot) */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00897b] flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>Consultation Date &amp; Time Slot</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={e => setAppointmentDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot *</label>
                      <select
                        value={selectedTimeSlot}
                        onChange={e => setSelectedTimeSlot(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                        required
                      >
                        {selectedDoctorObj?.timeSlots.map(slot => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        )) || (
                          <option value="09:00 AM">09:00 AM</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Symptoms & Urgency Classification */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00897b] flex items-center justify-center text-[11px] font-bold">4</span>
                    <span>Symptoms &amp; Clinical Urgency</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chief Symptoms / Reason for Visit *
                    </label>
                    <textarea
                      rows={3}
                      value={chiefComplaint}
                      onChange={e => setChiefComplaint(e.target.value)}
                      placeholder="Describe your health symptoms (e.g. fever of 100°F, throat irritation, severe abdominal pain, sports sprain)..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Urgency Classification
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <label
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all text-xs font-semibold ${
                          urgency === 'normal'
                            ? 'bg-teal-50 border-[#00897b] text-teal-900 ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="normal"
                          checked={urgency === 'normal'}
                          onChange={() => setUrgency('normal')}
                          className="sr-only"
                        />
                        <span className="block font-bold">Normal OPD</span>
                        <span className="text-[10px] text-slate-500 font-normal">Routine checkup</span>
                      </label>

                      <label
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all text-xs font-semibold ${
                          urgency === 'urgent'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="urgent"
                          checked={urgency === 'urgent'}
                          onChange={() => setUrgency('urgent')}
                          className="sr-only"
                        />
                        <span className="block font-bold">Urgent Care</span>
                        <span className="text-[10px] text-slate-500 font-normal">Acute discomfort</span>
                      </label>

                      <label
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all text-xs font-semibold ${
                          urgency === 'emergency'
                            ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="emergency"
                          checked={urgency === 'emergency'}
                          onChange={() => setUrgency('emergency')}
                          className="sr-only"
                        />
                        <span className="block font-bold">Emergency</span>
                        <span className="text-[10px] text-slate-500 font-normal">Casualty bay</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Confirm & Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#00897b] to-[#00796b] hover:from-[#00796b] hover:to-[#00695c] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-xs hover:shadow-md text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating OPD Token...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirm &amp; Generate Physical OPD Token →</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Health Center Guidelines & Quick Panels (~1/3 width) */}
          <div className="space-y-4">
            
            {/* Guidelines Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-xs text-slate-900 space-y-3.5">
              <div className="flex items-center space-x-2.5 text-[#00897b]">
                <Stethoscope className="w-5 h-5 shrink-0" />
                <h3 className="font-extrabold text-sm text-[#0a2540]">
                  Campus OPD Guidelines
                </h3>
              </div>

              <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span>Carry your official <strong>BIT Student ID Card</strong> for queue verification.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span>All prescribed dispensary medicines are <strong>100% Free</strong> for BIT students.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span>Arrive <strong>5 minutes prior</strong> to your selected time slot.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                  <span>Tokens are called sequentially on the clinic digital lobby screen.</span>
                </li>
              </ul>
            </div>

            {/* Quick Online Consultation Teaser */}
            <div className="bg-gradient-to-br from-blue-50/70 to-teal-50/50 border border-blue-200/80 rounded-2xl sm:rounded-3xl p-5 shadow-xs text-slate-900 space-y-3">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wide">
                <MessageSquare className="w-4 h-4" />
                <span>Need Quick Doctor Advice?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Skip the clinic walk for mild symptoms. Chat directly with campus physicians right from your hostel room.
              </p>
              <button
                type="button"
                onClick={() => { setActiveTab('consultation'); setConsultSubView('request'); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
              >
                <span>Launch Online Consultation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Emergency Helpline Callout */}
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 space-y-1.5 shadow-2xs">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-800">
                <ShieldAlert className="w-4 h-4 animate-pulse text-rose-600" />
                <span>24/7 Campus Emergency Casualty</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                For acute trauma, asthma, or emergency ambulance dispatch: dial <strong>Ext 108</strong> or <strong>+91 4295 226000</strong>.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ONLINE DOCTOR CONSULTATION                         */}
      {/* ======================================================== */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Online Consultation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-[#0a2540] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Online Doctor Consultation Room
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consult qualified BIT campus medical officers directly from your hostel or device.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setConsultSubView('request'); setSelectedConsultation(null); setConsultSuccess(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  consultSubView === 'request' && !selectedConsultation
                    ? 'bg-[#00897b] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                + Request New Consultation
              </button>

              <button
                onClick={() => { setConsultSubView('list'); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  consultSubView === 'list' || selectedConsultation
                    ? 'bg-[#00897b] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>My Consultations</span>
                <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {consultations.length}
                </span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: REQUEST NEW CONSULTATION */}
          {consultSubView === 'request' && !selectedConsultation && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Consultation Request Form */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs">
                {consultSuccess ? (
                  <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                        Online Consultation Request Submitted!
                      </span>
                      <h3 className="text-2xl font-extrabold text-[#0a2540] mt-1 font-mono">Ref: {consultSuccess.consultationNumber}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Assigned to <strong>{consultSuccess.doctorName}</strong> • Slot: {consultSuccess.preferredTime}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto text-slate-700 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Status:</span>
                        {getConsultationStatusBadge(consultSuccess.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Student:</span>
                        <span className="font-bold text-slate-900">{consultSuccess.studentName} ({consultSuccess.studentRoll})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Reported Symptoms:</span>
                        <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{consultSuccess.healthConcern}</p>
                      </div>
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => {
                          setSelectedConsultation(consultSuccess);
                          setConsultSubView('list');
                        }}
                        className="px-5 py-2.5 bg-[#00897b] hover:bg-[#00796b] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Live Consultation Room</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConsultRequestSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#0a2540]">Request an Online Doctor Consultation</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Describe your symptoms to connect with an on-duty medical officer.</p>
                    </div>

                    {consultError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                        <span>{consultError}</span>
                      </div>
                    )}

                    {/* Student Basic Info Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500">Consulting Student:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{studentName} ({studentRoll})</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Department &amp; Hostel:</span>
                        <div className="text-slate-700 mt-0.5">{department} • {hostelBlock}</div>
                      </div>
                    </div>

                    {/* Doctor Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        1. Select Doctor / Medical Officer *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doctors.map(doc => (
                          <div
                            key={doc.id}
                            onClick={() => setConsultDoctorId(doc.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              consultDoctorId === doc.id
                                ? 'bg-teal-50/80 border-[#00897b] ring-2 ring-teal-500/20 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 pr-2">
                                <h4 className="font-bold text-xs text-[#0a2540] truncate">{doc.name}</h4>
                                <p className="text-[11px] text-[#00897b] font-semibold mt-0.5 truncate">{doc.specialization}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{doc.qualification}</p>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  doc.currentStatus === 'available'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {doc.currentStatus.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Health Concern / Symptoms */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          2. Health Concern &amp; Symptoms *
                        </label>
                        <span className="text-[10px] text-slate-500">Provide details for the doctor</span>
                      </div>
                      <textarea
                        rows={3}
                        value={consultSymptoms}
                        onChange={e => setConsultSymptoms(e.target.value)}
                        placeholder="Explain your symptoms, duration, and how you feel (e.g., headache for 2 days, mild fever, throat irritation)..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                        required
                      />

                      {/* Quick Symptom Chips */}
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-slate-500 font-medium mr-1">Quick add:</span>
                        {[
                          'Mild fever & chills',
                          'Dry cough & sore throat',
                          'Headache & fatigue',
                          'Stomach pain & nausea',
                          'Skin irritation or rash',
                          'Eye redness or itching'
                        ].map(chip => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setConsultSymptoms(prev => prev ? `${prev}, ${chip}` : chip);
                            }}
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Consultation Time */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        3. Preferred Consultation Time Slot
                      </label>
                      <select
                        value={consultPreferredTime}
                        onChange={e => setConsultPreferredTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      >
                        <option value="Immediate / As soon as possible">Immediate / As soon as doctor is available</option>
                        <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                        <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                        <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                        <option value="Night / Emergency Duty (After 08:00 PM)">Night / Emergency Duty (After 08:00 PM)</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isConsultSubmitting}
                      className="w-full bg-gradient-to-r from-[#00897b] to-[#00796b] hover:from-[#00796b] hover:to-[#00695c] text-white font-bold py-3 rounded-xl transition-all shadow-xs text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isConsultSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>Submit Online Consultation Request →</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Information Side Panel */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-[#0a2540] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00897b]" />
                    How Online Consultation Works
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                    <li><strong className="text-slate-800">Submit Request:</strong> Select symptoms &amp; doctor.</li>
                    <li><strong className="text-slate-800">Doctor Accepts:</strong> On-duty medical officer joins session.</li>
                    <li><strong className="text-slate-800">Live Chat:</strong> Secure real-time chat with the doctor.</li>
                    <li><strong className="text-slate-800">Free Medicine:</strong> Collect free prescribed meds at dispensary.</li>
                  </ol>
                </div>

                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    Notice
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Online consultation is for non-critical, mild ailments. For acute emergencies, call <strong>Ext 108</strong> or visit campus casualty immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: MY CONSULTATIONS LIST & LIVE CHAT ROOM */}
          {(consultSubView === 'list' || selectedConsultation) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: List of Consultations */}
              <div className="lg:col-span-4 space-y-2.5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    My Consultations ({consultations.length})
                  </h4>
                  <button
                    onClick={loadConsultations}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    title="Refresh consultations"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {consultations.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                    No online consultations found. Click &ldquo;+ Request New Consultation&rdquo; above.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {consultations.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedConsultation(c)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedConsultation?.id === c.id
                            ? 'bg-teal-50/80 border-[#00897b] shadow-xs ring-1 ring-[#00897b]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-mono text-xs font-bold text-teal-800">{c.consultationNumber}</span>
                          {getConsultationStatusBadge(c.status)}
                        </div>
                        <h5 className="font-bold text-xs text-[#0a2540]">{c.doctorName}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{c.healthConcern}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.messages && c.messages.length > 0 && (
                            <span className="flex items-center text-teal-700 font-semibold">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {c.messages.length} messages
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Live Chat Room */}
              <div className="lg:col-span-8">
                {selectedConsultation ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col h-[620px] overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00897b] text-white flex items-center justify-center font-bold">
                          <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-[#0a2540]">{selectedConsultation.doctorName}</h4>
                            <span className="font-mono text-xs text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded font-semibold">
                              {selectedConsultation.consultationNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Preferred Slot: {selectedConsultation.preferredTime || 'Standard OPD'}
                          </p>
                        </div>
                      </div>
                      <div>
                        {getConsultationStatusBadge(selectedConsultation.status)}
                      </div>
                    </div>

                    {/* Reported Concern Banner */}
                    <div className="bg-teal-50/50 px-4 py-2 border-b border-teal-100 text-xs text-slate-700 flex items-start space-x-2">
                      <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-teal-900">Reported Concern: </strong>
                        <span>{selectedConsultation.healthConcern}</span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                      {(!selectedConsultation.messages || selectedConsultation.messages.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6 space-y-2">
                          <MessageSquare className="w-10 h-10 text-slate-300" />
                          <p className="font-bold text-slate-700">Consultation Session Active</p>
                          <p className="text-[11px] max-w-sm">
                            {selectedConsultation.status === 'pending'
                              ? 'Waiting for doctor to accept. Once accepted, messaging unlocks immediately.'
                              : 'Type a message below to discuss your symptoms with the medical officer.'}
                          </p>
                        </div>
                      ) : (
                        selectedConsultation.messages.map(msg => {
                          const isMe = msg.senderRole === 'student';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center space-x-1.5 mb-1 px-1">
                                <span className="text-[10px] font-bold text-slate-600">
                                  {isMe ? 'You' : msg.senderName}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs shadow-2xs leading-relaxed ${
                                  isMe
                                    ? 'bg-[#00897b] text-white rounded-tr-none'
                                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={handleSendChatMessage}
                      className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={chatMessageText}
                        onChange={e => setChatMessageText(e.target.value)}
                        disabled={selectedConsultation.status === 'rejected' || selectedConsultation.status === 'completed'}
                        placeholder={
                          selectedConsultation.status === 'rejected'
                            ? 'Consultation is closed.'
                            : selectedConsultation.status === 'completed'
                            ? 'Consultation is concluded.'
                            : 'Type your message to the doctor...'
                        }
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none disabled:bg-slate-100"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessageText.trim() || isSendingChat || selectedConsultation.status === 'rejected' || selectedConsultation.status === 'completed'}
                        className="bg-[#00897b] hover:bg-[#00796b] disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        {isSendingChat ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-3">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700">No Consultation Selected</h4>
                    <p className="max-w-md mx-auto">
                      Choose a consultation from the list on the left to enter the doctor consultation room and chat.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PRESCRIPTIONS & MEDICATION ORDERS                  */}
      {/* ======================================================== */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-[#0a2540] flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                My Prescriptions &amp; Medication Orders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official digital prescriptions from physical OPD visits and online consultations.
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl self-start sm:self-auto">
              100% Free Campus Dispensary
            </span>
          </div>

          {allPrescriptions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No Prescriptions Issued Yet</p>
              <p>When a campus doctor prescribes medication after consultation, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPrescriptions.map((rxGroup, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {rxGroup.source === 'online' ? 'Online Consultation' : 'Physical OPD'} • Ref: {rxGroup.refId}
                      </span>
                      <h4 className="font-bold text-sm text-[#0a2540] mt-0.5">Prescribed by {rxGroup.doctorName}</h4>
                      <p className="text-xs text-slate-500">Date: {rxGroup.date}</p>
                    </div>
                    <span className="bg-teal-50 text-teal-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-teal-200">
                      BIT-HEALTH-RX
                    </span>
                  </div>

                  {rxGroup.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                      Doctor Advice: {rxGroup.notes}
                    </div>
                  )}

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Medications ({rxGroup.items.length}):
                    </span>
                    {rxGroup.items.map((item, i) => (
                      <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{item.medicineName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.dispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.dispensed ? 'Dispensed' : 'Ready at Dispensary'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <span>Dosage: <strong className="text-teal-800">{item.dosage}</strong></span>
                          <span className="mx-2">•</span>
                          <span>Duration: <strong>{item.duration}</strong></span>
                        </div>
                        {item.instructions && (
                          <div className="text-[10px] text-teal-700 italic">{item.instructions}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
                    <span>Counter: Main Health Dispensary</span>
                    <span className="text-emerald-700 font-semibold">Free Campus Supply</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: APPOINTMENT HISTORY & TOKEN TRACKER               */}
      {/* ======================================================== */}
      {activeTab === 'my_tokens' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-[#0a2540]">My In-Person Appointments &amp; Token History</h3>
              <p className="text-xs text-slate-500">Track physical token queue status, vitals, and diagnosis records.</p>
            </div>
            <button
              onClick={loadAppointments}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Status
            </button>
          </div>

          {myAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-xs">
              No appointments found for Roll Number <span className="font-mono text-teal-700 font-bold">{studentRoll}</span>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-slate-900 space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Token Number</span>
                      <h4 className="text-xl font-bold text-teal-800 font-mono">{apt.tokenNumber}</h4>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        apt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : apt.status === 'in_consultation'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : apt.status === 'waiting'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medical Officer:</span>
                      <span className="font-bold text-slate-900">{apt.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date &amp; Slot:</span>
                      <span className="text-teal-800 font-semibold">{apt.appointmentDate} ({apt.timeSlot})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Symptoms:</span>
                      <span className="text-slate-800">{apt.chiefComplaint}</span>
                    </div>
                  </div>

                  {apt.diagnosis && (
                    <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-xl text-xs space-y-1.5">
                      <div className="font-bold text-teal-900 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Clinical Diagnosis &amp; Notes
                      </div>
                      <p className="text-slate-800 font-medium">{apt.diagnosis}</p>
                      {apt.doctorNotes && <p className="text-slate-500 text-[11px] italic">{apt.doctorNotes}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PHARMACY DISPENSARY SEARCH                        */}
      {/* ======================================================== */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-[#0a2540]">BIT Campus Pharmacy Stock Search</h3>
              <p className="text-xs text-slate-500">Search available medicines, generic compositions, and rack locations.</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={medSearch}
                onChange={e => setMedSearch(e.target.value)}
                placeholder="Search Paracetamol, Dolo, Cetirizine..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacyMedicines.map(med => (
              <div
                key={med.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 text-slate-900 shadow-xs space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#0a2540]">{med.name}</h4>
                    <p className="text-xs text-slate-500 italic">{med.genericName}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-teal-800 px-2 py-0.5 rounded border border-slate-200">
                    {med.category}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-100">
                  <span className="text-slate-500">Available Stock:</span>
                  <span
                    className={`font-mono font-bold ${
                      med.stockQuantity > med.minThreshold
                        ? 'text-emerald-700'
                        : med.stockQuantity > 0
                        ? 'text-amber-700 font-bold'
                        : 'text-rose-700 font-bold'
                    }`}
                  >
                    {med.stockQuantity} {med.unit}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Rack Location: {med.locationRack}</span>
                  <span className="text-emerald-700 font-semibold">100% Free Campus Supply</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: AI HEALTH TRIAGE ASSISTANT                        */}
      {/* ======================================================== */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs text-slate-900 space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-extrabold text-[#0a2540]">AI Health Triage Assistant</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Receive instant preliminary triage advice and doctor department recommendations.
              </p>
            </div>

            <form onSubmit={handleRunTriage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Describe Symptoms *</label>
                <textarea
                  rows={4}
                  value={triageSymptoms}
                  onChange={e => setTriageSymptoms(e.target.value)}
                  placeholder="e.g. fever of 101°F with body aches and throat pain since yesterday..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Symptom Duration</label>
                <input
                  type="text"
                  value={triageDuration}
                  onChange={e => setTriageDuration(e.target.value)}
                  placeholder="e.g. 2 days"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isTriaging || !triageSymptoms.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isTriaging ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Triage Check</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Triage Output Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs text-slate-900">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Triage Assessment Result</h4>

            {isTriaging ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">AI is evaluating health parameters...</p>
              </div>
            ) : triageResult ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-bold text-amber-900">{triageResult.category}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Urgency Level:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        triageResult.urgency.includes('High')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : triageResult.urgency === 'Moderate'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {triageResult.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Recommended Specialist:</span>
                    <span className="font-bold text-teal-700">{triageResult.recommendedSpecialization}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 block">Guidance &amp; Advice:</span>
                  <p className="text-slate-700 leading-relaxed">{triageResult.advice}</p>
                </div>

                {triageResult.redFlags && triageResult.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-rose-200 p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-rose-700 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Warning Signs:
                    </span>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1">
                      {triageResult.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('book')}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Book Physical OPD
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('consultation');
                      setConsultSubView('request');
                      setConsultSymptoms(triageSymptoms);
                    }}
                    className="w-full bg-[#00897b] hover:bg-[#00796b] text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Consult Doctor Online
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Enter your symptoms on the left to receive preliminary guidance.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
