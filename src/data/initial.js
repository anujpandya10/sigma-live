export const initialComponents = [
  {
    id: 'C001',
    name: 'GaN Epitaxial Wafer',
    supplier: 'IQE Corp',
    region: 'Europe',
    stock: 320,
    forecastDemand: 480,
    leadTime: 42,
    unitCost: 285,
    notes: '',
  },
  {
    id: 'C002',
    name: 'InP Substrate 3in',
    supplier: 'Wafer Technology Ltd',
    region: 'UK',
    stock: 580,
    forecastDemand: 420,
    leadTime: 28,
    unitCost: 145,
    notes: '',
  },
  {
    id: 'C003',
    name: 'RF Power Module',
    supplier: 'Qorvo Inc',
    region: 'US',
    stock: 95,
    forecastDemand: 210,
    leadTime: 56,
    unitCost: 890,
    notes: '',
  },
  {
    id: 'C004',
    name: 'Precision Capacitor 100pF',
    supplier: 'Murata Mfg',
    region: 'Japan',
    stock: 2400,
    forecastDemand: 1800,
    leadTime: 14,
    unitCost: 2.5,
    notes: '',
  },
  {
    id: 'C005',
    name: 'Beam Splitter Optic',
    supplier: 'Edmund Optics',
    region: 'US',
    stock: 45,
    forecastDemand: 120,
    leadTime: 70,
    unitCost: 1200,
    notes: '',
  },
  {
    id: 'C006',
    name: 'SiC Carrier Wafer',
    supplier: 'Wolfspeed',
    region: 'US',
    stock: 680,
    forecastDemand: 500,
    leadTime: 35,
    unitCost: 320,
    notes: '',
  },
  {
    id: 'C007',
    name: 'High-Purity Alumina Target',
    supplier: 'Tosoh Corp',
    region: 'Japan',
    stock: 12,
    forecastDemand: 85,
    leadTime: 90,
    unitCost: 3400,
    notes: '',
  },
  {
    id: 'C008',
    name: 'Thermal Management Module',
    supplier: 'Laird Technologies',
    region: 'US',
    stock: 160,
    forecastDemand: 140,
    leadTime: 21,
    unitCost: 175,
    notes: '',
  },
];

export const initialMonthlyData = [
  { month: 'Feb', planned: 380, actual: 365 },
  { month: 'Mar', planned: 420, actual: 441 },
  { month: 'Apr', planned: 460, actual: 448 },
  { month: 'May', planned: 490, actual: 512 },
  { month: 'Jun', planned: 530, actual: 518 },
  { month: 'Jul', planned: 565, actual: null },
];

export function getStatus(component) {
  const ratio = component.stock / component.forecastDemand;
  if (ratio < 0.4) return 'CRITICAL';
  if (ratio < 0.75) return 'AT_RISK';
  if (ratio < 1.0) return 'WATCH';
  return 'OK';
}

export function getDaysOfSupply(component) {
  if (component.forecastDemand === 0) return 999;
  return Math.round((component.stock / component.forecastDemand) * 30);
}
