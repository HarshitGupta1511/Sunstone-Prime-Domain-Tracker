import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckCircle, AlertCircle, Clock, Calendar } from "lucide-react";

export default async function ProgramHeadDashboard() {
  const session = await getServerSession(authOptions);
  
  // Find all mappings for this program head
  const mappings = await prisma.userMapping.findMany({
    where: { userId: session?.user?.id },
    select: { campusId: true, programId: true, batchId: true }
  });

  // Build OR condition for scope
  const scopeCondition = mappings.length > 0 ? {
    OR: mappings.map(m => ({
      campusId: m.campusId,
      programId: m.programId,
      batchId: m.batchId,
    }))
  } : { id: "none" }; // Match nothing if no mappings

  const classRecords = await prisma.classRecord.findMany({
    where: scopeCondition,
    orderBy: { date: "desc" },
    take: 5,
    include: {
      campus: true,
      program: true,
      batch: true,
      topic: true,
      trainer: true,
    }
  });

  const totalClassesInScope = await prisma.classRecord.count({
    where: scopeCondition
  });

  const allScopeRecords = await prisma.classRecord.findMany({
    where: scopeCondition,
  });

  const totalHoursDelivered = allScopeRecords.reduce((acc, curr) => acc + curr.hoursTaken, 0);
  const pendingVerification = allScopeRecords.filter(r => r.verificationStatus === "PENDING").length;
  const verifiedClasses = allScopeRecords.filter(r => r.verificationStatus === "VERIFIED").length;

  const kpis = [
    { title: "Classes in Scope", value: totalClassesInScope, icon: Calendar, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Hours in Scope", value: totalHoursDelivered.toFixed(1), icon: Clock, color: "text-indigo-500", bg: "bg-indigo-100" },
    { title: "Pending Verification", value: pendingVerification, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-100" },
    { title: "Verified Classes", value: verifiedClasses, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Program Head Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5">
             <div className="flex items-center">
                <div className={`p-3 rounded-md ${kpi.bg} mr-4`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">{kpi.title}</h3>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{kpi.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-slate-900">Recent Class Records (Scope)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {classRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {record.trainer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {record.batch.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">
                    {record.topic.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${record.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 
                        record.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {record.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {classRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No class records found in your scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
