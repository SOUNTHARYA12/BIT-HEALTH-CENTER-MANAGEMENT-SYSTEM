import React, { useState, useEffect } from 'react';
import { Medicine, StockLog, Appointment, OnlineConsultation } from '../types';
import {
  fetchInventory,
  addMedicineStock,
  updateMedicine,
  dispenseMedicine,
  fetchStockAlerts,
  fetchStockLogs,
  fetchAppointments,
  fetchConsultations,
  dispenseConsultationPrescription
} from '../services/api';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Edit2,
  PackageCheck,
  History,
  X,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface PharmacyPortalProps {
  targetTab?: string;
}

export const PharmacyPortal: React.FC<PharmacyPortalProps> = ({ targetTab }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'pending_prescriptions' | 'logs'>('inventory');

  useEffect(() => {
    if (targetTab && ['inventory', 'pending_prescriptions', 'logs'].includes(targetTab)) {
      setActiveTab(targetTab as any);
    }
  }, [targetTab]);

  // Loaded Data
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [pendingOnlineConsultations, setPendingOnlineConsultations] = useState<OnlineConsultation[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [alertFilterOnly, setAlertFilterOnly] = useState(false);

  // Add/Receive Stock Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<Medicine['category']>('Antipyretics');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [minThreshold, setMinThreshold] = useState(30);
  const [unit, setUnit] = useState<Medicine['unit']>('Tablets');
  const [locationRack, setLocationRack] = useState('Rack A-01');

  // Quick Edit Stock Modal
  const [editMed, setEditMed] = useState<Medicine | null>(null);
  const [newQty, setNewQty] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetchInventory({ alertOnly: alertFilterOnly }),
      fetchStockLogs(),
      fetchAppointments({ status: 'completed' }),
      fetchConsultations()
    ])
      .then(([meds, logs, apts, consults]) => {
        setInventory(meds);
        setStockLogs(logs);

        // Filter appointments that have undispensed prescriptions
        const pending = apts.filter(a =>
          a.prescriptions && a.prescriptions.some(p => !p.dispensed)
        );
        setPendingAppointments(pending);

        // Filter online consultations that have undispensed prescriptions
        const pendingOnline = consults.filter(c =>
          c.prescriptions && c.prescriptions.some(p => !p.dispensed)
        );
        setPendingOnlineConsultations(pendingOnline);

        setIsLoading(false);
      })
      .catch(err => {
        console.error('Pharmacy load error:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [alertFilterOnly]);

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !batchNumber || !expiryDate) return;

    try {
      await addMedicineStock({
        name: medName,
        genericName: genericName || medName,
        category,
        batchNumber,
        expiryDate,
        stockQuantity,
        minThreshold,
        unit,
        locationRack,
        unitPrice: 0
      });

      setShowAddModal(false);
      setStatusMessage(`Successfully added/restocked ${medName}`);
      loadData();
      // Reset form
      setMedName('');
      setGenericName('');
      setBatchNumber('');
    } catch (err: any) {
      alert(err.message || 'Failed to add stock');
    }
  };

  const handleUpdateStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMed) return;

    try {
      await updateMedicine(editMed.id, {
        stockQuantity: newQty,
        performedBy: 'Pharmacist - Manual Stock Audit'
      });
      setEditMed(null);
      setStatusMessage(`Updated stock level for ${editMed.name}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispenseItem = async (appointmentId: string, medicineId: string, qty: number) => {
    try {
      await dispenseMedicine({
        appointmentId,
        medicineId,
        quantity: qty,
        dispenserName: 'BIT Health Center Pharmacist'
      });
      setStatusMessage('Prescription item dispensed successfully!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Dispensing failed');
    }
  };

  const handleDispenseConsultationItem = async (consultationId: string, prescriptionItemId: string) => {
    try {
      await dispenseConsultationPrescription(consultationId, prescriptionItemId, 'BIT Health Center Pharmacist');
      setStatusMessage('Online consultation prescription dispensed & deducted from medication stock!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Dispensing failed');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Medicine Name', 'Generic Name', 'Category', 'Batch No', 'Expiry Date', 'Stock Qty', 'Min Threshold', 'Rack Location'];
    const rows = inventory.map(m => [
      m.id,
      `"${m.name}"`,
      `"${m.genericName}"`,
      m.category,
      m.batchNumber,
      m.expiryDate,
      m.stockQuantity,
      m.minThreshold,
      m.locationRack
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BIT_HealthCenter_Medication_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Inventory
  const filteredInventory = inventory.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockCount = inventory.filter(m => m.stockQuantity <= m.minThreshold).length;
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 86400000);
  const nearExpiryCount = inventory.filter(m => new Date(m.expiryDate) <= thirtyDays).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Pill className="w-6 h-6 mr-2 text-teal-700" /> BIT Pharmacy Medication Stock Control System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory control, batch expiry tracking, and prescription dispensing.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-700 text-teal-800 rounded-xl text-xs font-semibold flex items-center border border-slate-300 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Stock CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center shadow-lg shadow-teal-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Receive Stock Batch
          </button>
        </div>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Stock Items</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{inventory.length}</div>
        </div>

        <div
          onClick={() => setAlertFilterOnly(!alertFilterOnly)}
          className={`border rounded-xl p-4 cursor-pointer transition-all ${
            alertFilterOnly
              ? 'bg-amber-950/60 border-amber-500 text-amber-800'
              : 'bg-white border-slate-200 text-white hover:border-amber-500/50'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] uppercase font-semibold text-amber-700">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{lowStockCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
          <span className="text-[11px] text-rose-700 uppercase font-semibold">Near Expiry (30 Days)</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{nearExpiryCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
          <span className="text-[11px] text-emerald-700 uppercase font-semibold">Pending Prescriptions</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{pendingAppointments.length}</div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex justify-between items-center">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage('')} className="text-slate-600 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-sm">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medicine Stock Inventory ({filteredInventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending_prescriptions')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors relative ${
            activeTab === 'pending_prescriptions'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Pending Prescriptions to Dispense</span>
          {pendingAppointments.length > 0 && (
            <span className="bg-emerald-50 text-emerald-800 font-bold text-xs px-2 py-0.2 rounded-full">
              {pendingAppointments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 font-medium border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Audit Log</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Paracetamol, Dolo, Batch..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto text-xs">
              {['All', 'Antibiotics', 'Antipyretics', 'Analgesics', 'Anti-allergic', 'First Aid', 'Ointments'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Medicine & Generic</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Batch No</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Rack</th>
                  <th className="py-3 px-3">Stock Level</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {filteredInventory.map(med => {
                  const isLow = med.stockQuantity <= med.minThreshold;
                  const expDate = new Date(med.expiryDate);
                  const isExpiring = expDate <= thirtyDays;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">{med.name}</div>
                        <div className="text-[11px] text-slate-500 italic">{med.genericName}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-teal-800 font-medium px-2 py-0.5 rounded text-[10px]">
                          {med.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700">{med.batchNumber}</td>

                      <td className="py-3 px-3">
                        <span className={`font-mono ${isExpiring ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                          {med.expiryDate}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500">{med.locationRack}</td>

                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isLow ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {med.stockQuantity} {med.unit}
                          </span>
                          {isLow && (
                            <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setEditMed(med);
                            setNewQty(med.stockQuantity);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-700 text-teal-800 rounded-lg text-[11px] font-medium"
                        >
                          <Edit2 className="w-3 h-3 inline mr-1" /> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING PRESCRIPTIONS */}
      {activeTab === 'pending_prescriptions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Doctor Prescriptions Ready to Dispense</h3>
              <p className="text-xs text-slate-500">
                Fulfill student prescriptions from both Physical OPD Appointments and Online Doctor Consultations. Live medication stock is deducted upon dispense.
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Queue
            </button>
          </div>

          {/* SECTION A: ONLINE DOCTOR CONSULTATION PRESCRIPTIONS */}
          {pendingOnlineConsultations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
                <h4 className="text-sm font-bold text-teal-800 uppercase tracking-wide">
                  Online Doctor Consultations ({pendingOnlineConsultations.length})
                </h4>
              </div>

              <div className="space-y-4">
                {pendingOnlineConsultations.map(consult => (
                  <div key={consult.id} className="bg-white border-2 border-teal-100 rounded-2xl p-5 shadow-sm text-slate-900 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {consult.consultationNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold bg-teal-100 text-teal-800 px-2 py-0.2 rounded-full">
                            Digital Consultation
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {consult.studentName} ({consult.studentRoll})
                        </h4>
                        <p className="text-xs text-slate-500">{consult.department} • Hostel: {consult.hostelBlock}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-700 font-semibold block">Doctor: {consult.doctorName}</span>
                        <span className="text-[10px] text-slate-500">{consult.doctorSpecialization}</span>
                      </div>
                    </div>

                    {consult.doctorNotes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 font-medium">Doctor Notes:</span> {consult.doctorNotes}
                      </p>
                    )}

                    {/* Online Prescriptions Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Prescribed Medicines:</span>
                      <div className="space-y-2">
                        {consult.prescriptions?.map(p => (
                          <div
                            key={p.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{p.medicineName}</span>
                              <span className="text-teal-700 font-medium ml-3">{p.dosage} • {p.frequency} ({p.duration})</span>
                              <span className="text-slate-500 ml-3">Qty: {p.quantity}</span>
                              {p.instructions && (
                                <span className="block text-[11px] text-slate-500 mt-0.5">Instructions: {p.instructions}</span>
                              )}
                            </div>

                            {p.dispensed ? (
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase border border-emerald-200">
                                Already Dispensed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDispenseConsultationItem(consult.id, p.id)}
                                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5 mr-1" /> Dispense from BIT Stock
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: PHYSICAL APPOINTMENTS PRESCRIPTIONS */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Physical OPD Queue Appointments ({pendingAppointments.length})
            </h4>

            {pendingAppointments.length === 0 && pendingOnlineConsultations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No pending doctor prescriptions waiting to be dispensed.
              </div>
            ) : pendingAppointments.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-slate-500 text-xs">
                No pending physical appointments prescriptions.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAppointments.map(apt => (
                  <div key={apt.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono font-bold text-teal-700">{apt.tokenNumber}</span>
                        <h4 className="text-base font-bold text-slate-900">{apt.studentName} ({apt.rollNumber})</h4>
                        <p className="text-xs text-slate-500">{apt.department} • {apt.hostelBlock}</p>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Doctor: {apt.doctorName}</span>
                    </div>

                    {apt.diagnosis && (
                      <p className="text-xs text-amber-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 font-normal">Diagnosis:</span> {apt.diagnosis}
                      </p>
                    )}

                    {/* Prescription Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Prescribed Medicines:</span>
                      <div className="space-y-2">
                        {apt.prescriptions?.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{p.medicineName}</span>
                              <span className="text-teal-700 font-medium ml-3">{p.dosage} ({p.durationDays} days)</span>
                              <span className="text-slate-500 ml-3">Qty: {p.quantity}</span>
                            </div>

                            {p.dispensed ? (
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase border border-emerald-200">
                                Already Dispensed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDispenseItem(apt.id, p.medicineId, p.quantity)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5 mr-1" /> Dispense Medicine
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK AUDIT LOG */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Stock Audit & Movement History</h3>

          <div className="space-y-2">
            {stockLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      log.type === 'received'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {log.type === 'received' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <span className="font-bold text-slate-900">{log.medicineName}</span>
                    <span className="text-slate-500 text-[11px] block">{log.notes}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  <span
                    className={`font-mono font-bold text-xs mr-3 ${
                      log.type === 'received' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {log.type === 'received' ? '+' : '-'}{log.quantity}
                  </span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / RECEIVE STOCK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 text-slate-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Receive New Medicine Batch</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">Generic / Active Name</label>
                <input
                  type="text"
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Antipyretics">Antipyretics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Anti-allergic">Anti-allergic</option>
                    <option value="First Aid">First Aid</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Digestive">Digestive</option>
                    <option value="Ointments">Ointments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={e => setBatchNumber(e.target.value)}
                    placeholder="BIT-2026-B01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1">Min Alert Limit</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={e => setMinThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Add Batch to Live Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADJUST QUANTITY */}
      {editMed && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 text-slate-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Adjust Stock Level</h3>
              <button onClick={() => setEditMed(null)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-teal-700 text-sm">{editMed.name}</h4>
              <p className="text-xs text-slate-500">Batch: {editMed.batchNumber} • Current: {editMed.stockQuantity} {editMed.unit}</p>
            </div>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 mb-1">New Total Stock Quantity</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={e => setNewQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-xl text-xs"
              >
                Save Stock Audit Level
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
