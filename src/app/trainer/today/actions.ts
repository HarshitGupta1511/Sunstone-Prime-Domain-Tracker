"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getTrainerMappings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TRAINER") {
    throw new Error("Unauthorized");
  }

  const mappings = await prisma.userMapping.findMany({
    where: { userId: session.user.id },
    include: {
      campus: true,
      program: true,
      batch: true,
    }
  });

  return mappings;
}

export async function getSemesters(programId: string) {
  return await prisma.semester.findMany({
    where: { programId, status: "ACTIVE" },
    orderBy: { number: "asc" }
  });
}

export async function getModules(semesterId: string) {
  return await prisma.module.findMany({
    where: { semesterId, status: "ACTIVE" },
    orderBy: { displayOrder: "asc" }
  });
}

export async function getTopics(moduleId: string) {
  return await prisma.topic.findMany({
    where: { moduleId, status: "ACTIVE" },
    orderBy: { displayOrder: "asc" }
  });
}

export async function submitClassRecord(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TRAINER") {
    throw new Error("Unauthorized");
  }

  // Validate mapping (Security constraint)
  const isMapped = await prisma.userMapping.findFirst({
    where: {
      userId: session.user.id,
      campusId: data.campusId,
      programId: data.programId,
      batchId: data.batchId,
    }
  });

  if (!isMapped) {
    throw new Error("Unauthorized to submit for this scope");
  }

  // Also validate weekend if needed. We can do that client side or server side.
  const date = new Date(data.date);
  if (date.getDay() === 0 || date.getDay() === 6) {
    throw new Error("Cannot submit class records on weekends");
  }

  const attendancePercent = (data.studentsPresent / data.totalStudents) * 100;

  const record = await prisma.classRecord.create({
    data: {
      date: date,
      classTitle: data.classTitle,
      topicsCovered: data.topicsCovered,
      classSummary: data.classSummary,
      keyConcepts: data.keyConcepts,
      practicalActivity: data.practicalActivity,
      trainerRemarks: data.trainerRemarks,
      hoursTaken: parseFloat(data.hoursTaken),
      totalStudents: parseInt(data.totalStudents),
      studentsPresent: parseInt(data.studentsPresent),
      attendancePercent,
      topicStatus: data.topicStatus,
      verificationStatus: "PENDING",
      campusId: data.campusId,
      programId: data.programId,
      batchId: data.batchId,
      semesterId: data.semesterId,
      moduleId: data.moduleId,
      topicId: data.topicId,
      trainerId: session.user.id,
    }
  });

  // Also create an audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_CLASS_RECORD",
      entity: "ClassRecord",
      entityId: record.id,
      description: `Submitted class record for topic ${data.topicId}`,
    }
  });

  return { success: true, recordId: record.id };
}
