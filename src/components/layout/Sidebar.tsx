"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  CheckSquare,
  Settings,
  FileBarChart,
  LogOut,
  Map,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getLinks = () => {
    if (role === "ADMIN") {
      return [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Campuses", href: "/admin/campuses", icon: Building2 },
        { name: "Users & Mappings", href: "/admin/users", icon: Users },
        { name: "Programs & Batches", href: "/admin/programs", icon: GraduationCap },
        { name: "Curriculum", href: "/admin/curriculum", icon: BookOpen },
        { name: "Class Records", href: "/admin/classes", icon: Layers },
        { name: "Verification Center", href: "/admin/verifications", icon: CheckSquare },
        { name: "Calendar", href: "/admin/calendar", icon: Calendar },
        { name: "Analytics & Exports", href: "/admin/analytics", icon: FileBarChart },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ];
    } else if (role === "TRAINER") {
      return [
        { name: "Dashboard", href: "/trainer", icon: LayoutDashboard },
        { name: "Today's Class", href: "/trainer/today", icon: Calendar },
        { name: "My Records", href: "/trainer/records", icon: Layers },
      ];
    } else if (role === "PROGRAM_HEAD") {
      return [
        { name: "Dashboard", href: "/program-head", icon: LayoutDashboard },
        { name: "Verification Center", href: "/program-head/verifications", icon: CheckSquare },
        { name: "My Scope Records", href: "/program-head/records", icon: Layers },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 shrink-0 items-center px-6 bg-slate-950">
        <GraduationCap className="h-8 w-8 text-blue-500 mr-3" />
        <span className="text-xl font-bold text-white tracking-tight">Sunstone Prime</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {links.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase().replace('_', '-')}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  clsx(
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                  )
                )}
              >
                <item.icon
                  className={twMerge(
                    clsx(
                      isActive ? "text-blue-500" : "text-slate-400 group-hover:text-blue-400",
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                    )
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex shrink-0 border-t border-slate-800 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group block w-full shrink-0"
        >
          <div className="flex items-center text-slate-300 hover:text-white transition-colors">
            <LogOut className="inline-block h-5 w-5 mr-3 text-slate-400 group-hover:text-red-400 transition-colors" />
            <div className="text-sm font-medium">Sign Out</div>
          </div>
        </button>
      </div>
    </div>
  );
}
