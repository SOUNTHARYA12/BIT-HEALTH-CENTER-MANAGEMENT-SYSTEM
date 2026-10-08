import React, { useState, useEffect, useRef } from 'react';
import {
  Doctor,
  Appointment,
  Medicine,
  PrescribedMedicine,
  PatientVitals,
  User,
  OnlineConsultation,
  ConsultationStatus,
  ChatMessage,
  ConsultationPrescriptionItem
} from '../types';
import {
  fetchDoctors,
  updateDoctorStatus,
  fetchAppointments,
  updateAppointmentStatus,
  saveConsultation,
  fetchInventory,
  fetchConsultations,
  updateConsultationStatus,
  sendChatMessage,
  addConsultationPrescription
} from '../services/api';
import {
  Stethoscope,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pill,
  Plus,
  Trash2,
  Activity,
  Heart,
  Thermometer,
  Weight,
  ShieldAlert,
  Search,
  RefreshCw,
  X,
  ShieldCheck,
  MessageSquare,
  Send,
  Calendar,
  CheckCircle,
  XCircle,
  User as UserIcon,
  HelpCircle,
  AlertTriangle,
  History
} from 'lucide-react';

interface DoctorPortalProps {
  currentUser?: User | null;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ currentUser }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<Medicine[]>([]);

  // Active Patient for Consultation
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  // Consultation Form State
  const [vitals, setVitals] = useState<PatientVitals>({
    bloodPressure: '120/80',
    pulseRate: 80,
    temperature: 98.6,
    weight: 60,
    spo2: 99,
    allergies: 'None'
  });
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescribedMedicine[]>([]);

  // Prescription builder state
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dosage, setDosage] = useState('1-0-1 after food');
  const [durationDays, setDurationDays] = useState(3);
  const [quantity, setQuantity] = useState(6);
  const [medSearch, setMedSearch] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Doctor Tab State: 'queue' (physical appointments) vs 'online' (online consultations)
  const [activeDoctorTab, setActiveDoctorTab] = useState<'queue' | 'online'>('queue');

  // Online Consultations State
  const [onlineConsultations, setOnlineConsultations] = useState<OnlineConsultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<OnlineConsultation | null>(null);
  const [consultStatusFilter, setConsultStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'in_consultation' | 'completed' | 'rejected'>('all');
  const [doctorChatMessage, setDoctorChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [doctorConsultNotes, setDoctorConsultNotes] = useState('');

  // Prescription builder for Online Consultation
  const [onlinePrescMedId, setOnlinePrescMedId] = useState('');
  const [onlinePrescDosage, setOnlinePrescDosage] = useState('500mg');
  const [onlinePrescFreq, setOnlinePrescFreq] = useState('1-0-1 after food');
  const [onlinePrescDuration, setOnlinePrescDuration] = useState('3 days');
  const [onlinePrescInstructions, setOnlinePrescInstructions] = useState('Drink warm water');
  const [onlinePrescQuantity, setOnlinePrescQuantity] = useState(6);
  const [isAddingPresc, setIsAddingPresc] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Helper to identify if current logged-in user matches a doctor
  const loggedInDoctor = doctors.find(d =>
    d.id === currentUser?.username ||
    d.name.toLowerCase() === currentUser?.name?.toLowerCase() ||
    d.id === currentUser?.id ||
    d.id === currentUser?.rollNumber
  );

  // Load doctors & inventory
  useEffect(() => {
    fetchDoctors()
      .then(docs => {
        setDoctors(docs);
        if (currentUser && currentUser.role === 'doctor') {
          const matching = docs.find(d =>
            d.id === currentUser.username ||
            d.name.toLowerCase() === currentUser.name?.toLowerCase() ||
            d.id === currentUser.id ||
            d.id === currentUser.rollNumber
          );
          if (matching) {
            setSelectedDoctorId(matching.id);
          } else if (docs.length > 0) {
            setSelectedDoctorId(docs[0].id);
          }
        } else if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id);
        }
      })
      .catch(err => console.error('Error fetching doctors:', err));

    fetchInventory()
      .then(meds => {
        setInventory(meds);
        if (meds.length > 0) setSelectedMedId(meds[0].id);
      })
      .catch(err => console.error('Error fetching inventory:', err));
  }, [currentUser]);

  // Keep selectedDoctorId locked to loggedInDoctor if user is doctor
  useEffect(() => {
    if (currentUser && currentUser.role === 'doctor' && doctors.length > 0) {
      const matching = doctors.find(d =>
        d.id === currentUser.username ||
        d.name.toLowerCase() === currentUser.name?.toLowerCase() ||
        d.id === currentUser.id ||
        d.id === currentUser.rollNumber
      );
      if (matching && selectedDoctorId !== matching.id) {
        setSelectedDoctorId(matching.id);
      }
    }
  }, [currentUser, doctors, selectedDoctorId]);

  // Fetch appointments for selected doctor (or strictly logged in doctor)
  const loadDoctorAppointments = () => {
    const targetId = (currentUser && currentUser.role === 'doctor' && loggedInDoctor)
      ? loggedInDoctor.id
      : selectedDoctorId;
    if (!targetId) return;
    fetchAppointments({ doctorId: targetId })
      .then(apts => setAppointments(apts))
      .catch(err => console.error('Error fetching doctor appointments:', err));
  };

  // Fetch online consultations for doctor
  const loadDoctorConsultations = () => {
    const targetId = (currentUser && currentUser.role === 'doctor' && loggedInDoctor)
      ? loggedInDoctor.id
      : selectedDoctorId;
    if (!targetId) return;

    fetchConsultations({ doctorId: targetId })
      .then(consults => {
        setOnlineConsultations(consults);
        // If one is selected, refresh it
        if (selectedConsultation) {
          const fresh = consults.find(c => c.id === selectedConsultation.id);
          if (fresh) setSelectedConsultation(fresh);
        }
      })
      .catch(err => console.error('Error fetching online consultations:', err));
  };

  useEffect(() => {
    loadDoctorAppointments();
    loadDoctorConsultations();
  }, [selectedDoctorId, currentUser, loggedInDoctor?.id]);

  // Polling for live chat when in online consultation room
  useEffect(() => {
    if (activeDoctorTab === 'online') {
      const interval = setInterval(() => {
        loadDoctorConsultations();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeDoctorTab, selectedConsultation?.id, selectedDoctorId]);

  // Auto scroll chat in doctor portal
  useEffect(() => {
    if (selectedConsultation?.messages) {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConsultation?.messages?.length]);

  // Handle Online Consultation Status Updates
  const handleConsultStatusUpdate = async (
    consultId: string,
    newStatus: ConsultationStatus,
    extra?: { rejectionReason?: string; doctorNotes?: string }
  ) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateConsultationStatus(consultId, newStatus, extra);
      setSelectedConsultation(updated);
      loadDoctorConsultations();
      setShowRejectModal(null);
      setRejectionReasonInput('');
      setSuccessMsg(`Consultation marked as "${newStatus.replace('_', ' ')}"`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update consultation status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Doctor Sending Chat Message
  const handleDoctorSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation || !doctorChatMessage.trim() || isSendingMessage) return;

    const text = doctorChatMessage.trim();
    setDoctorChatMessage('');
    setIsSendingMessage(true);

    try {
      await sendChatMessage(selectedConsultation.id, {
        senderId: activeDoctor?.id || currentUser?.username || 'doc',
        senderName: activeDoctor?.name || currentUser?.name || 'Dr. Medical Officer',
        senderRole: 'doctor',
        message: text
      });
      loadDoctorConsultations();
    } catch (err) {
      console.error('Failed to send doctor message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle Doctor Prescribing Medicine for Online Consultation
  const handleAddOnlinePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation || !onlinePrescMedId) return;

    const med = inventory.find(m => m.id === onlinePrescMedId);
    if (!med) return;

    setIsAddingPresc(true);
    try {
      const updated = await addConsultationPrescription(
        selectedConsultation.id,
        {
          medicineId: med.id,
          medicineName: med.name,
          dosage: onlinePrescDosage,
          frequency: onlinePrescFreq,
          duration: onlinePrescDuration,
          instructions: onlinePrescInstructions,
          quantity: onlinePrescQuantity,
          dispensed: false
        },
        doctorConsultNotes.trim() || undefined
      );

      setSelectedConsultation(updated);
      loadDoctorConsultations();
      setSuccessMsg(`Prescribed ${med.name} successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to add prescription item:', err);
    } finally {
      setIsAddingPresc(false);
    }
  };

  // Complete Online Consultation
  const handleCompleteOnlineConsultation = async () => {
    if (!selectedConsultation) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateConsultationStatus(
        selectedConsultation.id,
        'completed',
        { doctorNotes: doctorConsultNotes.trim() || selectedConsultation.doctorNotes || 'Consultation concluded by doctor.' }
      );
      setSelectedConsultation(updated);
      loadDoctorConsultations();
      setSuccessMsg('Online Consultation marked as Completed. Digital prescription is available to the student.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to complete consultation:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const activeDoctor = (currentUser && currentUser.role === 'doctor' && loggedInDoctor)
    ? loggedInDoctor
    : doctors.find(d => d.id === selectedDoctorId);

  const handleStatusChange = async (newStatus: Doctor['currentStatus']) => {
    const targetId = activeDoctor ? activeDoctor.id : selectedDoctorId;
    if (!targetId) return;
    try {
      const updated = await updateDoctorStatus(targetId, newStatus);
      setDoctors(prev => prev.map(d => d.id === updated.id ? updated : d));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartConsultation = (apt: Appointment) => {
    setActiveAppointment(apt);
    setVitals(apt.vitals || {
      bloodPressure: '120/80',
      pulseRate: 80,
      temperature: 98.6,
      weight: 60,
      spo2: 99,
      allergies: 'None'
    });
    setDiagnosis(apt.diagnosis || '');
    setDoctorNotes(apt.doctorNotes || '');
    setPrescriptions(apt.prescriptions || []);

    // Update appointment status to in_consultation
    updateAppointmentStatus(apt.id, 'in_consultation')
      .then(() => loadDoctorAppointments())
      .catch(err => console.error(err));
  };

  const handleAddPrescription = () => {
    if (!selectedMedId) return;
    const med = inventory.find(m => m.id === selectedMedId);
    if (!med) return;

    const existingIndex = prescriptions.findIndex(p => p.medicineId === selectedMedId);
    if (existingIndex >= 0) {
      const updated = [...prescriptions];
      updated[existingIndex].quantity += quantity;
      setPrescriptions(updated);
    } else {
      setPrescriptions([
        ...prescriptions,
        {
          medicineId: med.id,
          medicineName: med.name,
          dosage,
          durationDays,
          quantity,
          dispensed: false
        }
      ]);
    }
  };

  const handleRemovePrescription = (medicineId: string) => {
    setPrescriptions(prescriptions.filter(p => p.medicineId !== medicineId));
  };

  const handleCompleteConsultation = async () => {
    if (!activeAppointment) return;
    setIsSaving(true);
    try {
      await saveConsultation(activeAppointment.id, {
        vitals,
        diagnosis,
        doctorNotes,
        prescriptions,
        status: 'completed'
      });
      setIsSaving(false);
      setActiveAppointment(null);
      loadDoctorAppointments();
      setSuccessMsg('Consultation completed! Prescriptions automatically moved to Pharmacy for dispensing.');
      setTimeout(() => setSuccessMsg(''), 7000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const filteredInventory = inventory.filter(m =>
    m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
    m.genericName.toLowerCase().includes(medSearch.toLowerCase())
  );

  const waitingQueue = appointments.filter(a => a.status === 'scheduled' || a.status === 'waiting' || a.status === 'in_consultation');
  const completedQueue = appointments.filter(a => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Doctor Header & Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            {currentUser && currentUser.role === 'doctor' ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Logged in Medical Officer:</span>
                  <span className="bg-teal-600 text-white font-bold text-sm rounded-lg px-3 py-1 flex items-center shadow-sm">
                    {activeDoctor ? `${activeDoctor.name} (${activeDoctor.id})` : currentUser.name}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Private Consultation View
                  </span>
                </div>
                {activeDoctor && (
                  <p className="text-xs text-slate-500 mt-1">
                    {activeDoctor.qualification} • <span className="text-teal-800 font-semibold">{activeDoctor.roomNo}</span> • <span className="text-slate-600">Confidential: Showing only assigned patients</span>
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-slate-500 font-medium">Select Medical Officer:</label>
                  <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    className="bg-slate-50 text-slate-900 font-bold text-sm border border-slate-300 rounded-lg px-3 py-1 focus:outline-none focus:border-teal-500"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
                {activeDoctor && (
                  <p className="text-xs text-slate-500 mt-1">
                    {activeDoctor.qualification} • <span className="text-teal-800">{activeDoctor.roomNo}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Status Buttons */}
        {activeDoctor && (
          <div className="flex items-center space-x-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium text-[11px] mr-1">Status:</span>
            <button
              onClick={() => handleStatusChange('available')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeDoctor.currentStatus === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleStatusChange('in_consultation')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeDoctor.currentStatus === 'in_consultation'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Consultation
            </button>
            <button
              onClick={() => handleStatusChange('on_break')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeDoctor.currentStatus === 'on_break'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              On Break
            </button>
          </div>
        )}
      </div>

      {/* Success Notice Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Doctor Portal Navigation Tabs (Physical Outpatient vs Online Doctor Consultations) */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2">
        <button
          onClick={() => setActiveDoctorTab('queue')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeDoctorTab === 'queue'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>🏥 Physical OPD Queue ({waitingQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveDoctorTab('online')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeDoctorTab === 'online'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>💬 Online Doctor Consultations</span>
          {onlineConsultations.filter(c => c.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {onlineConsultations.filter(c => c.status === 'pending').length} New
            </span>
          )}
        </button>
      </div>

      {/* VIEW A: PHYSICAL OPD APPOINTMENT QUEUE (Unchanged functionality) */}
      {activeDoctorTab === 'queue' && (
        <div className="space-y-6">
          {/* OPD Queue Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Scheduled Today</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-amber-700 uppercase font-semibold">Active Queue Waiting</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">{waitingQueue.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-emerald-700 uppercase font-semibold">Completed Consultations</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{completedQueue.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-rose-700 uppercase font-semibold">Urgent / Emergency Cases</span>
              <div className="text-2xl font-bold text-rose-700 mt-1">
                {appointments.filter(a => a.urgency === 'urgent' || a.urgency === 'emergency').length}
              </div>
            </div>
          </div>

          {/* Active OPD Queue Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active OPD Patient Queue</h3>
                <p className="text-xs text-slate-500">Call next student, record vitals, and generate digital prescriptions.</p>
              </div>
              <button
                onClick={loadDoctorAppointments}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Queue
              </button>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-slate-200">
                No patients currently waiting in queue for {activeDoctor?.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {waitingQueue.map(apt => (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      apt.urgency === 'emergency'
                        ? 'bg-rose-50 border-rose-300'
                        : apt.urgency === 'urgent'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Token</span>
                        <span className="text-base font-bold text-teal-700 font-mono">{apt.tokenNumber}</span>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900">{apt.studentName}</h4>
                          <span className="font-mono text-xs text-teal-800 bg-slate-100 px-2 py-0.5 rounded">
                            {apt.rollNumber}
                          </span>
                          {apt.urgency !== 'normal' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${apt.urgency === 'emergency' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>
                              {apt.urgency}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">{apt.department} • {apt.hostelBlock}</p>
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          <span className="text-slate-500 font-normal">Complaint:</span> {apt.chiefComplaint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500">{apt.timeSlot}</span>
                      <button
                        onClick={() => handleStartConsultation(apt)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Stethoscope className="w-3.5 h-3.5 mr-1" />
                        <span>Start Consultation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: ONLINE DOCTOR CONSULTATION FEATURE (User Requirements #2, #3, #4, #5) */}
      {activeDoctorTab === 'online' && (
        <div className="space-y-6">
          {/* Online Consultation Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Requests</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{onlineConsultations.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-amber-700 uppercase font-semibold">Pending Review</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {onlineConsultations.filter(c => c.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-teal-700 uppercase font-semibold">In Consultation / Accepted</span>
              <div className="text-2xl font-bold text-teal-700 mt-1">
                {onlineConsultations.filter(c => c.status === 'in_consultation' || c.status === 'accepted').length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
              <span className="text-[11px] text-emerald-700 uppercase font-semibold">Completed Consultations</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {onlineConsultations.filter(c => c.status === 'completed').length}
              </div>
            </div>
          </div>

          {/* If a consultation is actively selected, show Full Consultation Room */}
          {selectedConsultation ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-900">
              {/* Consultation Room Top Bar */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    ← All Consultations
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-300 text-xs font-semibold bg-teal-900/60 px-2 py-0.5 rounded border border-teal-500/30">
                        {selectedConsultation.consultationNumber}
                      </span>
                      <h3 className="font-bold text-base text-white">{selectedConsultation.studentName}</h3>
                      <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                        {selectedConsultation.studentRoll}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedConsultation.department || 'BIT Student'} • Hostel: {selectedConsultation.hostelBlock || 'N/A'} • Preferred: {selectedConsultation.preferredTime || 'Immediate'}
                    </p>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center flex-wrap gap-2">
                  {selectedConsultation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConsultStatusUpdate(selectedConsultation.id, 'accepted')}
                        disabled={isUpdatingStatus}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept Request
                      </button>
                      <button
                        onClick={() => setShowRejectModal(selectedConsultation.id)}
                        disabled={isUpdatingStatus}
                        className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline Request
                      </button>
                    </>
                  )}

                  {selectedConsultation.status === 'accepted' && (
                    <button
                      onClick={() => handleConsultStatusUpdate(selectedConsultation.id, 'in_consultation')}
                      disabled={isUpdatingStatus}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Start Online Consultation Chat
                    </button>
                  )}

                  {selectedConsultation.status === 'in_consultation' && (
                    <button
                      onClick={handleCompleteOnlineConsultation}
                      disabled={isUpdatingStatus}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consultation & Finalize
                    </button>
                  )}

                  {selectedConsultation.status === 'completed' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Consultation Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Consultation Room Content Grid: Student Info & Chat on Left, Clinical Notes & Prescriptions on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* LEFT COLUMN: Student Concern & Interactive Text-Based Chat (Requirement #3) */}
                <div className="lg:col-span-7 flex flex-col h-[650px] bg-slate-50/50">
                  {/* Student Health Concern Card */}
                  <div className="p-4 bg-white border-b border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Student's Reported Symptoms / Concern:
                      </span>
                      <span>Requested: {new Date(selectedConsultation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 font-medium leading-relaxed">
                      "{selectedConsultation.healthConcern}"
                    </div>

                    {/* Previous Medical History if available */}
                    {selectedConsultation.previousHistory && (
                      <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-teal-600" />
                        <span><strong>Medical History:</strong> {selectedConsultation.previousHistory}</span>
                      </div>
                    )}
                  </div>

                  {/* Real-time / Near-real-time Chat Messages Stream (Requirement #3) */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-slate-100">
                    <div className="text-center my-2">
                      <span className="bg-white/80 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500 uppercase tracking-wider font-semibold shadow-xs">
                        Confidential Doctor-Student Consultation Chat • ID: {selectedConsultation.id}
                      </span>
                    </div>

                    {selectedConsultation.messages && selectedConsultation.messages.length > 0 ? (
                      selectedConsultation.messages.map(msg => {
                        const isDoc = msg.senderRole === 'doctor';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isDoc ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mb-0.5 px-1">
                              <span className="font-semibold text-slate-700">
                                {isDoc ? `Dr. ${msg.senderName} (Doctor)` : `${msg.senderName} (Student)`}
                              </span>
                              <span>•</span>
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                                isDoc
                                  ? 'bg-teal-600 text-white rounded-tr-none'
                                  : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8">
                        <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">No chat messages yet</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                          Once accepted, send a greeting message below to start diagnosing the student.
                        </p>
                      </div>
                    )}
                    <div ref={chatScrollRef} />
                  </div>

                  {/* Doctor Message Input Bar */}
                  <form onSubmit={handleDoctorSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                    <input
                      type="text"
                      value={doctorChatMessage}
                      onChange={e => setDoctorChatMessage(e.target.value)}
                      placeholder={
                        selectedConsultation.status === 'completed'
                          ? 'This consultation is marked completed.'
                          : selectedConsultation.status === 'rejected'
                          ? 'This consultation was declined.'
                          : 'Type clinical advice or question for student...'
                      }
                      disabled={selectedConsultation.status === 'completed' || selectedConsultation.status === 'rejected' || isSendingMessage}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!doctorChatMessage.trim() || selectedConsultation.status === 'completed' || selectedConsultation.status === 'rejected' || isSendingMessage}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: Clinical Notes & Digital Prescription Module (User Requirements #4, #5) */}
                <div className="lg:col-span-5 p-5 space-y-5 bg-white overflow-y-auto h-[650px]">
                  {/* Doctor Consultation Notes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-700" /> Doctor Clinical Notes & Assessment
                      </label>
                      <span className="text-[10px] text-slate-500">Visible to student on prescription</span>
                    </div>
                    <textarea
                      rows={3}
                      value={doctorConsultNotes || selectedConsultation.doctorNotes || ''}
                      onChange={e => setDoctorConsultNotes(e.target.value)}
                      placeholder="e.g. Mild viral upper respiratory infection. Advised bed rest, hydration, and prescribed paracetamol."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Digital Prescription Builder (Requirement #4 & #5 Medication Stock Integration) */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Digital Prescription Builder</h4>
                          <p className="text-[10px] text-slate-500">Integrated with BIT Medication Stock</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                        Stock Live Check
                      </span>
                    </div>

                    <form onSubmit={handleAddOnlinePrescription} className="space-y-3">
                      {/* Medicine Selector linked to live Inventory */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Select Medicine from Stock:
                        </label>
                        <select
                          value={onlinePrescMedId}
                          onChange={e => setOnlinePrescMedId(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        >
                          <option value="">-- Choose BIT Dispensary Medicine --</option>
                          {inventory.map(med => (
                            <option key={med.id} value={med.id}>
                              {med.name} ({med.genericName}) — Stock: {med.stockQuantity} {med.unit} {med.stockQuantity <= med.reorderLevel ? '⚠️ LOW STOCK' : '✓ Available'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Display Selected Medicine Stock Badge */}
                      {onlinePrescMedId && (
                        (() => {
                          const chosenMed = inventory.find(m => m.id === onlinePrescMedId);
                          if (!chosenMed) return null;
                          const isLow = chosenMed.stockQuantity <= chosenMed.reorderLevel;
                          return (
                            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${isLow ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'}`}>
                              <div>
                                <span className="font-bold">{chosenMed.name}</span>
                                <span className="text-[10px] ml-2 opacity-80">Category: {chosenMed.category}</span>
                              </div>
                              <span className="font-mono font-bold">
                                {chosenMed.stockQuantity} {chosenMed.unit} left
                              </span>
                            </div>
                          );
                        })()
                      )}

                      {/* Dosage & Frequency */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={onlinePrescDosage}
                            onChange={e => setOnlinePrescDosage(e.target.value)}
                            placeholder="500mg / 1 tab"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Frequency</label>
                          <input
                            type="text"
                            value={onlinePrescFreq}
                            onChange={e => setOnlinePrescFreq(e.target.value)}
                            placeholder="1-0-1 after food"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Duration & Quantity */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Duration</label>
                          <input
                            type="text"
                            value={onlinePrescDuration}
                            onChange={e => setOnlinePrescDuration(e.target.value)}
                            placeholder="3 days"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Dispensing Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={onlinePrescQuantity}
                            onChange={e => setOnlinePrescQuantity(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Instructions for Student</label>
                        <input
                          type="text"
                          value={onlinePrescInstructions}
                          onChange={e => setOnlinePrescInstructions(e.target.value)}
                          placeholder="Take with warm water after meals. Avoid spicy food."
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!onlinePrescMedId || isAddingPresc}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Medicine to Prescription</span>
                      </button>
                    </form>

                    {/* Prescribed Items List */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Prescription Items ({selectedConsultation.prescriptions?.length || 0}):
                      </span>

                      {selectedConsultation.prescriptions && selectedConsultation.prescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {selectedConsultation.prescriptions.map(item => (
                            <div
                              key={item.id}
                              className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col space-y-1 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{item.medicineName}</span>
                                <span className="text-teal-700 font-mono text-[11px] font-semibold">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                <span>{item.dosage}</span> • <span>{item.frequency}</span> • <span>{item.duration}</span>
                              </div>
                              {item.instructions && (
                                <p className="text-[10px] text-slate-500 italic">Note: {item.instructions}</p>
                              )}
                              <div className="pt-1 flex items-center justify-between text-[10px]">
                                <span className={item.dispensed ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'}>
                                  {item.dispensed ? '✓ Dispensed by BIT Pharmacy' : '⏳ Pending Pharmacy Dispensation'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                          No medicines prescribed yet. Fill the builder above to prescribe.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Finalize button */}
                  {selectedConsultation.status !== 'completed' && (
                    <button
                      onClick={handleCompleteOnlineConsultation}
                      disabled={isUpdatingStatus}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Consultation Completed & Issue Prescription</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Online Consultations Requests List View */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Incoming Online Consultation Requests</h3>
                  <p className="text-xs text-slate-500">Review symptoms, accept requests, chat live with students, and issue digital prescriptions.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={consultStatusFilter}
                    onChange={e => setConsultStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  >
                    <option value="all">All Statuses ({onlineConsultations.length})</option>
                    <option value="pending">Pending Only</option>
                    <option value="accepted">Accepted Only</option>
                    <option value="in_consultation">In Consultation Only</option>
                    <option value="completed">Completed Only</option>
                    <option value="rejected">Declined Only</option>
                  </select>

                  <button
                    onClick={loadDoctorConsultations}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
              </div>

              {/* Consultation List */}
              {onlineConsultations.filter(c => consultStatusFilter === 'all' || c.status === consultStatusFilter).length === 0 ? (
                <div className="py-14 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-slate-200">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No online consultation requests found for this filter.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Students can submit requests directly from their student portal dashboard.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {onlineConsultations
                    .filter(c => consultStatusFilter === 'all' || c.status === consultStatusFilter)
                    .map(consult => (
                      <div
                        key={consult.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          consult.status === 'pending'
                            ? 'bg-amber-50/50 border-amber-300'
                            : consult.status === 'in_consultation'
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-center">
                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Online</span>
                            <span className="text-xs font-bold text-teal-700 font-mono">
                              {consult.consultationNumber.replace('BIT-OC-', '#')}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-sm text-slate-900">{consult.studentName}</h4>
                              <span className="font-mono text-xs text-teal-800 bg-slate-100 px-2 py-0.5 rounded">
                                {consult.studentRoll}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                consult.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : consult.status === 'accepted'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : consult.status === 'in_consultation'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                                  : consult.status === 'completed'
                                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {consult.status.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5">
                              {consult.department} • Hostel: {consult.hostelBlock} • Preferred: <strong className="text-slate-700">{consult.preferredTime || 'Immediate'}</strong>
                            </p>

                            <p className="text-xs text-slate-800 font-medium mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-500 font-normal">Concern:</span> {consult.healthConcern}
                            </p>

                            {consult.prescriptions && consult.prescriptions.length > 0 && (
                              <p className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center gap-1">
                                <Pill className="w-3 h-3" /> {consult.prescriptions.length} medicine(s) prescribed
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center flex-wrap gap-2">
                          {consult.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConsultStatusUpdate(consult.id, 'accepted')}
                                disabled={isUpdatingStatus}
                                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => setShowRejectModal(consult.id)}
                                disabled={isUpdatingStatus}
                                className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setSelectedConsultation(consult);
                              setDoctorConsultNotes(consult.doctorNotes || '');
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                            <span>
                              {consult.status === 'completed' ? 'View Consultation' : 'Open Consultation Room'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Decline Consultation Request
              </h4>
              <button onClick={() => setShowRejectModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Please provide a reason to inform the student why this online consultation cannot proceed (e.g. requires in-person casualty visit).
            </p>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={e => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Symptoms require immediate physical clinical examination at the Health Center."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConsultStatusUpdate(showRejectModal, 'rejected', { rejectionReason: rejectionReasonInput })}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Room Drawer / Modal */}
      {activeAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 text-slate-900 shadow-sm space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest font-mono">
                  Consultation Room • Token #{activeAppointment.tokenNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{activeAppointment.studentName}</h2>
                <p className="text-xs text-slate-500">
                  {activeAppointment.rollNumber} • {activeAppointment.department} • {activeAppointment.hostelBlock}
                </p>
              </div>
              <button
                onClick={() => setActiveAppointment(null)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Vitals Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-1.5" /> Patient Vitals & Clinical Examination
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitals.bloodPressure || ''}
                    onChange={e => setVitals({ ...vitals, bloodPressure: e.target.value })}
                    placeholder="120/80"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={vitals.pulseRate || ''}
                    onChange={e => setVitals({ ...vitals, pulseRate: Number(e.target.value) })}
                    placeholder="80"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature || ''}
                    onChange={e => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                    placeholder="98.6"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitals.weight || ''}
                    onChange={e => setVitals({ ...vitals, weight: Number(e.target.value) })}
                    placeholder="65"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitals.spo2 || ''}
                    onChange={e => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                    placeholder="99"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={vitals.allergies || ''}
                    onChange={e => setVitals({ ...vitals, allergies: e.target.value })}
                    placeholder="Penicillin / None"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Gastroenteritis, Viral Upper Respiratory Tract Infection..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Advice / Hostel Rest Days</label>
                <input
                  type="text"
                  value={doctorNotes}
                  onChange={e => setDoctorNotes(e.target.value)}
                  placeholder="e.g., Advised 2 days hostel medical leave & warm liquid diet."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Prescription Builder */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center">
                <Pill className="w-4 h-4 mr-1.5" /> Digital Prescription (Linked to BIT Pharmacy Live Stock)
              </h3>

              {/* Add Prescription Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-white p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] text-slate-700 mb-1">Select Medicine from BIT Inventory</label>
                  <select
                    value={selectedMedId}
                    onChange={e => setSelectedMedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  >
                    {filteredInventory.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} (Stock: {med.stockQuantity} {med.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] text-slate-700 mb-1">Dosage Frequency</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="1-0-1 after food"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-700 mb-1">Days</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </button>
                </div>
              </div>

              {/* Prescribed Items Table */}
              {prescriptions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Prescribed Medicines:</span>
                  <div className="space-y-1.5">
                    {prescriptions.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{p.medicineName}</span>
                          <span className="text-teal-700 font-medium ml-3">{p.dosage} ({p.durationDays} days)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-500">Qty: {p.quantity}</span>
                          <button
                            onClick={() => handleRemovePrescription(p.medicineId)}
                            className="text-rose-700 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Complete Consultation Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAppointment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-700 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteConsultation}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation & Send to Pharmacy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
