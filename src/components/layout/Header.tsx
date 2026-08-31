"use client";

import { useSession } from "next-auth/react";
import { User, Bell, Menu } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
      <button
        type="button"
        className="border-r border-slate-200 px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-slate-800">
            Welcome, {session?.user?.name || "User"}
          </h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-slate-700">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-slate-500">
                  {session?.user?.role?.replace("_", " ")}
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 border border-blue-200">
                <User className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
