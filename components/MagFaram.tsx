import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Printer, Save, FileText, Send, X, AlertCircle } from 'lucide-react';
import { User, MagItem, MagFormEntry, InventoryItem, Option, Store, OrganizationSettings } from '../types';
import { SearchableSelect } from './SearchableSelect';
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
  const [items, setItems] = useState<MagItem[]>([
    { id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }
  ]);

  const [formDetails, setFormDetails] = useState({
    fiscalYear: currentFiscalYear,
    formNo: 1,
    date: '',
    status: 'Pending' as 'Pending' | 'Verified' | 'Approved' | 'Rejected',
    demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: '', purpose: '' },
    recommendedBy: { name: '', designation: '', date: '' },
    approvedBy: { name: '', designation: '', date: '' }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (editingId) return;
    const formsInCurrentFY = existingForms.filter(f => f.fiscalYear === currentFiscalYear);
    const maxFormNo = formsInCurrentFY.length > 0 ? Math.max(...formsInCurrentFY.map(f => f.formNo)) : 0;
    setFormDetails(prev => ({ ...prev, fiscalYear: currentFiscalYear, formNo: maxFormNo + 1 }));
  }, [currentFiscalYear, existingForms, editingId]);

  const itemOptions: Option[] = useMemo(() => inventoryItems.map(item => ({
    id: item.id,
    value: item.itemName,
    label: `${item.itemName} (${item.unit}) - Qty: ${item.currentQuantity}`
  })), [inventoryItems]);

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

  const handleSave = () => {
    if (isViewOnly) return;
    if (!formDetails.date) { setValidationError('मिति छान्नुहोस्'); return; }
    
    setSaveStatus('saving');
    const newForm: MagFormEntry = {
      id: editingId || Date.now().toString(),
      ...formDetails,
      items,
      status: 'Pending'
    };
    
    setTimeout(() => {
      onSave(newForm);
      setSaveStatus('saved');
      handleReset();
    }, 500);
  };

  const handleReset = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setValidationError(null);
    setItems([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
    setSaveStatus('idle');
  };

  const handleLoadRequest = (form: MagFormEntry) => {
    setEditingId(form.id);
    setIsViewOnly(true);
    setItems(form.items);
    setFormDetails({ ...form } as any);
  };

  const pendingRequests = existingForms.filter(f => f.status === 'Pending').sort((a,b) => b.formNo - a.formNo);

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden no-print">
          <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center justify-between">
            <h3 className="font-bold font-nepali text-orange-800">माग फारमहरू</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50">
                <tr><th className="px-6 py-3">No</th><th className="px-6 py-3">Date</th><th className="px-6 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map(form => (
                  <tr key={form.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">#{form.formNo}</td>
                    <td className="px-6 py-3 font-nepali">{form.date}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleLoadRequest(form)} className="text-blue-600 font-bold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border no-print">
        <h2 className="font-bold text-slate-700 font-nepali">माग फारम (Demand Form)</h2>
        <div className="flex gap-2">
          {!isViewOnly && (
            <button onClick={handleSave} className="bg-primary-600 text-white px-4 py-2 rounded-lg">
              {saveStatus === 'saving' ? 'Saving...' : 'Save & Send'}
            </button>
          )}
          <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg">Print</button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] text-slate-900 font-nepali">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
          <h2 className="text-lg font-bold">{generalSettings.subTitleNepali}</h2>
          <p className="text-xs">{generalSettings.address}</p>
          <h2 className="text-xl font-bold underline mt-4">माग फारम</h2>
        </div>

        <div className="flex justify-end mb-4 text-sm">
          <div className="w-64 space-y-1">
            <div className="flex justify-between"><span>आर्थिक वर्ष :</span><span>{formDetails.fiscalYear}</span></div>
            <div className="flex justify-between"><span>माग फारम नं:</span><span className="text-red-600 font-bold">{formDetails.formNo}</span></div>
            <div className="flex justify-between items-center gap-2"><span>मिति:</span>
              <NepaliDatePicker value={formDetails.date} onChange={(v) => setFormDetails({...formDetails, date: v})} hideIcon label="" />
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-900 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-900 p-2">क्र.सं.</th>
              <th className="border border-slate-900 p-2">सामानको नाम</th>
              <th className="border border-slate-900 p-2">एकाई</th>
              <th className="border border-slate-900 p-2">परिमाण</th>
              <th className="border border-slate-900 p-2">कैफियत</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                <td className="border border-slate-900 p-1">
                  <SearchableSelect options={itemOptions} value={item.name} onChange={v => updateItem(item.id, 'name', v)} placeholder="सामान..." />
                </td>
                <td className="border border-slate-900 p-1 text-center"><input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full text-center outline-none" /></td>
                <td className="border border-slate-900 p-1 text-center"><input value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="w-full text-center outline-none font-bold" /></td>
                <td className="border border-slate-900 p-1"><input value={item.remarks} onChange={e => updateItem(item.id, 'remarks', e.target.value)} className="w-full outline-none" /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-8 text-xs pt-12">
          <div className="space-y-2">
            <h4 className="font-bold mb-2 underline">माग गर्नेको</h4>
            <div>नाम: <span className="border-b border-dotted border-slate-600 min-w-[100px] inline-block">{formDetails.demandBy.name}</span></div>
            <div>पद: <span className="border-b border-dotted border-slate-600 min-w-[100px] inline-block">{formDetails.demandBy.designation}</span></div>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold mb-2 underline">सिफारिस गर्ने</h4>
            <div>नाम: ...............................</div>
            <div>पद: ...............................</div>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold mb-2 underline">स्वीकृत गर्ने</h4>
            <div>नाम: ...............................</div>
            <div>पद: ...............................</div>
          </div>
        </div>
      </div>
    </div>
  );
};