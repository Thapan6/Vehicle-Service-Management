import React from 'react';
import Table, { TableRow, TableCell } from './common/Table';

const ServiceHistoryCard = ({ records }) => {
  if (!records || records.length === 0) {
    return <p className="text-sm text-slate-500 italic py-6">No completed history found in the system logs.</p>;
  }

  return (
    <Table headers={['Vehicle', 'Service Type', 'Parts Summary', 'Labor', 'Net Cost', 'Completed On']}>
      {records.map(r => (
        <TableRow key={r._id}>
          <TableCell className="font-bold text-slate-700 dark:text-slate-200">
            {r.vehicle?.make} {r.vehicle?.model}
          </TableCell>
          <TableCell>{r.serviceType}</TableCell>
          <TableCell>
            <div className="flex flex-col gap-1">
              {r.partsUsed?.length > 0 ? r.partsUsed.map((p, idx) => (
                <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase font-bold whitespace-nowrap">
                  {p.name} (x{p.quantity})
                </span>
              )) : <span className="text-xs text-slate-400 font-medium">No parts logs</span>}
            </div>
          </TableCell>
          <TableCell className="font-mono text-xs">{r.laborHours}h</TableCell>
          <TableCell className="font-black text-slate-800 dark:text-slate-100">
            ${(() => {
              if (r.totalCost && r.totalCost > 0) {
                return r.totalCost.toFixed(2);
              }
              const partsTotal = r.partsUsed && r.partsUsed.length > 0
                ? r.partsUsed.reduce((acc, part) => acc + (part.price * part.quantity), 0)
                : 0;
              const FIXED_RATE = 100; // $100/hr
              const laborCost = (r.laborHours || 0) * FIXED_RATE;
              const amount = partsTotal + laborCost;
              const tax = amount * 0.10; // 10% tax rate
              return (amount + tax).toFixed(2);
            })()}
          </TableCell>
          <TableCell className="text-slate-500 text-xs">
            {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : 'N/A'}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default ServiceHistoryCard;
