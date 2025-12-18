import React, { useState, useMemo } from 'react';
import { Printer, Calendar } from 'lucide-react';
import { Select } from './Select';
import { FISCAL_YEARS } from '../constants';
import { RabiesPatient } from '../types';

interface RabiesReportProps {
  currentFiscalYear: string;
  currentUser: { organizationName: string; fullName: string; };
  patients: RabiesPatient[];
}

export const RabiesReport: React.FC<RabiesReportProps> = ({ currentFiscalYear, currentUser, patients }) => {
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);

  const animals = ['Dog bite', 'Monkey bite', 'Cat bite', 'Cattle bite', 'Rodent bite', 'Other'];
  const rowLabels = ['Male (15+Yr)', 'Female (15+Yr)', 'Male Child (<15 Yr)', 'Female Child (<15 Yr)'];

  const matrix = useMemo(() => {
    const mat = Array(4).fill(0).map(() => Array(6).fill(0));
    const filtered = patients.filter(p => p.fiscalYear === selectedFiscalYear && p.regMonth === selectedMonth);
    filtered.forEach(p => {
      let r = -1, c = animals.findIndex(a => p.animalType.includes(a.split(' ')[0]));
      if (c === -1) c = 5;
      const ageNum = parseInt(p.age) || 0;
      if (p.sex === 'Male') r = ageNum < 15 ? 2 : 0;
      else if (p.sex === 'Female') r = ageNum < 15 ? 3 : 1;
      if (r !== -1) mat[r][c]++;
    });
    return mat;
  }, [patients, selectedFiscalYear, selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end bg-white p-4 rounded-xl border no-print shadow-sm">
        <div className="flex gap-4">
          <div className="w-48"><Select label="Fiscal Year" options={FISCAL_YEARS} value={selectedFiscalYear} onChange={e => setSelectedFiscalYear(e.target.value)}/></div>
          <div className="w-48"><Select label="Month" options={[{id:'08', value:'08', label:'Mangsir'}]} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}/></div>
        </div>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Print Report</button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg text-xs">
        <div className="text-center font-bold mb-6">
          <h4 className="uppercase">NG/MOH - EDCD</h4>
          <h2 className="text-lg uppercase">Monthly Records of Post Exposure Treatment of Rabies</h2>
          <div className="flex justify-between mt-4">
            <span>Institution: {currentUser.organizationName}</span>
            <span>Month: {selectedMonth}</span>
            <span>Year: {selectedFiscalYear}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-800 text-center">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-800 p-1">Description</th>
              {animals.map(a => <th key={a} className="border border-slate-800 p-1">{a}</th>)}
              <th className="border border-slate-800 p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((label, r) => (
              <tr key={r}>
                <td className="border border-slate-800 p-1 text-left font-bold">{label}</td>
                {matrix[r].map((v, c) => <td key={c} className="border border-slate-800 p-1">{v || '-'}</td>)}
                <td className="border border-slate-800 p-1 font-bold">{matrix[r].reduce((a,b)=>a+b,0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex justify-end">
          <div className="text-center border-t border-slate-800 w-48 pt-1">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
};