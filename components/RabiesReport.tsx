import React, { useState, useMemo } from 'react';
import { Printer, Calendar, Save, Calculator, Filter, Package } from 'lucide-react';
import { Select } from './Select';
import { Input } from './Input';
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

  const nepaliMonthOptions = [
    { id: '01', value: '01', label: 'बैशाख (Baishakh)' },
    { id: '02', value: '02', label: 'जेठ (Jestha)' },
    { id: '03', value: '03', label: 'असार (Ashad)' },
    { id: '04', value: '04', label: 'साउन (Shrawan)' },
    { id: '05', value: '05', label: 'भदौ (Bhadra)' },
    { id: '06', value: '06', label: 'असोज (Ashwin)' },
    { id: '07', value: '07', label: 'कार्तिक (Kartik)' },
    { id: '08', value: '08', label: 'मंसिर (Mangsir)' },
    { id: '09', value: '09', label: 'पुष (Poush)' },
    { id: '10', value: '10', label: 'माघ (Magh)' },
    { id: '11', value: '11', label: 'फागुन (Falgun)' },
    { id: '12', value: '12', label: 'चैत्र (Chaitra)' },
  ];

  const animals = ['Dog bite', 'Monkey bite', 'Cat bite', 'Cattle bite', 'Rodent bite', 'Jackal bite', 'Tiger bite', 'Bear bite', 'Saliva contact', 'Other'];
  const rowLabels = ['Male (15+Yr)', 'Female (15+Yr)', 'Male Child (<15 Yr)', 'Female Child (<15 Yr)'];

  const generatedMatrix = useMemo(() => {
    const mat = Array(4).fill(0).map(() => Array(10).fill(0));
    const filteredData = patients.filter(p => p.fiscalYear === selectedFiscalYear && p.regMonth === selectedMonth);
    filteredData.forEach(p => {
        let rowIndex = -1;
        const ageNum = parseInt(p.age) || 0;
        if (p.sex === 'Male') rowIndex = ageNum < 15 ? 2 : 0;
        else if (p.sex === 'Female') rowIndex = ageNum < 15 ? 3 : 1;
        let colIndex = animals.findIndex(a => p.animalType.toLowerCase().includes(a.toLowerCase().split(' ')[0]));
        if (colIndex === -1) colIndex = 9;
        if (rowIndex !== -1 && colIndex !== -1) mat[rowIndex][colIndex]++;
    });
    return mat;
  }, [patients, selectedFiscalYear, selectedMonth]);

  const [stockData, setStockData] = useState({ opening: 50, received: 100, expenditure: 20 });
  const getRowTotal = (r: number) => generatedMatrix[r].reduce((a, b) => a + b, 0);
  const getColTotal = (c: number) => generatedMatrix.reduce((sum, row) => sum + row[c], 0);
  const grandTotalCases = generatedMatrix.flat().reduce((a, b) => a + b, 0);
  const balanceDose = stockData.opening + stockData.received - stockData.expenditure;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-end gap-4 bg-white p-4 rounded-xl border no-print shadow-sm">
         <div className="flex gap-4">
            <div className="w-48"><Select label="Fiscal Year" options={FISCAL_YEARS} value={selectedFiscalYear} onChange={e => setSelectedFiscalYear(e.target.value)}/></div>
            <div className="w-48"><Select label="Month" options={nepaliMonthOptions} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}/></div>
         </div>
         <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Print Report</button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg overflow-x-auto min-w-[1000px] text-xs">
        <div className="text-center space-y-1 mb-6 font-bold uppercase">
            <h4>NG/MOH</h4>
            <h3>EPIDEMIOLOGY AND DISEASE CONTROL DIVISION</h3>
            <h2 className="text-lg">MONTHLY RECORDES OF POST EXPOSURE TREATMENT OF RABIES</h2>
            <div className="flex justify-between mt-4 px-4 text-[10px]">
                <span>Institution: <span className="underline">{currentUser.organizationName}</span></span>
                <span>Month: <span className="underline">{nepaliMonthOptions.find(m => m.value === selectedMonth)?.label}</span></span>
                <span>Year: <span className="underline">{selectedFiscalYear}</span></span>
            </div>
        </div>

        <table className="w-full border-collapse border border-slate-800 text-center">
            <thead>
                <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-800 p-1" rowSpan={2}>Description</th>
                    <th className="border border-slate-800 p-1" colSpan={10}>Source of Exposure</th>
                    <th className="border border-slate-800 p-1" rowSpan={2}>Total</th>
                </tr>
                <tr className="bg-slate-50">
                    {animals.map((a, i) => <th key={i} className="border border-slate-800 p-1">{a}</th>)}
                </tr>
            </thead>
            <tbody>
                {rowLabels.map((label, r) => (
                    <tr key={r}>
                        <td className="border border-slate-800 p-1 font-bold text-left">{label}</td>
                        {generatedMatrix[r].map((v, c) => <td key={c} className="border border-slate-800 p-1">{v || '-'}</td>)}
                        <td className="border border-slate-800 p-1 font-bold">{getRowTotal(r)}</td>
                    </tr>
                ))}
                <tr className="font-bold bg-slate-50">
                    <td className="border border-slate-800 p-1">TOTAL</td>
                    {animals.map((_, c) => <td key={c} className="border border-slate-800 p-1">{getColTotal(c)}</td>)}
                    <td className="border border-slate-800 p-1">{grandTotalCases}</td>
                </tr>
            </tbody>
        </table>

        <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold mb-2">Stock Summary (Vials)</h4>
                <table className="w-full border border-slate-800">
                    <tr><td className="border border-slate-800 p-1">Opening Stock</td><td className="border border-slate-800 p-1 text-center">{stockData.opening}</td></tr>
                    <tr><td className="border border-slate-800 p-1">Received</td><td className="border border-slate-800 p-1 text-center">{stockData.received}</td></tr>
                    <tr><td className="border border-slate-800 p-1">Consumed</td><td className="border border-slate-800 p-1 text-center">{stockData.expenditure}</td></tr>
                    <tr className="font-bold bg-slate-50"><td className="border border-slate-800 p-1">Closing Balance</td><td className="border border-slate-800 p-1 text-center">{balanceDose}</td></tr>
                </table>
            </div>
            <div className="flex items-end justify-end">
                <div className="text-center w-48 border-t border-slate-800 pt-2">Authorized Signature</div>
            </div>
        </div>
      </div>
    </div>
  );
};