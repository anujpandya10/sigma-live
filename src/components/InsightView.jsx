import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getStatus, getDaysOfSupply } from '../data/initial';

const STATUS_CONFIG = {
  CRITICAL: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-600' },
  AT_RISK:  { label: 'At Risk',  bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500' },
  WATCH:    { label: 'Watch',    bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  OK:       { label: 'OK',       bg: 'bg-green-50',   text: 'text-green-700',  badge: 'bg-green-500' },
};

function KPICard({ title, value, sub, color, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InsightView({ components, monthlyData }) {
  const atRisk = components.filter(c => ['CRITICAL', 'AT_RISK'].includes(getStatus(c)));
  const critical = components.filter(c => getStatus(c) === 'CRITICAL');
  const totalExposure = atRisk.reduce((sum, c) => {
    const gap = Math.max(0, c.forecastDemand - c.stock);
    return sum + gap * c.unitCost;
  }, 0);
  const avgLeadTime = Math.round(components.reduce((s, c) => s + c.leadTime, 0) / components.length);
  const bottleneck = [...components].sort((a, b) => b.leadTime - a.leadTime)[0];

  const chartData = components.map(c => ({
    name: c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name,
    'Current Stock': c.stock,
    'Forecast Demand': c.forecastDemand,
    status: getStatus(c),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Supply Chain Command Center</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Live inventory intelligence — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Alert banner — only shows when critical components exist */}
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 flex items-start gap-3">
          <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-700">
              {critical.length} component{critical.length > 1 ? 's' : ''} critically undersupplied — immediate procurement action required.
            </p>
            <p className="text-xs text-red-400 mt-0.5">
              Estimated financial exposure: ${totalExposure.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              {' · '}Longest outstanding lead time: {bottleneck.leadTime}d ({bottleneck.supplier})
              {' · '}Use Sigma Live Action to log supply updates or override forecasts.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Components at Risk"
          value={atRisk.length}
          sub={`${critical.length} critical · ${atRisk.length - critical.length} at risk`}
          color="bg-red-500"
          icon="⚠"
        />
        <KPICard
          title="Financial Exposure"
          value={`$${(totalExposure / 1000).toFixed(1)}K`}
          sub="Unmet demand × unit cost"
          color="bg-orange-500"
          icon="$"
        />
        <KPICard
          title="Avg Supplier Lead Time"
          value={`${avgLeadTime} days`}
          sub={`Across ${components.length} active components`}
          color="bg-blue-600"
          icon="⏱"
        />
        <KPICard
          title="Supplier Bottleneck"
          value={`${bottleneck.leadTime}d`}
          sub={`${bottleneck.supplier} · ${bottleneck.name}`}
          color="bg-purple-600"
          icon="⛓"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory vs Demand — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Inventory vs. Forecast Demand</h3>
          <p className="text-xs text-gray-400 mb-4">Current stock levels measured against monthly demand projections</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Current Stock" fill="#2563EB" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Forecast Demand" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth={1} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Demand Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Monthly Demand Trend</h3>
          <p className="text-xs text-gray-400 mb-4">Planned vs. actual unit demand (last 6 months)</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x="Jul" stroke="#E2E8F0" strokeDasharray="4 4" label={{ value: 'Now', fontSize: 10, fill: '#94A3B8' }} />
              <Line type="monotone" dataKey="planned" stroke="#94A3B8" strokeWidth={2} dot={{ r: 3 }} name="Planned" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} name="Actual" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Component Status Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Component Risk Register</h3>
          <p className="text-xs text-gray-400 mt-0.5">Full inventory status across all tracked components</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Component</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Supplier</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Stock</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Forecast</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Days Supply</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Lead Time</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                {components.some(c => c.notes) && (
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Notes</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...components]
                .sort((a, b) => {
                  const order = { CRITICAL: 0, AT_RISK: 1, WATCH: 2, OK: 3 };
                  return order[getStatus(a)] - order[getStatus(b)];
                })
                .map((c) => {
                  const status = getStatus(c);
                  const cfg = STATUS_CONFIG[status];
                  const dos = getDaysOfSupply(c);
                  const gap = c.forecastDemand - c.stock;
                  return (
                    <tr key={c.id} className={`${cfg.bg} hover:brightness-95 transition-all`}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.id}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{c.supplier}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-medium text-gray-800">
                        {c.stock.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-600">
                        {c.forecastDemand.toLocaleString()}
                        {gap > 0 && (
                          <span className="ml-1 text-xs text-red-500">−{gap.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`px-4 py-3.5 text-right font-mono font-semibold ${dos < 15 ? 'text-red-600' : dos < 25 ? 'text-orange-600' : 'text-gray-700'}`}>
                        {dos}d
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-600">{c.leadTime}d</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </td>
                      {components.some(comp => comp.notes) && (
                        <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate">{c.notes || '—'}</td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
