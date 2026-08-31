"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function DashboardCharts({ records }: { records: any[] }) {
  // Process data for charts
  
  // 1. Verification Status Distribution (Pie Chart)
  const verificationCounts = records.reduce((acc, curr) => {
    acc[curr.verificationStatus] = (acc[curr.verificationStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const verificationData = Object.entries(verificationCounts).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Verified, Pending, Rejected (approx mapping)
  const getStatusColor = (status: string) => {
    switch(status) {
      case "VERIFIED": return "#10b981";
      case "PENDING": return "#f59e0b";
      case "REJECTED": return "#ef4444";
      default: return "#94a3b8";
    }
  };

  // 2. Classes by Campus (Bar Chart)
  const campusCounts = records.reduce((acc, curr) => {
    const campusName = curr.campus?.name || "Unknown";
    acc[campusName] = (acc[campusName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const campusData = Object.entries(campusCounts).map(([name, classes]) => ({
    name, classes
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Verification Status Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Verification Status</h3>
        {verificationData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-500">No data available</div>
        )}
      </div>

      {/* Classes by Campus Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Classes by Campus</h3>
        {campusData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campusData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="classes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-500">No data available</div>
        )}
      </div>
    </div>
  );
}
