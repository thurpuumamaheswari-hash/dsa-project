import type { Activity, KnapsackItem } from "./algorithms";

export const dashboardStats = {
  totalReservoirs: 12,
  totalPipelines: 847,
  dailyConsumption: 284.5,
  activeAlerts: 7,
  distributionEfficiency: 94.2,
  waterQualityScore: 98.1,
};

export const waterConsumptionData = [
  { month: "Jan", residential: 85, commercial: 42, industrial: 118 },
  { month: "Feb", residential: 78, commercial: 38, industrial: 108 },
  { month: "Mar", residential: 92, commercial: 45, industrial: 122 },
  { month: "Apr", residential: 98, commercial: 52, industrial: 130 },
  { month: "May", residential: 115, commercial: 61, industrial: 138 },
  { month: "Jun", residential: 128, commercial: 68, industrial: 145 },
  { month: "Jul", residential: 142, commercial: 74, industrial: 152 },
  { month: "Aug", residential: 138, commercial: 71, industrial: 148 },
  { month: "Sep", residential: 121, commercial: 64, industrial: 140 },
  { month: "Oct", residential: 105, commercial: 55, industrial: 128 },
  { month: "Nov", residential: 88, commercial: 46, industrial: 115 },
  { month: "Dec", residential: 82, commercial: 41, industrial: 110 },
];

export const regionDistributionData = [
  { name: "North Zone", value: 28.5 },
  { name: "South Zone", value: 22.3 },
  { name: "East Zone", value: 19.8 },
  { name: "West Zone", value: 18.2 },
  { name: "Central", value: 11.2 },
];

export const pipelineStatusData = [
  { status: "Excellent", count: 312 },
  { status: "Good", count: 285 },
  { status: "Fair", count: 168 },
  { status: "Needs Repair", count: 62 },
  { status: "Critical", count: 20 },
];

export const recentActivities = [
  { id: 1, type: "maintenance", message: "Pipeline P-247 scheduled for inspection", time: "2 min ago", severity: "info" },
  { id: 2, type: "alert", message: "Pressure drop detected in North Zone sector 4", time: "8 min ago", severity: "warning" },
  { id: 3, type: "success", message: "New reservoir connection established at East Hub", time: "15 min ago", severity: "success" },
  { id: 4, type: "alert", message: "Consumption spike in Industrial District B", time: "23 min ago", severity: "warning" },
  { id: 5, type: "info", message: "Monthly water quality report generated", time: "1 hr ago", severity: "info" },
  { id: 6, type: "success", message: "Leak repaired in Southern Pipeline Grid", time: "2 hr ago", severity: "success" },
];

export const pipelineRows = [
  { id: 101, name: "Main Trunk Line A", diameter: 800, material: "DI", pressure: 6.5, status: "Active", installed: 2018, from: "Central Reservoir", to: "North Hub" },
  { id: 205, name: "Industrial Feed B", diameter: 600, material: "MS", pressure: 5.2, status: "Active", installed: 2015, from: "East Pumping", to: "Industrial Zone" },
  { id: 312, name: "Residential Grid C", diameter: 400, material: "PVC", pressure: 4.1, status: "Maintenance", installed: 2012, from: "North Station", to: "Residential A" },
  { id: 418, name: "South Distribution D", diameter: 350, material: "DI", pressure: 3.8, status: "Active", installed: 2020, from: "Central Hub", to: "South Zone" },
  { id: 523, name: "Treatment Line E", diameter: 500, material: "MS", pressure: 5.8, status: "Active", installed: 2019, from: "Treatment Plant", to: "Central Reservoir" },
  { id: 631, name: "West Feeder F", diameter: 300, material: "PVC", pressure: 3.2, status: "Inactive", installed: 2010, from: "West District", to: "Residential B" },
];

export const waterUsageRows = [
  { id: 1, region: "North Zone", consumption: 285.4, target: 280, efficiency: 98.1, population: 142000 },
  { id: 2, region: "South Zone", consumption: 223.1, target: 220, efficiency: 98.6, population: 118000 },
  { id: 3, region: "East Zone", consumption: 197.8, target: 210, efficiency: 94.2, population: 105000 },
  { id: 4, region: "West Zone", consumption: 182.3, target: 185, efficiency: 98.5, population: 98000 },
  { id: 5, region: "Industrial", consumption: 445.2, target: 430, efficiency: 96.6, population: 0 },
  { id: 6, region: "Commercial", consumption: 168.9, target: 170, efficiency: 99.4, population: 0 },
];

export const maintenanceActivities: Activity[] = [
  { id: "A1", name: "Pump Inspection – North", start: 6, end: 9, priority: "High", resource: "Team Alpha" },
  { id: "A2", name: "Valve Replacement – East", start: 8, end: 12, priority: "Critical", resource: "Team Beta" },
  { id: "A3", name: "Pipeline Survey – West", start: 10, end: 14, priority: "Medium", resource: "Team Gamma" },
  { id: "A4", name: "Filter Clean – Central", start: 13, end: 16, priority: "Low", resource: "Team Alpha" },
  { id: "A5", name: "Meter Calibration", start: 9, end: 11, priority: "High", resource: "Team Delta" },
  { id: "A6", name: "Emergency Repair – South", start: 7, end: 10, priority: "Critical", resource: "Team Beta" },
  { id: "A7", name: "SCADA System Check", start: 15, end: 18, priority: "Medium", resource: "Team Epsilon" },
  { id: "A8", name: "Chemical Dosing Check", start: 11, end: 13, priority: "High", resource: "Team Gamma" },
];

export const upgradeItems: KnapsackItem[] = [
  { id: "U1", name: "Smart Meter Network", cost: 45, benefit: 35, weight: 45 },
  { id: "U2", name: "SCADA Upgrade", cost: 80, benefit: 60, weight: 80 },
  { id: "U3", name: "Pipe Lining Program", cost: 120, benefit: 55, weight: 120 },
  { id: "U4", name: "Pump Efficiency", cost: 65, benefit: 45, weight: 65 },
  { id: "U5", name: "Leak Detection AI", cost: 35, benefit: 42, weight: 35 },
  { id: "U6", name: "Solar Pumping Units", cost: 95, benefit: 38, weight: 95 },
  { id: "U7", name: "Treatment Upgrade", cost: 150, benefit: 70, weight: 150 },
  { id: "U8", name: "Pressure Sensors", cost: 28, benefit: 30, weight: 28 },
];

export const demandSequence = [145, 162, 158, 171, 169, 185, 178, 193, 188, 202, 198, 215, 210, 228, 225];

export const demandTrendData = demandSequence.map((v, i) => ({
  month: `M${i + 1}`, demand: v,
}));
