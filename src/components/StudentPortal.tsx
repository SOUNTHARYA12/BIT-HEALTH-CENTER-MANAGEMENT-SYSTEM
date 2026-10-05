import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, Medicine, TriageResult, User } from '../types';
import {
  fetchDoctors,
  bookAppointment,
  fetchAppointments,
  fetchInventory,
  runAITriage
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
  PhoneCall
} from 'lucide-react';

interface StudentPortalProps {
  currentUser?: User | null;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'my_tokens' | 'pharmacy' | 'triage'>('book');

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
          if (data[0].timeSlots.length > 0) {
            setSelectedTimeSlot(data[0].timeSlots[0]);
          }
        }
      })
      .catch(err => console.error('Error loading doctors:', err));
  }, []);

  // Load My Appointments when Roll Number changes or tab switches
  const loadAppointments = () => {
    if (!studentRoll) return;
    fetchAppointments({ rollNumber: studentRoll })
      .then(data => setMyAppointments(data))
      .catch(err => console.error('Error loading appointments:', err));
  };

  useEffect(() => {
    loadAppointments();
  }, [studentRoll, activeTab]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Student Identity Card & Preset Switcher */}
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
          <span className="text-teal-800 font-semibold">Official BIT SSO Account</span>
        </div>
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
          <span>Book Appointment</span>
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
          <span>My Tokens & History</span>
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
          <span>BIT Pharmacy Medicine Search</span>
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

      {/* TAB 1: BOOK APPOINTMENT */}
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
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-700 text-slate-900 rounded-lg text-xs font-medium"
                  >
                    Book Another Appointment
                  </button>
                  <button
                    onClick={() => setActiveTab('my_tokens')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium"
                  >
                    View Live Token Status
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Schedule Medical Appointment</h3>
                  <p className="text-xs text-slate-500">Book an OPD consultation with BIT campus doctors.</p>
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
                            ? 'bg-teal-950/40 border-teal-500 text-white shadow-md'
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
                          ? 'bg-teal-950/40 border-teal-500 text-teal-800'
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
                          ? 'bg-amber-950/40 border-amber-500 text-amber-800'
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
                          ? 'bg-red-950/40 border-red-500 text-rose-800'
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
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-teal-600/20 text-xs flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirm & Generate Token</span>
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
                <li>Students must carry their official **BIT ID Card** during consultation.</li>
                <li>All medicines prescribed in the BIT Health Center dispensary are **100% Free** for registered students.</li>
                <li>For emergency ambulance dispatch inside campus, call **Ext 108**.</li>
                <li>Please arrive 5 minutes prior to your allocated time slot.</li>
              </ul>
            </div>

            {/* Quick AI Triage Teaser Banner */}
            <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-200 rounded-2xl p-5 shadow-sm text-white">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                Unsure about your symptoms?
              </div>
              <p className="text-xs text-slate-700 mb-3">
                Use our Gemini-powered AI Health Triage tool to get instant guidance on urgency and recommended specialist.
              </p>
              <button
                onClick={() => setActiveTab('triage')}
                className="w-full bg-amber-50 hover:bg-amber-50 text-amber-800 border border-amber-500/40 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center"
              >
                Launch AI Symptom Checker <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY TOKENS & APPOINTMENT HISTORY */}
      {activeTab === 'my_tokens' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Appointments & Token History</h3>
              <p className="text-xs text-slate-500">Track live token queue status and digital doctor prescriptions.</p>
            </div>
            <button
              onClick={loadAppointments}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-700 rounded-lg text-xs font-medium flex items-center"
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
                    <div className="bg-teal-950/30 border border-teal-200 p-3 rounded-xl text-xs space-y-2">
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
                            <div key={idx} className="flex justify-between text-[11px] bg-white/80 p-2 rounded">
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

      {/* TAB 3: PHARMACY MEDICINE AVAILABILITY LOOKUP */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">BIT Campus Pharmacy Stock Search</h3>
              <p className="text-xs text-slate-500">Search available medicines, generic names, and dosage forms in real-time.</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={medSearch}
                onChange={e => setMedSearch(e.target.value)}
                placeholder="Search Paracetamol, Dolo, Antibiotic..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacyMedicines.map(med => (
              <div
                key={med.id}
                className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 shadow-md space-y-2 relative"
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

      {/* TAB 4: AI HEALTH TRIAGE HELPER */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-bold text-slate-900">AI Health Triage Assistant</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Powered by Gemini 2.5 Flash API. Get instant preliminary triage advice and doctor department recommendations.
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
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/10"
              >
                {isTriaging ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Gemini AI Triage Check</span>
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
                <p className="text-xs text-slate-500">Gemini AI is evaluating your health parameters...</p>
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
                  <span className="font-bold text-slate-800 block">AI Medical Advice:</span>
                  <p className="text-slate-700 leading-relaxed">{triageResult.advice}</p>
                </div>

                {triageResult.redFlags && triageResult.redFlags.length > 0 && (
                  <div className="bg-red-950/30 border border-rose-200 p-4 rounded-xl text-xs space-y-1">
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

                <button
                  onClick={() => setActiveTab('book')}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Proceed to Book Appointment with Specialist
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Enter your symptoms on the left to receive AI-powered preliminary triage guidance.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
