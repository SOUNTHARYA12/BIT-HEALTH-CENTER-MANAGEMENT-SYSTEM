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
  Download
} from 'lucide-react';

interface StudentPortalProps {
  currentUser?: User | null;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'consultation' | 'prescriptions' | 'my_tokens' | 'pharmacy' | 'triage'>('book');

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
          setConsultDoctorId(data[0].id);
          if (data[0].timeSlots.length > 0) {
            setSelectedTimeSlot(data[0].timeSlots[0]);
          }
        }
      })
      .catch(err => console.error('Error loading doctors:', err));
  }, []);

  // Load My Appointments
  const loadAppointments = () => {
    if (!studentRoll) return;
    fetchAppointments({ rollNumber: studentRoll })
      .then(data => setMyAppointments(data))
      .catch(err => console.error('Error loading appointments:', err));
  };

  // Load My Online Consultations
  const loadConsultations = () => {
    if (!studentRoll) return;
    fetchConsultations({ rollNumber: studentRoll })
      .then(data => {
        setConsultations(data);
        // If a consultation is currently selected in chat room, update its reference
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
      // Select the newly created consultation
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Student Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-slate-900 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-lg">
            {studentName ? studentName.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">{studentName}</h2>
              <span className="bg-slate-100 text-teal-700 font-mono text-xs font-semibold px-2 py-0.5 rounded border border-slate-300">
                {studentRoll}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{department} • {hostelBlock}</p>
          </div>
        </div>

        {/* Logged in Student Status */}
        <div className="flex items-center space-x-2 text-xs bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-teal-800 font-semibold">Official BIT Health Record</span>
        </div>
      </div>

      {/* Quick Dashboard Action Cards (Requirement #8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'book'
              ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-400 shadow-sm ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">OPD</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Book Physical Appointment</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Visit health center in person</p>
          </div>
        </button>

        <button
          onClick={() => { setActiveTab('consultation'); setConsultSuccess(null); }}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
            activeTab === 'consultation'
              ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-400 shadow-sm ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
          }`}
        >
          {activeConsultationsCount > 0 && (
            <span className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {activeConsultationsCount} Active
            </span>
          )}
          <div className="flex items-center justify-between w-full mb-2">
            <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Online</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Online Doctor Consultation</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Text consultation with campus doctors</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'prescriptions'
              ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-400 shadow-sm ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Rx</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Prescriptions</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">{allPrescriptions.length} doctor prescription records</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('my_tokens')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'my_tokens'
              ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-400 shadow-sm ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Tokens</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Appointment History</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">{myAppointments.length} tokens & visit history</p>
          </div>
        </button>
      </div>

      {/* Main Student Portal Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 text-sm">
        <button
          id="student-tab-book"
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'book'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Book Physical Appointment</span>
        </button>

        <button
          id="student-tab-consultation"
          onClick={() => { setActiveTab('consultation'); setConsultSuccess(null); }}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap relative ${
            activeTab === 'consultation'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Online Doctor Consultation</span>
          {activeConsultationsCount > 0 && (
            <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.2 rounded-full ml-1">
              {activeConsultationsCount}
            </span>
          )}
        </button>

        <button
          id="student-tab-prescriptions"
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'prescriptions'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescriptions</span>
          {allPrescriptions.length > 0 && (
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.2 rounded-full font-bold ml-1">
              {allPrescriptions.length}
            </span>
          )}
        </button>

        <button
          id="student-tab-tokens"
          onClick={() => setActiveTab('my_tokens')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap relative ${
            activeTab === 'my_tokens'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Appointment History</span>
          {myAppointments.length > 0 && (
            <span className="bg-teal-50 text-teal-800 text-xs px-2 py-0.2 rounded-full font-bold ml-1">
              {myAppointments.length}
            </span>
          )}
        </button>

        <button
          id="student-tab-pharmacy"
          onClick={() => setActiveTab('pharmacy')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'pharmacy'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Dispensary Medicine Search</span>
        </button>

        <button
          id="student-tab-triage"
          onClick={() => setActiveTab('triage')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'triage'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>AI Health Triage Assistant</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB: ONLINE DOCTOR CONSULTATION (Requirement #1 & #3) */}
      {/* ============================================================ */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Online Consultation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Online Doctor Consultation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consult qualified BIT campus medical officers directly from your hostel or device.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setConsultSubView('request'); setSelectedConsultation(null); setConsultSuccess(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  consultSubView === 'request' && !selectedConsultation
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                + Request New Consultation
              </button>

              <button
                onClick={() => { setConsultSubView('list'); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  consultSubView === 'list' || selectedConsultation
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>My Consultations</span>
                <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {consultations.length}
                </span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: REQUEST NEW CONSULTATION */}
          {consultSubView === 'request' && !selectedConsultation && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Consultation Request Form */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
                {consultSuccess ? (
                  <div className="bg-slate-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
                        Online Consultation Request Submitted!
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">Ref ID: {consultSuccess.consultationNumber}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Assigned to {consultSuccess.doctorName} • Preferred slot: {consultSuccess.preferredTime}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        {getConsultationStatusBadge(consultSuccess.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student:</span>
                        <span className="font-semibold text-slate-900">{consultSuccess.studentName} ({consultSuccess.studentRoll})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Symptoms:</span>
                        <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{consultSuccess.healthConcern}</p>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedConsultation(consultSuccess);
                          setConsultSubView('list');
                        }}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Consultation Room</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConsultRequestSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Request an Online Doctor Consultation</h3>
                      <p className="text-xs text-slate-500">Describe your symptoms and connect with an on-duty medical officer.</p>
                    </div>

                    {consultError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                        <span>{consultError}</span>
                      </div>
                    )}

                    {/* Student Basic Info Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500">Consulting Student:</span>
                        <div className="font-semibold text-slate-900 mt-0.5">{studentName} ({studentRoll})</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Department & Hostel:</span>
                        <div className="text-slate-700 mt-0.5">{department} • {hostelBlock}</div>
                      </div>
                    </div>

                    {/* Step 1: Doctor Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-2">
                        1. Select Doctor / Medical Officer *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doctors.map(doc => (
                          <div
                            key={doc.id}
                            onClick={() => setConsultDoctorId(doc.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              consultDoctorId === doc.id
                                ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">{doc.name}</h4>
                                <p className="text-[11px] text-teal-700 font-medium">{doc.specialization}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{doc.qualification}</p>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  doc.currentStatus === 'available'
                                    ? 'bg-emerald-100 text-emerald-800'
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

                    {/* Step 2: Health Concern / Symptoms */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-800">
                          2. Health Concern & Symptoms *
                        </label>
                        <span className="text-[10px] text-slate-500">Provide details so the doctor can assist you</span>
                      </div>
                      <textarea
                        rows={4}
                        value={consultSymptoms}
                        onChange={e => setConsultSymptoms(e.target.value)}
                        placeholder="Explain your health concern, symptoms, duration, and how you feel (e.g., headache for 2 days, mild fever, throat pain)..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
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
                            className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Preferred Consultation Time */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        3. Preferred Consultation Time (Optional)
                      </label>
                      <select
                        value={consultPreferredTime}
                        onChange={e => setConsultPreferredTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
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
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-teal-600/20 text-xs flex items-center justify-center space-x-2"
                    >
                      {isConsultSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>Submit Online Consultation Request</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Information Side Panel */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    How Online Consultation Works
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-2.5 list-decimal list-inside leading-relaxed">
                    <li><strong className="text-slate-800">Submit Request:</strong> Enter your symptoms and choose a doctor.</li>
                    <li><strong className="text-slate-800">Doctor Accepts:</strong> On-duty doctor reviews and accepts the session.</li>
                    <li><strong className="text-slate-800">Direct Chat:</strong> Chat in real time with the doctor right here on this page.</li>
                    <li><strong className="text-slate-800">Prescription Issued:</strong> View the digital prescription and collect free medicine at the dispensary.</li>
                  </ol>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    Emergency Notice
                  </div>
                  <p className="leading-relaxed">
                    Online consultation is suitable for non-critical, mild ailments. For severe accidents, breathing difficulty, or emergencies, call BIT Helpline <strong>Ext 108</strong> or visit campus casualty immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: MY CONSULTATIONS LIST & INTERACTIVE CHAT ROOM */}
          {(consultSubView === 'list' || selectedConsultation) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: List of Student's Online Consultations */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    My Consultation Requests ({consultations.length})
                  </h4>
                  <button
                    onClick={loadConsultations}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    title="Refresh consultations"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {consultations.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                    You have not submitted any online consultation requests yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {consultations.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedConsultation(c)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedConsultation?.id === c.id
                            ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-mono text-xs font-bold text-teal-800">{c.consultationNumber}</span>
                          {getConsultationStatusBadge(c.status)}
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">{c.doctorName}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{c.healthConcern}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.messages && c.messages.length > 0 && (
                            <span className="flex items-center text-teal-700 font-medium">
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

              {/* Right Column: Active Consultation Room & Chat Interface (Requirement #3) */}
              <div className="lg:col-span-8">
                {selectedConsultation ? (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-slate-900">{selectedConsultation.doctorName}</h4>
                            <span className="font-mono text-xs text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded font-semibold">
                              {selectedConsultation.consultationNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Preferred Time: {selectedConsultation.preferredTime || 'Standard OPD'}
                          </p>
                        </div>
                      </div>
                      <div>
                        {getConsultationStatusBadge(selectedConsultation.status)}
                      </div>
                    </div>

                    {/* Consultation Health Concern Banner */}
                    <div className="bg-teal-50/50 px-4 py-2.5 border-b border-teal-100 text-xs text-slate-700 flex items-start space-x-2">
                      <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-teal-900">Your Reported Concern: </strong>
                        <span>{selectedConsultation.healthConcern}</span>
                      </div>
                    </div>

                    {/* Status specific notices */}
                    {selectedConsultation.status === 'pending' && (
                      <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-3 text-xs text-amber-900 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock3 className="w-4 h-4 text-amber-700 shrink-0 animate-spin" />
                          <span>Waiting for <strong>{selectedConsultation.doctorName}</strong> to accept your request. Messaging will unlock as soon as accepted!</span>
                        </div>
                        <button
                          onClick={loadConsultations}
                          className="px-2.5 py-1 bg-amber-200/60 hover:bg-amber-200 rounded text-[11px] font-semibold text-amber-900"
                        >
                          Check Status
                        </button>
                      </div>
                    )}

                    {selectedConsultation.status === 'rejected' && (
                      <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-xs text-rose-900">
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          <XCircle className="w-4 h-4 text-rose-700" />
                          Consultation Request Declined
                        </div>
                        <p>{selectedConsultation.rejectionReason || 'The doctor is currently off-duty or unavailable for this slot. Please submit a request to another medical officer or book an in-person physical appointment.'}</p>
                      </div>
                    )}

                    {/* Completed Prescription & Clinical Notes Banner */}
                    {selectedConsultation.status === 'completed' && (
                      <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                            Consultation Completed by {selectedConsultation.doctorName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {selectedConsultation.completedAt ? new Date(selectedConsultation.completedAt).toLocaleString() : ''}
                          </span>
                        </div>
                        {selectedConsultation.doctorNotes && (
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                            <strong className="text-slate-900 block mb-0.5">Doctor Clinical Advice / Notes:</strong>
                            <p className="italic">{selectedConsultation.doctorNotes}</p>
                          </div>
                        )}

                        {selectedConsultation.prescriptions && selectedConsultation.prescriptions.length > 0 && (
                          <div className="bg-white p-3 rounded-xl border border-teal-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-teal-800 uppercase tracking-wider text-[11px]">
                                Digital Prescription Issued:
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                                Free Dispensary Collection
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {selectedConsultation.prescriptions.map(rx => (
                                <div key={rx.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                                  <div>
                                    <div className="font-bold text-slate-900">{rx.medicineName}</div>
                                    <div className="text-[11px] text-slate-600">
                                      Dosage: <span className="font-semibold">{rx.dosage}</span> • Frequency: <span className="font-semibold">{rx.frequency}</span> • Duration: <span className="font-semibold">{rx.duration}</span>
                                    </div>
                                    {rx.instructions && (
                                      <div className="text-[10px] text-teal-700 italic mt-0.5">{rx.instructions}</div>
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded self-start sm:self-center ${
                                    rx.dispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {rx.dispensed ? 'Dispensed' : 'Ready for Counter Pickup'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat Message Stream */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/60">
                      {(!selectedConsultation.messages || selectedConsultation.messages.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6 space-y-2">
                          <MessageSquare className="w-10 h-10 text-slate-300" />
                          <p className="font-medium text-slate-700">Consultation Session Active</p>
                          <p className="text-[11px] max-w-sm">
                            {selectedConsultation.status === 'pending'
                              ? 'Once the doctor accepts, send your message below to begin the consultation.'
                              : 'Say hello to start discussing your symptoms with the doctor.'}
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
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                                  isMe
                                    ? 'bg-teal-600 text-white rounded-tr-none'
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

                    {/* Chat Message Input */}
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
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessageText.trim() || isSendingChat || selectedConsultation.status === 'rejected' || selectedConsultation.status === 'completed'}
                        className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                      >
                        {isSendingChat ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Send</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-3">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700">No Consultation Selected</h4>
                    <p className="max-w-md mx-auto">
                      Choose a consultation from the list on the left to enter the doctor consultation room and chat.
                    </p>
                    <button
                      onClick={() => setConsultSubView('request')}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
                    >
                      + Request New Consultation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: PRESCRIPTIONS (Requirement #4 & #8) */}
      {/* ============================================================ */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                My Prescriptions & Medication Orders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official digital prescriptions from physical OPD visits and online consultations.
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
              Free Dispensary Collection
            </span>
          </div>

          {allPrescriptions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Prescriptions Issued Yet</p>
              <p>When a campus doctor prescribes medication after consultation, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPrescriptions.map((rxGroup, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {rxGroup.source === 'online' ? 'Online Consultation' : 'Physical OPD'} • Ref: {rxGroup.refId}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">Prescribed by {rxGroup.doctorName}</h4>
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
                      <div key={i} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-1">
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
                          <div className="text-[10px] text-slate-500 italic">Instructions: {item.instructions}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
                    <span>Pickup Counter: Main Health Center Dispensary</span>
                    <span className="text-emerald-700 font-semibold">Free Campus Supply</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: BOOK PHYSICAL APPOINTMENT (Original Unchanged Feature) */}
      {/* ============================================================ */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
            {bookingSuccess ? (
              <div className="bg-slate-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
                    Appointment Successfully Booked!
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">Token No: {bookingSuccess.tokenNumber}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Scheduled for {bookingSuccess.doctorName} on {bookingSuccess.appointmentDate} at {bookingSuccess.timeSlot}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-medium text-slate-900">{bookingSuccess.studentName} ({bookingSuccess.rollNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span>{bookingSuccess.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chief Complaint:</span>
                    <span className="text-amber-800">{bookingSuccess.chiefComplaint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">
                      {bookingSuccess.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Book Another
                  </button>
                  <button
                    onClick={() => setActiveTab('my_tokens')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>View Live Token Tracker</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Schedule Medical Appointment (In-Person OPD)</h3>
                  <p className="text-xs text-slate-500">Book an in-person physical consultation with BIT campus doctors.</p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Patient Information Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Student Roll Number *</label>
                    <input
                      type="text"
                      value={studentRoll}
                      onChange={e => setStudentRoll(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Hostel / Day Scholar *</label>
                    <input
                      type="text"
                      value={hostelBlock}
                      onChange={e => setHostelBlock(e.target.value)}
                      placeholder="e.g. Thamarai Hostel Block A"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Select Medical Officer / Specialist *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctors.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => handleDoctorChange(doc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedDoctorId === doc.id
                            ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-sm ring-1 ring-teal-500'
                            : 'bg-slate-50/40 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{doc.name}</h4>
                            <p className="text-[11px] text-teal-700 font-medium">{doc.specialization}</p>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                              <Building2 className="w-3 h-3 mr-1 text-slate-500" />
                              {doc.roomNo}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
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

                {/* Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Appointment Date *</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={e => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Time Slot *</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={e => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
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

                {/* Chief Complaint & Urgency */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Chief Symptoms / Reason for Visit *</label>
                  <textarea
                    rows={3}
                    value={chiefComplaint}
                    onChange={e => setChiefComplaint(e.target.value)}
                    placeholder="Describe your symptoms (e.g., Fever, sore throat, severe stomach pain, dental pain)..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label
                      className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all text-xs font-medium ${
                        urgency === 'normal'
                          ? 'bg-teal-50 border-teal-500 text-teal-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
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
                      <span>Normal OPD</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all text-xs font-medium ${
                        urgency === 'urgent'
                          ? 'bg-amber-50 border-amber-500 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
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
                      <span>Urgent Care</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all text-xs font-medium ${
                        urgency === 'emergency'
                          ? 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
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
                      <span>Emergency Bay</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirm & Generate Physical OPD Token</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Side Info & Live OPD Guidelines */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900">
              <h3 className="font-bold text-sm mb-3 flex items-center text-teal-700">
                <Stethoscope className="w-4 h-4 mr-2" />
                BIT Health Center Guidelines
              </h3>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                <li>Students must carry their official <strong>BIT ID Card</strong> during consultation.</li>
                <li>All medicines prescribed in the BIT Health Center dispensary are <strong>100% Free</strong> for registered students.</li>
                <li>For emergency ambulance dispatch inside campus, call <strong>Ext 108</strong>.</li>
                <li>Please arrive 5 minutes prior to your allocated time slot.</li>
              </ul>
            </div>

            {/* Quick Online Consultation Teaser Banner */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-2xl p-5 shadow-sm text-slate-900">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                <MessageSquare className="w-4 h-4" />
                Need quick doctor advice from hostel?
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Use our new Online Doctor Consultation feature to chat directly with available campus doctors without walking to the OPD.
              </p>
              <button
                onClick={() => { setActiveTab('consultation'); setConsultSubView('request'); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center"
              >
                Launch Online Consultation <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MY TOKENS & APPOINTMENT HISTORY (Original Feature) */}
      {/* ============================================================ */}
      {activeTab === 'my_tokens' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">My In-Person Appointments & Token History</h3>
              <p className="text-xs text-slate-500">Track physical token queue status, vitals, and diagnosis records.</p>
            </div>
            <button
              onClick={loadAppointments}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Status
            </button>
          </div>

          {myAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No appointments found for Roll Number <span className="font-mono text-teal-700">{studentRoll}</span>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Token Number</span>
                      <h4 className="text-xl font-bold text-teal-700 font-mono">{apt.tokenNumber}</h4>
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

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medical Officer:</span>
                      <span className="font-semibold text-slate-900">{apt.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Slot:</span>
                      <span className="text-teal-800">{apt.appointmentDate} ({apt.timeSlot})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Symptoms:</span>
                      <span className="text-slate-800">{apt.chiefComplaint}</span>
                    </div>
                  </div>

                  {/* Vitals & Diagnosis if Completed */}
                  {apt.diagnosis && (
                    <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-xl text-xs space-y-2">
                      <div className="font-bold text-teal-800 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Clinical Diagnosis & Notes
                      </div>
                      <p className="text-slate-800 font-medium">{apt.diagnosis}</p>
                      {apt.doctorNotes && <p className="text-slate-500 text-[11px] italic">{apt.doctorNotes}</p>}

                      {apt.prescriptions && apt.prescriptions.length > 0 && (
                        <div className="pt-2 border-t border-teal-200 space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            Prescribed Medication:
                          </span>
                          {apt.prescriptions.map((p, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] bg-white p-2 rounded border border-slate-100">
                              <span className="text-slate-900 font-medium">{p.medicineName}</span>
                              <span className="text-teal-700">{p.dosage} ({p.durationDays} days)</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${p.dispensed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                                {p.dispensed ? 'Dispensed' : 'Ready at Pharmacy'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PHARMACY MEDICINE AVAILABILITY LOOKUP */}
      {/* ============================================================ */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">BIT Campus Pharmacy Stock Search</h3>
              <p className="text-xs text-slate-500">Search available medicines, generic names, and dosage forms in real-time.</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={medSearch}
                onChange={e => setMedSearch(e.target.value)}
                placeholder="Search Paracetamol, Dolo, Antibiotic..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacyMedicines.map(med => (
              <div
                key={med.id}
                className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 shadow-sm space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{med.name}</h4>
                    <p className="text-xs text-slate-500 italic">{med.genericName}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-teal-800 px-2 py-0.5 rounded border border-slate-300">
                    {med.category}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-200">
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

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Rack Location: {med.locationRack}</span>
                  <span className="text-emerald-700 font-medium">Free for BIT Students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: AI HEALTH TRIAGE HELPER */}
      {/* ============================================================ */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-bold text-slate-900">AI Health Triage Assistant</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Get instant preliminary triage advice and doctor department recommendations.
              </p>
            </div>

            <form onSubmit={handleRunTriage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Describe Symptoms *</label>
                <textarea
                  rows={4}
                  value={triageSymptoms}
                  onChange={e => setTriageSymptoms(e.target.value)}
                  placeholder="e.g., I have severe headache, fever of 101F, body pain, and sore throat since yesterday..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Symptom Duration</label>
                <input
                  type="text"
                  value={triageDuration}
                  onChange={e => setTriageDuration(e.target.value)}
                  placeholder="e.g. 2 days"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isTriaging || !triageSymptoms.trim()}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-2 shadow-sm"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Triage Assessment Result</h4>

            {isTriaging ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">AI is evaluating your health parameters...</p>
              </div>
            ) : triageResult ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Category:</span>
                    <span className="text-xs font-bold text-amber-800">{triageResult.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Urgency Level:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
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
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Recommended Specialist:</span>
                    <span className="text-xs font-semibold text-teal-700">{triageResult.recommendedSpecialization}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Medical Advice:</span>
                  <p className="text-slate-700 leading-relaxed">{triageResult.advice}</p>
                </div>

                {triageResult.redFlags && triageResult.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-rose-200 p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-rose-700 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Warning Signs / Red Flags:
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
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition-colors"
                  >
                    Book In-Person OPD
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('consultation');
                      setConsultSubView('request');
                      setConsultSymptoms(triageSymptoms);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                  >
                    Consult Doctor Online
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Enter your symptoms on the left to receive preliminary triage guidance.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

