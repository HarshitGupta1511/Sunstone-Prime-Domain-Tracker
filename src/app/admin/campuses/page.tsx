export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { addCampus } from "../actions";
import { Building2 } from "lucide-react";

export default async function CampusesPage() {
  const campuses = await prisma.campus.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Building2 className="mr-2 h-6 w-6 text-blue-500" />
          Campuses
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to Add Campus */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Add New Campus</h2>
          <form action={addCampus} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Campus Name</label>
              <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700">Campus Code</label>
              <input type="text" name="code" id="code" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
              <input type="text" name="location" id="location" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
              <select name="status" id="status" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add Campus
            </button>
          </form>
        </div>

        {/* List of Campuses */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {campuses.map((campus) => (
                  <tr key={campus.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{campus.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{campus.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{campus.location || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {campus.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {campuses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">No campuses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
