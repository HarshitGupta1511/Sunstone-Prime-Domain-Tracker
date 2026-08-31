"use client";

import { useState } from "react";
import { verifyRecord } from "./actions";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export function VerificationTable({ records }: { records: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleVerify = async (id: string) => {
    setProcessingId(id);
    try {
      await verifyRecord(id, "VERIFIED");
      toast.success("Record verified successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to verify record");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectComment) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setProcessingId(id);
    try {
      await verifyRecord(id, "REJECTED", rejectComment);
      toast.success("Record rejected and sent back to trainer");
      setRejectingId(null);
      setRejectComment("");
    } catch (e: any) {
      toast.error(e.message || "Failed to reject record");
    } finally {
      setProcessingId(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No pending records</h3>
        <p className="mt-1 text-sm text-slate-500">All caught up! There are no records awaiting verification.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trainer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metrics</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {records.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                {record.trainer.name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                <div className="font-medium text-slate-900">{record.classTitle}</div>
                <div>{record.batch.name} • {record.topic.name}</div>
                <div className="text-xs mt-1 italic">{record.classSummary}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <div>{record.hoursTaken} Hours</div>
                <div>{record.attendancePercent.toFixed(1)}% Attd</div>
                <span className="px-2 mt-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {record.topicStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {rejectingId === record.id ? (
                  <div className="flex flex-col items-end space-y-2">
                    <input
                      type="text"
                      placeholder="Reason for rejection..."
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      className="block w-full max-w-xs rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                    />
                    <div className="flex space-x-2">
                      <button onClick={() => setRejectingId(null)} className="text-slate-500 hover:text-slate-700">Cancel</button>
                      <button onClick={() => handleReject(record.id)} disabled={processingId === record.id} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">
                        {processingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleVerify(record.id)}
                      disabled={processingId === record.id}
                      className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-3 py-1 rounded-md flex items-center"
                    >
                      {processingId === record.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                      Verify
                    </button>
                    <button
                      onClick={() => setRejectingId(record.id)}
                      disabled={processingId === record.id}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
