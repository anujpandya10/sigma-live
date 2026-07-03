import { useState } from 'react';
import { initialComponents, initialMonthlyData } from './data/initial';
import InsightView from './components/InsightView';
import ActionView from './components/ActionView';

export default function App() {
  const [components, setComponents] = useState(initialComponents);
  const [monthlyData, setMonthlyData] = useState(initialMonthlyData);
  const [activeTab, setActiveTab] = useState('insight');
  const [updateLog, setUpdateLog] = useState([]);

  function handleUpdate(componentId, updates) {
    const prev = components.find(c => c.id === componentId);
    const stockAdded = updates.stock - prev.stock;
    const demandDelta = updates.forecastDemand - prev.forecastDemand;

    setComponents(prev_list =>
      prev_list.map(c => c.id === componentId ? { ...c, ...updates } : c)
    );

    // When demand changes, update current month's planned total so trend chart closes the loop
    if (demandDelta !== 0) {
      setMonthlyData(data =>
        data.map((row, idx) =>
          idx === data.length - 1
            ? { ...row, planned: Math.max(0, row.planned + demandDelta) }
            : row
        )
      );
    }

    setUpdateLog(log => [
      ...log,
      {
        componentName: prev.name,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        prevDemand: prev.forecastDemand,
        newDemand: updates.forecastDemand,
        prevLead: prev.leadTime,
        newLead: updates.leadTime,
        stockAdded: Math.max(0, stockAdded),
        note: updates.notes !== prev.notes ? updates.notes : '',
        demandChanged: updates.forecastDemand !== prev.forecastDemand,
        leadChanged: updates.leadTime !== prev.leadTime,
      },
    ]);
  }

  const tabs = [
    { id: 'insight', label: 'Sigma Live Insight', icon: '◉' },
    { id: 'action', label: 'Sigma Live Action', icon: '✎' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-0 flex items-center justify-between">
          <div className="flex items-center gap-3 py-3.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Σ</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Sigma Live</span>
              <span className="text-gray-400 text-xs ml-2">/ Track 1 · Supply Chain & Demand Planning</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'insight'
          ? <InsightView components={components} monthlyData={monthlyData} />
          : <ActionView components={components} onUpdate={handleUpdate} updateLog={updateLog} />
        }
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-4 mt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Sigma Live Ecosystem · Track 1: Supply Chain & Demand Planning · Built for Veeco Systems — {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
