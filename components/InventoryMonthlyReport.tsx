import React, { useState, useMemo } from 'react';
import { Printer, Calendar, FileText, Filter, Package, AlertCircle, ArrowRight, Hash, FilePlus, Save, CheckCircle2, X } from 'lucide-react';
import { Select } from './Select';
import { Input } from './Input';
import { EnglishDatePicker } from './EnglishDatePicker';
import { FISCAL_YEARS } from '../constants';
import { InventoryItem, Store, User, MagFormEntry, OrganizationSettings } from '../types';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface InventoryMonthlyReportProps {
  currentFiscalYear: string;
  currentUser: User;
  inventoryItems: InventoryItem[];
  stores: Store[]; 
  magForms: MagFormEntry[];
  onSaveMagForm: (form: MagFormEntry) => void;
  generalSettings: OrganizationSettings;
}

const getTodayNepaliDate = () => {
  try {
      return new NepaliDate().format('YYYY/MM/DD');
  } catch (e) {
      return '';
  }
};

const getNepaliMonthName = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d, 12, 0, 0);
        const nd = new NepaliDate(date);
        const months = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'];
        return months[nd.getMonth()] || '';
    } catch (e) {
        return '';
    }
};

export const InventoryMonthlyReport: React.FC<InventoryMonthlyReportProps> = ({ 
  currentFiscalYear, 
  currentUser,
  inventoryItems,
  stores,
  magForms,
  onSaveMagForm,
  generalSettings
}) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const reportNepaliMonth = useMemo(() => {
      if (toDate) return getNepaliMonthName(toDate);
      if (fromDate) return getNepaliMonthName(fromDate);
      return '';
  }, [fromDate, toDate]);

  const reportData = useMemo(() => {
    return inventoryItems
        .filter(item => item.fiscalYear === selectedFiscalYear && item.itemType === 'Expendable')
        .map(item => ({
            ...item,
            asl: item.approvedStockLevel || 0,
            eop: item.emergencyOrderPoint || 0,
            qtyToOrder: Math.max(0, (item.approvedStockLevel || 0) - item.currentQuantity)
        }));
  }, [inventoryItems, selectedFiscalYear]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-end gap-4 bg-white p-4 rounded-xl border no-print shadow-sm">
        <div className="flex gap-4">
            <div className="w-48"><Select label="Fiscal Year" options={FISCAL_YEARS} value={selectedFiscalYear} onChange={e => setSelectedFiscalYear(e.target.value)}/></div>
            <div className="w-48"><EnglishDatePicker label="Date To" value={toDate} onChange={setToDate}/></div>
        </div>
        <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Print Report</button>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] text-slate-900 font-nepali text-[10px] print:shadow-none print:p-0">
        <div className="text-center mb-8">
            <h1 className="text-lg font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
            <h2 className="text-md font-bold">जिन्सी मासिक प्रतिवेदन ({reportNepaliMonth})</h2>
            <p className="text-[8px]">{generalSettings.address}</p>
        </div>

        <table className="w-full border-collapse border border-slate-900 text-center">
            <thead className="bg-slate-50 font-bold">
                <tr>
                    <th className="border border-slate-900 p-1">S.N</th>
                    <th className="border border-slate-900 p-1 text-left">Item Name</th>
                    <th className="border border-slate-900 p-1">Unit</th>
                    <th className="border border-slate-900 p-1">Stock</th>
                    <th className="border border-slate-900 p-1">ASL</th>
                    <th className="border border-slate-900 p-1">EOP</th>
                    <th className="border border-slate-900 p-1 text-blue-700">Order Qty</th>
                </tr>
            </thead>
            <tbody>
                {reportData.map((d, i) => (
                    <tr key={d.id}>
                        <td className="border border-slate-900 p-1">{i + 1}</td>
                        <td className="border border-slate-900 p-1 text-left">{d.itemName}</td>
                        <td className="border border-slate-900 p-1">{d.unit}</td>
                        <td className="border border-slate-900 p-1 font-bold">{d.currentQuantity}</td>
                        <td className="border border-slate-900 p-1">{d.asl}</td>
                        <td className="border border-slate-900 p-1">{d.eop}</td>
                        <td className="border border-slate-900 p-1 font-bold text-blue-700">{d.qtyToOrder || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="grid grid-cols-3 gap-8 mt-12 text-[10px]">
            <div><div className="border-t border-slate-800 text-center pt-1">Prepared By</div></div>
            <div><div className="border-t border-slate-800 text-center pt-1">Verified By</div></div>
            <div><div className="border-t border-slate-800 text-center pt-1">Approved By</div></div>
        </div>
      </div>
    </div>
  );
};