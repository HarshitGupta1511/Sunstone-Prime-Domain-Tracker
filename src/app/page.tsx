import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  if (role === "ADMIN") {
    redirect("/admin");
  } else if (role === "TRAINER") {
    redirect("/trainer");
  } else if (role === "PROGRAM_HEAD") {
    redirect("/program-head");
  }

  // Fallback
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Invalid Role</h1>
        <p className="text-slate-600">Please contact administrator.</p>
      </div>
    </div>
  );
}
