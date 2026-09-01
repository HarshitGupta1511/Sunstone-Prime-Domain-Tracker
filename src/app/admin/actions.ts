"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function addCampus(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string || "ACTIVE";

  if (!name || !code) return { error: "Name and Code are required" };

  try {
    await prisma.campus.create({
      data: {
        name,
        code,
        location,
        status,
      },
    });
    revalidatePath("/admin/campuses");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating campus:", error);
    return { error: error.message || "Failed to create campus" };
  }
}

export async function addUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const employeeId = formData.get("employeeId") as string;
  const phone = formData.get("phone") as string;
  const status = formData.get("status") as string || "ACTIVE";

  if (!name || !email || !role) return { error: "Name, Email, and Role are required" };

  try {
    // Generate a default password for new users
    const defaultPassword = "Password@123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        role,
        employeeId: employeeId || null,
        phone: phone || null,
        status,
        passwordHash,
      },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { error: error.message || "Failed to create user" };
  }
}

export async function addProgram(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string || "ACTIVE";

  if (!name || !code) return { error: "Name and Code are required" };

  try {
    await prisma.program.create({
      data: {
        name,
        code,
        description,
        status,
      },
    });
    revalidatePath("/admin/programs");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating program:", error);
    return { error: error.message || "Failed to create program" };
  }
}
