import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Printer, Save, Calendar, CheckCircle2, Send, Clock, FileText, Download, ShieldCheck, CheckCheck, Eye, Search, X, AlertCircle, Store as StoreIcon, Layers, AlertTriangle } from 'lucide-react';
import { User, MagItem, MagFormEntry, InventoryItem, Option, Store, OrganizationSettings } from '../types';
import { SearchableSelect } from './SearchableSelect';
import { Select } from './Select';
import { NepaliDatePicker } from './NepaliDatePicker';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface MagFaramProps {
  currentFiscalYear: string;
  currentUser: User;
  existingForms: MagFormEntry[];
  onSave: (form: MagFormEntry) => void;
  inventoryItems: InventoryItem[];
  stores?: Store[];
  generalSettings: OrganizationSettings;
}

export const MagFaram: React.FC<MagFaramProps> = ({ currentFiscalYear, currentUser, existingForms, onSave, inventoryItems, stores = [], generalSettings }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const todayBS = useMemo(() => {
      try {
          return new NepaliDate().format('YYYY/MM/DD');
      } catch (e) {
          return '';
      }
  }, []);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [formToRejectId, setFormToRejectId] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
      storeId: '',
      itemType: 'Expendable'
  });
  const [showStockWarningModal, setShowStockWarningModal] = useState(false);
  const [stockWarningItems, setStockWarningItems] = useState<string[]>([]);

  const [items, setItems] = useState<MagItem[]>([
    { id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }
  ]);

  const [formDetails, setFormDetails] = useState({
    fiscalYear: currentFiscalYear,
    formNo: 1,
    date: '',
    status: 'Pending' as 'Pending' | 'Verified' | 'Approved' | 'Rejected',
    demandBy: { 
      name: currentUser.fullName, 
      designation: currentUser.designation, 
      date: '',
      purpose: ''
    },
    recommendedBy: { name: '', designation: '', date: '' },
    storeKeeper: { status: '', name: '', },
    receiver: { name: '', designation: '', date: '' },
    ledgerEntry: { name: '', date: '' },
    approvedBy: { name: '', designation: '', date: '' }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (editingId) return;
    const formsInCurrentFY = existingForms.filter(f => f.fiscalYear === currentFiscalYear);
    let maxFormNo = 0;
    if (formsInCurrentFY.length > 0) {
        maxFormNo = Math.max(...formsInCurrentFY.map(f => f.formNo));
    }
    setFormDetails(prev => ({
        ...prev,
        fiscalYear: currentFiscalYear,
        formNo: maxFormNo + 1
    }));
  }, [currentFiscalYear, existingForms, editingId]);

  const lockedItemType = useMemo(() => {
    for (const item of items) {
        const invItem = inventoryItems.find(i => i.itemName === item.name);
        if (invItem) return invItem.itemType;
    }
    return null;
  }, [items, inventoryItems]);

  const itemOptions: Option[] = useMemo(() => {
    let availableItems = inventoryItems;
    if (lockedItemType) {
        availableItems = inventoryItems.filter(i => i.itemType === lockedItemType);
    }
    return availableItems.map(item => ({
        id: item.id,
        value: item.itemName,
        label: `${item.itemName} [${item.itemType === 'Expendable' ? 'खर्च हुने' : 'खर्च नहुने'}] (एकाई: ${item.unit}) - मौज्दात: ${item.currentQuantity}`
    }));
  }, [inventoryItems, lockedItemType]);

  const storeOptions: Option[] = useMemo(() => {
      return stores.map(s => ({ id: s.id, value: s.id, label: s.name }));
  }, [stores]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof MagItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDateChange = (newDate: string) => {
    setFormDetails(prev => ({
        ...prev,
        date: newDate,
        demandBy: { ...prev.demandBy, date: newDate }
    }));
  };

  const handleStoreKeeperStatusChange = (value: string) => {
    const newStatus = formDetails.storeKeeper.status === value ? '' : value;
    setFormDetails(prev => ({
        ...prev,
        storeKeeper: { ...prev.storeKeeper, status: newStatus }
    }));
  };

  const handleReset = () => {
      setEditingId(null);
      setIsViewOnly(false);
      setValidationError(null);
      setItems([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
      setFormDetails({
        fiscalYear: currentFiscalYear,
        formNo: 1,
        date: '',
        status: 'Pending',
        demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: '', purpose: '' },
        recommendedBy: { name: '', designation: '', date: '' },
        storeKeeper: { status: '', name: '' },
        receiver: { name: '', designation: '', date: '' },
        ledgerEntry: { name: '', date: '' },
        approvedBy: { name: '', designation: '', date: '' }
      });
      setSaveStatus('idle');
  };

  const handleLoadRequest = (form: MagFormEntry, viewOnly: boolean = false) => {
    setEditingId(form.id);
    setIsViewOnly(viewOnly);
    setItems(form.items);
    setFormDetails({
        ...form,
        demandBy: { ...form.demandBy, purpose: form.demandBy?.purpose || '' },
        storeKeeper: form.storeKeeper || { status: '', name: '' },
        approvedBy: (form.status === 'Rejected') ? { name: '', designation: '', date: '' } : (form.approvedBy || { name: '', designation: '', date: '' })
    } as any);
  };

  const isStoreKeeper = currentUser.role === 'STOREKEEPER';
  const isApprover = ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role);
  const isContentLocked = isViewOnly || (isApprover && editingId !== null);

  const handleSave = () => {
    if (isViewOnly) return;
    if (!formDetails.date.trim()) { setValidationError('मिति खाली छ।'); return; }
    if (!formDetails.demandBy.purpose.trim()) { setValidationError('प्रयोजन खाली छ।'); return; }
    performSave();
  };

  const performSave = () => {
    setSaveStatus('saving');
    const existingForm = editingId ? existingForms.find(f => f.id === editingId) : null;
    let nextStatus: 'Pending' | 'Verified' | 'Approved' | 'Rejected' = 'Pending';
    
    if (existingForm) {
        if (isStoreKeeper && existingForm.status === 'Pending') nextStatus = 'Verified';
        else if (isApprover && existingForm.status === 'Verified') nextStatus = 'Approved';
        else nextStatus = existingForm.status || 'Pending';
    }

    const newForm: MagFormEntry = {
        id: editingId || Date.now().toString(),
        ...formDetails,
        items,
        status: nextStatus,
        approvedBy: (isApprover && nextStatus === 'Approved') ? { name: currentUser.fullName, designation: currentUser.designation, date: formDetails.date } : formDetails.approvedBy
    } as any;

    setTimeout(() => {
        onSave(newForm);
        setSaveStatus('saved');
        setTimeout(() => handleReset(), 500);
    }, 500);
  };

  const handleRejectSubmit = () => {
    if (!formToRejectId || !rejectionReasonInput.trim()) return;
    const existingForm = existingForms.find(f => f.id === formToRejectId);
    if (!existingForm) return;
    onSave({ ...existingForm, status: 'Rejected', rejectionReason: rejectionReasonInput.trim() });
    setShowRejectModal(false);
    handleReset();
  };

  const pendingRequests = existingForms.filter(f => (isStoreKeeper && f.status === 'Pending') || (isApprover && f.status === 'Verified')).sort((a,b) => b.formNo - a.formNo);
  const mySubmittedForms = existingForms.filter(f => f.demandBy?.name === currentUser.fullName).sort((a,b) => b.formNo - a.formNo);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
       {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden no-print">
              <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center justify-between">
                  <h3 className="font-bold font-nepali text-orange-800">प्रमाणिकरण/स्वीकृतिको लागि अनुरोधहरू</h3>
                  <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                          <tr><th className="px-6 py-3">Form No</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {pendingRequests.map(form => (
                              <tr key={form.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-3 font-mono">#{form.formNo}</td>
                                  <td className="px-6 py-3 font-nepali">{form.date}</td>
                                  <td className="px-6 py-3 text-xs">{form.status}</td>
                                  <td className="px-6 py-3 text-right">
                                      <button onClick={() => handleLoadRequest(form, false)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold border border-blue-200">Load</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
       )}

       {validationError && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm text-red-700 text-sm">{validationError}</div>}

       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
          <h2 className="font-bold text-slate-700 font-nepali text-lg">माग फारम (Demand Form)</h2>
          <div className="flex gap-2">
            {!isViewOnly && (
                <>
                    {editingId && <button onClick={() => { setFormToRejectId(editingId); setShowRejectModal(true); }} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">Reject</button>}
                    <button onClick={handleAddItem} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Add Row</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">{saveStatus === 'saving' ? 'Saving...' : 'Save & Sent'}</button>
                </>
            )}
            <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Print</button>
          </div>
       </div>

       <div id="mag-faram-container" className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] text-slate-900 font-nepali">
          <div className="text-right text-xs font-bold mb-4">म.ले.प.फारम नं: ४०१</div>
          <div className="mb-8 text-center space-y-1">
              <h1 className="text-xl font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
              <h2 className="text-lg font-bold">{generalSettings.subTitleNepali}</h2>
              <div className="text-xs mt-2 space-x-3 text-slate-600">{generalSettings.address} | फोन: {generalSettings.phone}</div>
              <h2 className="text-xl font-bold underline underline-offset-4 pt-4">माग फारम</h2>
          </div>

          <div className="flex justify-end mb-4 text-sm font-medium space-y-1">
             <div className="w-64 space-y-1">
                <div className="flex justify-between"><span>आर्थिक वर्ष :</span><span className="border-b border-dotted border-slate-800 w-32 text-center">{formDetails.fiscalYear}</span></div>
                <div className="flex justify-between"><span>माग फारम नं:</span><span className="border-b border-dotted border-slate-800 w-32 text-center text-red-600 font-bold">{formDetails.formNo}</span></div>
                <div className="flex justify-between"><span>मिति:</span>
                    <NepaliDatePicker value={formDetails.date} onChange={handleDateChange} format="YYYY/MM/DD" label="" hideIcon={true} disabled={isContentLocked} inputClassName="border-b border-dotted border-slate-800 text-center w-32" />
                </div>
             </div>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-sm mb-8">
                <thead>
                    <tr className="bg-slate-50 text-center">
                        <th className="border border-slate-900 p-2 w-12" rowSpan={2}>क्र.सं.</th>
                        <th className="border border-slate-900 p-2 w-72" rowSpan={2}>सामानको नाम</th>
                        <th className="border border-slate-900 p-2" rowSpan={2}>स्पेसिफिकेसन</th>
                        <th className="border border-slate-900 p-1" colSpan={2}>माग गरिएको</th>
                        <th className="border border-slate-900 p-2 w-24" rowSpan={2}>कैफियत</th>
                    </tr>
                    <tr className="bg-slate-50 text-center">
                        <th className="border border-slate-900 p-1 w-20">एकाई</th>
                        <th className="border border-slate-900 p-1 w-20">परिमाण</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.id}>
                            <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                            <td className="border border-slate-900 p-1">
                                {isContentLocked ? <div className="p-1">{item.name}</div> : 
                                <SearchableSelect options={itemOptions} value={item.name} onChange={v => updateItem(item.id, 'name', v)} onSelect={o => { const inv = inventoryItems.find(i => i.id === o.id); if (inv) setItems(prev => prev.map(r => r.id === item.id ? {...r, unit: inv.unit, specification: inv.specification || ''} : r)) }} placeholder="सामान छान्नुहोस्" className="!border-none" /> }
                            </td>
                            <td className="border border-slate-900 p-1"><input value={item.specification} onChange={e => updateItem(item.id, 'specification', e.target.value)} disabled={isContentLocked} className="w-full bg-transparent outline-none p-1" /></td>
                            <td className="border border-slate-900 p-1 text-center"><input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} disabled={isContentLocked} className="w-full bg-transparent outline-none text-center" /></td>
                            <td className="border border-slate-900 p-1 text-center font-bold"><input value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} disabled={isContentLocked} className="w-full bg-transparent outline-none text-center" /></td>
                            <td className="border border-slate-900 p-1"><input value={item.remarks} onChange={e => updateItem(item.id, 'remarks', e.target.value)} disabled={isContentLocked} className="w-full bg-transparent outline-none" /></td>
                        </tr>
                    ))}
                </tbody>
          </table>

          <div className="grid grid-cols-3 gap-8 text-xs pt-8">
             <div className="space-y-6">
                 <div><h4 className="font-bold mb-2">माग गर्नेको</h4>
                 <div className="space-y-1">
                    <div>नाम: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.demandBy.name}</span></div>
                    <div>पद: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.demandBy.designation}</span></div>
                    <div>मिति: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.demandBy.date}</span></div>
                    <div>प्रयोजन: <input value={formDetails.demandBy.purpose} onChange={e => setFormDetails({...formDetails, demandBy: {...formDetails.demandBy, purpose: e.target.value}})} disabled={isContentLocked} className="border-b border-dotted border-slate-400 outline-none w-24 bg-transparent"/></div>
                 </div></div>
             </div>
             <div className="space-y-6">
                 <div><h4 className="font-bold mb-2">सिफारिस गर्ने</h4>
                 <div className="space-y-1">
                    <div>नाम: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.recommendedBy.name}</span></div>
                    <div>पद: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.recommendedBy.designation}</span></div>
                 </div></div>
             </div>
             <div className="space-y-6">
                 <div><h4 className="font-bold mb-2">स्वीकृत गर्ने</h4>
                 <div className="space-y-1">
                    <div>नाम: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.approvedBy.name}</span></div>
                    <div>पद: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.approvedBy.designation}</span></div>
                    <div>मिति: <span className="border-b border-dotted border-slate-400 min-w-[100px] inline-block">{formDetails.approvedBy.date}</span></div>
                 </div></div>
             </div>
          </div>
       </div>

       {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                  <h3 className="font-bold text-lg mb-4">फारम अस्वीकृत गर्नुहोस्</h3>
                  <textarea value={rejectionReasonInput} onChange={e => setRejectionReasonInput(e.target.value)} rows={4} className="w-full border p-2 rounded mb-4" placeholder="कारण उल्लेख गर्नुहोस्..."></textarea>
                  <div className="flex justify-end gap-2"><button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-600">Cancel</button><button onClick={handleRejectSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg">Reject</button></div>
              </div>
          </div>
       )}
    </div>
  );
};