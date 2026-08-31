import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // System Settings
  await prisma.systemSetting.upsert({
    where: { key: "TRACKER_START_DATE" },
    update: {},
    create: {
      key: "TRACKER_START_DATE",
      value: "2026-08-20T00:00:00.000Z",
      description: "Tracker start date",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "TRACKER_END_DATE" },
    update: {},
    create: {
      key: "TRACKER_END_DATE",
      value: "2026-12-31T23:59:59.999Z",
      description: "Tracker end date",
    },
  });

  // Passwords
  const adminPasswordHash = bcrypt.hashSync("Sunstone@2026", 10);
  const trainerPasswordHash = bcrypt.hashSync("Trainer@2026", 10);
  const programHeadPasswordHash = bcrypt.hashSync("ProgramHead@2026", 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@sunstone.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@sunstone.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      employeeId: "EMP-ADMIN",
    },
  });

  const trainer = await prisma.user.upsert({
    where: { email: "trainer.demo@sunstone.com" },
    update: {},
    create: {
      name: "Demo Trainer",
      email: "trainer.demo@sunstone.com",
      passwordHash: trainerPasswordHash,
      role: "TRAINER",
      employeeId: "EMP-TR01",
    },
  });

  const programHead = await prisma.user.upsert({
    where: { email: "programhead.demo@sunstone.com" },
    update: {},
    create: {
      name: "Demo Program Head",
      email: "programhead.demo@sunstone.com",
      passwordHash: programHeadPasswordHash,
      role: "PROGRAM_HEAD",
      employeeId: "EMP-PH01",
    },
  });

  // Campuses
  const campusesData = [
    { name: "Noida Campus", code: "NOIDA-01", location: "Noida" },
    { name: "Gurugram Campus", code: "GUR-01", location: "Gurugram" },
    { name: "Pune Campus", code: "PUNE-01", location: "Pune" },
    { name: "Bangalore Campus", code: "BLR-01", location: "Bangalore" },
    { name: "Hyderabad Campus", code: "HYD-01", location: "Hyderabad" },
  ];

  const campuses = [];
  for (const c of campusesData) {
    campuses.push(
      await prisma.campus.upsert({
        where: { code: c.code },
        update: {},
        create: c,
      })
    );
  }

  // Programs
  const programsData = [
    { name: "B.Tech Computer Science", code: "BTECH-CSE", description: "B.Tech in Computer Science" },
    { name: "Bachelor of Computer Applications", code: "BCA", description: "BCA Program" },
    { name: "Master of Computer Applications", code: "MCA", description: "MCA Program" },
  ];

  const programs = [];
  for (const p of programsData) {
    programs.push(
      await prisma.program.upsert({
        where: { code: p.code },
        update: {},
        create: p,
      })
    );
  }

  // Batches
  const noidaCampus = campuses[0];
  const bcaProgram = programs[1];
  const mcaProgram = programs[2];

  const bcaBatch = await prisma.batch.upsert({
    where: { code: "BCA-2026-A" },
    update: {},
    create: {
      name: "BCA 2026 Batch A",
      code: "BCA-2026-A",
      academicYear: "2026-2027",
      startDate: new Date("2026-08-20"),
      endDate: new Date("2026-12-31"),
      campusId: noidaCampus.id,
      programId: bcaProgram.id,
    },
  });

  const mcaBatch = await prisma.batch.upsert({
    where: { code: "MCA-2026-A" },
    update: {},
    create: {
      name: "MCA 2026 Batch A",
      code: "MCA-2026-A",
      academicYear: "2026-2027",
      startDate: new Date("2026-08-20"),
      endDate: new Date("2026-12-31"),
      campusId: noidaCampus.id,
      programId: mcaProgram.id,
    },
  });

  // Mappings
  // Trainer -> Noida -> BCA -> BCA-2026-A
  await prisma.userMapping.upsert({
    where: {
      userId_campusId_programId_batchId: {
        userId: trainer.id,
        campusId: noidaCampus.id,
        programId: bcaProgram.id,
        batchId: bcaBatch.id,
      },
    },
    update: {},
    create: {
      userId: trainer.id,
      campusId: noidaCampus.id,
      programId: bcaProgram.id,
      batchId: bcaBatch.id,
    },
  });

  // Program Head -> Noida -> BCA -> BCA-2026-A
  await prisma.userMapping.upsert({
    where: {
      userId_campusId_programId_batchId: {
        userId: programHead.id,
        campusId: noidaCampus.id,
        programId: bcaProgram.id,
        batchId: bcaBatch.id,
      },
    },
    update: {},
    create: {
      userId: programHead.id,
      campusId: noidaCampus.id,
      programId: bcaProgram.id,
      batchId: bcaBatch.id,
    },
  });

  // Semesters
  const semester1 = await prisma.semester.create({
    data: {
      name: "Semester 1",
      number: 1,
      programId: bcaProgram.id,
    },
  });

  // Modules
  const module1 = await prisma.module.create({
    data: {
      name: "Programming in C",
      number: 1,
      description: "Basics of C programming",
      semesterId: semester1.id,
      programId: bcaProgram.id,
    },
  });

  // Topics
  const topic1 = await prisma.topic.create({
    data: {
      name: "Introduction to C",
      description: "History and structure of C program",
      displayOrder: 1,
      estimatedHours: 2.0,
      moduleId: module1.id,
    },
  });

  const topic2 = await prisma.topic.create({
    data: {
      name: "Variables and Data Types",
      description: "Basic types in C",
      displayOrder: 2,
      estimatedHours: 3.0,
      moduleId: module1.id,
    },
  });

  // Class Record
  await prisma.classRecord.create({
    data: {
      date: new Date("2026-08-20T10:00:00.000Z"),
      classTitle: "First Session C Programming",
      topicsCovered: "Introduction to C",
      classSummary: "Covered the history and basic structure.",
      keyConcepts: "main function, #include",
      practicalActivity: "Hello World program",
      trainerRemarks: "Good batch",
      hoursTaken: 1.5,
      totalStudents: 40,
      studentsPresent: 38,
      attendancePercent: (38 / 40) * 100,
      topicStatus: "IN_PROGRESS",
      verificationStatus: "VERIFIED",
      verificationComment: "Looks good",
      campusId: noidaCampus.id,
      programId: bcaProgram.id,
      batchId: bcaBatch.id,
      semesterId: semester1.id,
      moduleId: module1.id,
      topicId: topic1.id,
      trainerId: trainer.id,
      programHeadId: programHead.id,
    },
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
