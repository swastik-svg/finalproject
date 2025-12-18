import React, { useState, useMemo } from 'react';
import { Printer, Calendar } from 'lucide-react';
import { Select } from './Select';
import { FISCAL_YEARS } from '../constants';
import { InventoryItem, OrganizationSettings } from '../types';

interface InventoryMonthlyReportProps {
  currentFiscalYear: string;
  inventoryItems: InventoryItem[];
  generalSettings: OrganizationSettings;
}

export const InventoryMonthlyReport: React.FC<InventoryMonthlyReportProps> = ({ currentFiscalYear, inventoryItems, generalSettings }) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);

  const reportData = useMemo(() => {
    return inventoryItems.filter(item => item.fiscalYear === selectedFiscalYear && item.itemType === 'Expendable');
  }, [inventoryItems, selectedFiscalYear]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end bg-white p-4 rounded-xl border no-print shadow-sm">
        <div className="w-48"><Select label="Fiscal Year" options={FISCAL_YEARS} value={selectedFiscalYear} onChange={e => setSelectedFiscalYear(e.target.value)}/></div>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Print Report</button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg text-xs font-nepali">
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
          <h2 className="text-md font-bold">जिन्सी मासिक प्रतिवेदन</h2>
          <p>{generalSettings.address}</p>
        </div>

        <table className="w-full border-collapse border border-slate-900 text-center">
          <thead>
            <tr className="bg-slate-50 font-bold">
              <th className="border border-slate-900 p-1">क्र.सं.</th>
              <th className="border border-slate-900 p-1 text-left">सामानको नाम</th>
              <th className="border border-slate-900 p-1">एकाई</th>
              <th className="border border-slate-900 p-1">मौज्दात</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-slate-900 p-1">{idx + 1}</td>
                <td className="border border-slate-900 p-1 text-left">{item.itemName}</td>
                <td className="border border-slate-900 p-1">{item.unit}</td>
                <td className="border border-slate-900 p-1 font-bold">{item.currentQuantity}</td>
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr><td colSpan={4} className="border border-slate-900 p-4 italic">डाटा फेला परेन</td></tr>
            )}
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-8 mt-12 text-center">
          <div className="border-t border-slate-800">तयार गर्ने</div>
          <div className="border-t border-slate-800">प्रमाणित गर्ने</div>
          <div className="border-t border-slate-800">स्वीकृत गर्ने</div>
        </div>
      </div>
    </div>
  );
};