import { useState } from 'react';
import { getStatus, getDaysOfSupply } from '../data/initial';

const STATUS_COLORS = {
  CRITICAL: 'text-red-600 bg-red-50 border-red-200',
  AT_RISK:  'text-orange-600 bg-orange-50 border-orange-200',
  WATCH:    'text-yellow-700 bg-yellow-50 border-yellow-200',
  OK:       'text-green-700 bg-green-50 border-green-200',
};

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {children} {required && <span className="text-red-400 normal-case font-normal">*required</span>}
    </label>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h4>
      {children}
    </div>
  );
}

export default function ActionView({ components, onUpdate, updateLog }) {
  const [selectedId, setSelectedId] = useState('');
  const [newDemand, setNewDemand] = useState('');
  const [newLeadTime, setNewLeadTime] = useState('');
  const [supplyNote, setSupplyNote] = useState('');
  const [supplyQty, setSupplyQty] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const selected = components.find(c => c.id === selectedId);

  function handleSelect(id) {
    setSelectedId(id);
    const c = components.find(x => x.id === id);
    if (c) {
      setNewDemand(String(c.forecastDemand));
      setNewLeadTime(String(c.leadTime));
    }
    setErrors({});
    setSubmitted(false);
    setSupplyNote('');
    setSupplyQty('');
  }

  function validate() {
    const errs = {};
    if (!selectedId) errs.selected = 'Select a component to update.';

    const d = Number(newDemand);
    if (!newDemand || isNaN(d) || d < 0)
      errs.demand = 'Enter a valid non-negative demand number.';
    if (d > 100000)
      errs.demand = 'Value seems unrealistic. Max is 100,000.';

    const l = Number(newLeadTime);
    if (!newLeadTime || isNaN(l) || l < 1 || l > 365)
      errs.leadTime = 'Lead time must be between 1 and 365 days.';

    if (supplyQty && (isNaN(Number(supplyQty)) || Number(supplyQty) < 0))
      errs.supplyQty = 'Enter a valid positive quantity.';

    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const addedStock = supplyQty ? Number(supplyQty) : 0;
    onUpdate(selectedId, {
      forecastDemand: Number(newDemand),
      leadTime: Number(newLeadTime),
      stock: selected.stock + addedStock,
      notes: supplyNote.trim() || selected.notes,
    });

    setSubmitted(true);
    setErrors({});
    setSupplyQty('');
    setSupplyNote('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left panel — Form */}
      <div className="lg:col-span-3 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Planner Update Panel</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Modify forecasts, override transit times, and log incoming supply events.
            All changes reflect instantly on the Insight dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Step 1 — Component Selector */}
          <FormSection title="Step 1 — Select Component">
            <div>
              <FieldLabel required>Component</FieldLabel>
              <select
                value={selectedId}
                onChange={e => handleSelect(e.target.value)}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.selected ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">— Choose a component —</option>
                {components.map(c => {
                  const st = getStatus(c);
                  const badge = { CRITICAL: '🔴', AT_RISK: '🟠', WATCH: '🟡', OK: '🟢' }[st];
                  return (
                    <option key={c.id} value={c.id}>
                      {badge} {c.name} ({c.id})
                    </option>
                  );
                })}
              </select>
              {errors.selected && <p className="text-xs text-red-500 mt-1">{errors.selected}</p>}
            </div>

            {/* Current state pill */}
            {selected && (
              <div className={`flex flex-wrap gap-4 text-xs font-mono p-3 rounded-lg border ${STATUS_COLORS[getStatus(selected)]}`}>
                <span>Stock: <strong>{selected.stock.toLocaleString()}</strong></span>
                <span>Demand: <strong>{selected.forecastDemand.toLocaleString()}</strong></span>
                <span>Lead Time: <strong>{selected.leadTime}d</strong></span>
                <span>Days of Supply: <strong>{getDaysOfSupply(selected)}d</strong></span>
                <span>Status: <strong>{getStatus(selected)}</strong></span>
              </div>
            )}
          </FormSection>

          {/* Step 2 — Forecast */}
          <FormSection title="Step 2 — Update Demand Forecast">
            <div>
              <FieldLabel required>Monthly Demand Forecast (units)</FieldLabel>
              <input
                type="number"
                min="0"
                max="100000"
                value={newDemand}
                onChange={e => { setNewDemand(e.target.value); setErrors(p => ({ ...p, demand: '' })); }}
                disabled={!selectedId}
                placeholder="e.g. 480"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.demand ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.demand && <p className="text-xs text-red-500 mt-1">{errors.demand}</p>}
              {selected && newDemand && !errors.demand && (
                <p className="text-xs text-gray-400 mt-1">
                  {Number(newDemand) > selected.forecastDemand
                    ? `▲ Increasing demand by ${Number(newDemand) - selected.forecastDemand} units`
                    : Number(newDemand) < selected.forecastDemand
                    ? `▼ Reducing demand by ${selected.forecastDemand - Number(newDemand)} units`
                    : '• No change to demand'}
                </p>
              )}
            </div>
          </FormSection>

          {/* Step 3 — Lead Time */}
          <FormSection title="Step 3 — Override Supplier Lead Time">
            <div>
              <FieldLabel required>Transit Lead Time (days)</FieldLabel>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="7"
                  max="120"
                  value={newLeadTime || 30}
                  onChange={e => { setNewLeadTime(e.target.value); setErrors(p => ({ ...p, leadTime: '' })); }}
                  disabled={!selectedId}
                  className="flex-1 accent-blue-600 disabled:opacity-50"
                />
                <span className="text-sm font-bold text-blue-700 w-16 text-right">{newLeadTime || '—'} days</span>
              </div>
              {errors.leadTime && <p className="text-xs text-red-500 mt-1">{errors.leadTime}</p>}
            </div>
          </FormSection>

          {/* Step 4 — Supply event (optional) */}
          <FormSection title="Step 4 — Log Supply Update (optional)">
            <div>
              <FieldLabel>Incoming Stock Quantity</FieldLabel>
              <input
                type="number"
                min="0"
                value={supplyQty}
                onChange={e => { setSupplyQty(e.target.value); setErrors(p => ({ ...p, supplyQty: '' })); }}
                disabled={!selectedId}
                placeholder="Units arriving — leave blank if no shipment"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.supplyQty ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.supplyQty && <p className="text-xs text-red-500 mt-1">{errors.supplyQty}</p>}
            </div>
            <div>
              <FieldLabel>Planner Note</FieldLabel>
              <textarea
                value={supplyNote}
                onChange={e => setSupplyNote(e.target.value)}
                disabled={!selectedId}
                rows={3}
                maxLength={280}
                placeholder="e.g. Supplier confirmed 200-unit partial shipment arriving Aug 5. Remaining 120 units delayed to Sept."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{supplyNote.length}/280</p>
            </div>
          </FormSection>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedId}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Apply Update → Refresh Dashboard
          </button>

          {submitted && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-lg">✓</span>
              <span><strong>Update applied.</strong> Switch to Sigma Live Insight to see live changes.</span>
            </div>
          )}
        </form>
      </div>

      {/* Right panel — Update Log */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Update Log</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{updateLog.length} events</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {updateLog.length === 0 && (
              <p className="px-5 py-8 text-xs text-center text-gray-400">No updates submitted yet.<br />Use the form to log changes.</p>
            )}
            {[...updateLog].reverse().map((log, i) => (
              <div key={i} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800">{log.componentName}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{log.time}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500">
                  {log.demandChanged && (
                    <span>Demand: <span className="font-mono text-gray-700">{log.prevDemand} → {log.newDemand}</span></span>
                  )}
                  {log.leadChanged && (
                    <span>Lead: <span className="font-mono text-gray-700">{log.prevLead}d → {log.newLead}d</span></span>
                  )}
                  {log.stockAdded > 0 && (
                    <span>+<span className="font-mono text-gray-700">{log.stockAdded}</span> units received</span>
                  )}
                </div>
                {log.note && <p className="text-xs text-gray-400 mt-1 italic">"{log.note}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
