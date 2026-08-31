import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VerificationTable } from "./VerificationTable";

export default async function VerificationCenterPage() {
  const session = await getServerSession(authOptions);
  
  const mappings = await prisma.userMapping.findMany({
    where: { userId: session?.user?.id },
    select: { campusId: true, programId: true, batchId: true }
  });

  const scopeCondition = mappings.length > 0 ? {
    OR: mappings.map(m => ({
      campusId: m.campusId,
      programId: m.programId,
      batchId: m.batchId,
    }))
  } : { id: "none" };

  const pendingRecords = await prisma.classRecord.findMany({
    where: {
      ...scopeCondition,
      verificationStatus: "PENDING"
    },
    orderBy: { date: "asc" },
    include: {
      campus: true,
      program: true,
      batch: true,
      topic: true,
      trainer: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Verification Center
          </h2>
          <p className="mt-1 flex text-sm text-slate-500">
            Review and verify class records submitted by trainers in your scope.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl p-6">
        <VerificationTable records={pendingRecords} />
      </div>
    </div>
  );
}
