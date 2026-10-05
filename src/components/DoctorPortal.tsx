import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, Medicine, PrescribedMedicine, PatientVitals, User } from '../types';
import {
  fetchDoctors,
  updateDoctorStatus,
  fetchAppointments,
  updateAppointmentStatus,
  saveConsultation,
  fetchInventory
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
  ShieldCheck
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

  useEffect(() => {
    loadDoctorAppointments();
  }, [selectedDoctorId, currentUser, loggedInDoctor?.id]);

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
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-700 rounded-lg text-xs font-medium flex items-center"
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
                    ? 'bg-red-950/30 border-red-500/50'
                    : apt.urgency === 'urgent'
                    ? 'bg-amber-950/30 border-amber-500/50'
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
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-1"
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
