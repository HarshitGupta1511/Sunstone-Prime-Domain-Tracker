export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { DashboardCharts } from "./DashboardCharts";

export default async function AdminDashboard() {
  // Fetch stats concurrently
  const [
    totalCampuses,
    totalPrograms,
    totalBatches,
    totalTrainers,
    totalProgramHeads,
    totalModules,
    totalTopics,
    classRecords,
  ] = await Promise.all([
    prisma.campus.count(),
    prisma.program.count(),
    prisma.batch.count(),
    prisma.user.count({ where: { role: "TRAINER" } }),
    prisma.user.count({ where: { role: "PROGRAM_HEAD" } }),
    prisma.module.count(),
    prisma.topic.count(),
    prisma.classRecord.findMany({
      include: { campus: true, program: true, batch: true },
    }),
  ]);

  // Derived stats
  const totalClassesConducted = classRecords.length;
  const totalHoursDelivered = classRecords.reduce((acc, curr) => acc + curr.hoursTaken, 0);
  const avgAttendance = classRecords.length 
    ? classRecords.reduce((acc, curr) => acc + curr.attendancePercent, 0) / classRecords.length 
    : 0;

  const pendingVerification = classRecords.filter(r => r.verificationStatus === "PENDING").length;

  const kpis = [
    { title: "Campuses", value: totalCampuses, icon: Building2, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Programs", value: totalPrograms, icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-100" },
    { title: "Batches", value: totalBatches, icon: Layers, color: "text-purple-500", bg: "bg-purple-100" },
    { title: "Trainers", value: totalTrainers, icon: Users, color: "text-emerald-500", bg: "bg-emerald-100" },
    { title: "Program Heads", value: totalProgramHeads, icon: Users, color: "text-teal-500", bg: "bg-teal-100" },
    { title: "Modules & Topics", value: `${totalModules} / ${totalTopics}`, icon: BookOpen, color: "text-orange-500", bg: "bg-orange-100" },
  ];

  const deliveryKpis = [
    { title: "Classes Conducted", value: totalClassesConducted, icon: CheckCircle, color: "text-emerald-600" },
    { title: "Total Hours", value: totalHoursDelivered.toFixed(1), icon: Clock, color: "text-blue-600" },
    { title: "Avg Attendance", value: `${avgAttendance.toFixed(1)}%`, icon: Users, color: "text-indigo-600" },
    { title: "Pending Verification", value: pendingVerification, icon: AlertCircle, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">{kpi.title}</dt>
                    <dd className="text-2xl font-semibold text-slate-900">{kpi.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery KPIs */}
      <h2 className="text-lg font-medium text-slate-900 mt-8">Delivery Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {deliveryKpis.map((kpi) => (
          <div key={kpi.title} className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5">
             <div className="flex items-center">
                <kpi.icon className={`h-5 w-5 ${kpi.color} mr-3`} />
                <h3 className="text-sm font-medium text-slate-500">{kpi.title}</h3>
             </div>
             <p className="mt-2 text-3xl font-semibold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="mt-8">
        <DashboardCharts records={classRecords} />
      </div>
    </div>
  );
}
