"use client";

import { useState, useEffect } from "react";
import { getSemesters, getModules, getTopics, submitClassRecord } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ClassEntryForm({ initialMappings }: { initialMappings: any[] }) {
  const router = useRouter();
  
  // Extract unique mapped entities
  const mappedCampuses = Array.from(new Set(initialMappings.map(m => m.campus.id)))
    .map(id => initialMappings.find(m => m.campus.id === id)?.campus);
    
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  
  // Dependent dropdown data
  const [semesters, setSemesters] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  
  // Loading states
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available programs and batches based on previous selections
  const availablePrograms = selectedCampus 
    ? Array.from(new Set(initialMappings.filter(m => m.campusId === selectedCampus).map(m => m.programId)))
        .map(id => initialMappings.find(m => m.programId === id)?.program)
    : [];

  const availableBatches = selectedProgram 
    ? initialMappings.filter(m => m.campusId === selectedCampus && m.programId === selectedProgram).map(m => m.batch)
    : [];

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    classTitle: "",
    topicsCovered: "",
    classSummary: "",
    keyConcepts: "",
    practicalActivity: "",
    trainerRemarks: "",
    hoursTaken: "",
    totalStudents: "",
    studentsPresent: "",
    topicStatus: "IN_PROGRESS",
  });

  // Effects for cascading dropdowns
  useEffect(() => {
    if (selectedProgram) {
      setLoadingSemesters(true);
      getSemesters(selectedProgram).then(data => {
        setSemesters(data);
        setSelectedSemester("");
        setSelectedModule("");
        setSelectedTopic("");
      }).finally(() => setLoadingSemesters(false));
    } else {
      setSemesters([]);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedSemester) {
      setLoadingModules(true);
      getModules(selectedSemester).then(data => {
        setModules(data);
        setSelectedModule("");
        setSelectedTopic("");
      }).finally(() => setLoadingModules(false));
    } else {
      setModules([]);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedModule) {
      setLoadingTopics(true);
      getTopics(selectedModule).then(data => {
        setTopics(data);
        setSelectedTopic("");
      }).finally(() => setLoadingTopics(false));
    } else {
      setTopics([]);
    }
  }, [selectedModule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Weekend
    const selectedDate = new Date(formData.date);
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
      toast.error("Cannot submit class records for weekends (Saturday/Sunday)");
      return;
    }
    
    if (parseInt(formData.studentsPresent) > parseInt(formData.totalStudents)) {
      toast.error("Present students cannot exceed total students");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitClassRecord({
        ...formData,
        campusId: selectedCampus,
        programId: selectedProgram,
        batchId: selectedBatch,
        semesterId: selectedSemester,
        moduleId: selectedModule,
        topicId: selectedTopic,
      });
      toast.success("Class record submitted successfully");
      router.push("/trainer/records");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit class record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-6 sm:p-8">
      <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        
        <div className="sm:col-span-3">
          <label htmlFor="date" className="block text-sm font-medium leading-6 text-slate-900">Class Date</label>
          <div className="mt-2">
            <input type="date" name="date" id="date" required
              value={formData.date} onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        {/* Mapped Scope Selectors */}
        <div className="sm:col-span-6">
          <h3 className="text-sm font-medium leading-6 text-slate-900 border-b pb-2 mb-4">Academic Scope</h3>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900">Campus</label>
          <select value={selectedCampus} onChange={(e) => { setSelectedCampus(e.target.value); setSelectedProgram(""); setSelectedBatch(""); }} required
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
            <option value="">Select Campus...</option>
            {mappedCampuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900">Program</label>
          <select value={selectedProgram} onChange={(e) => { setSelectedProgram(e.target.value); setSelectedBatch(""); }} required disabled={!selectedCampus}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-slate-100">
            <option value="">Select Program...</option>
            {availablePrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900">Batch</label>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} required disabled={!selectedProgram}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-slate-100">
            <option value="">Select Batch...</option>
            {availableBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Curriculum Selectors */}
        <div className="sm:col-span-6 mt-4">
          <h3 className="text-sm font-medium leading-6 text-slate-900 border-b pb-2 mb-4">Curriculum</h3>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900 flex items-center">
            Semester {loadingSemesters && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
          </label>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} required disabled={!selectedProgram || loadingSemesters}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-slate-100">
            <option value="">Select Semester...</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900 flex items-center">
            Module {loadingModules && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
          </label>
          <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} required disabled={!selectedSemester || loadingModules}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-slate-100">
            <option value="">Select Module...</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900 flex items-center">
            Topic {loadingTopics && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
          </label>
          <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} required disabled={!selectedModule || loadingTopics}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-slate-100">
            <option value="">Select Topic...</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Class Details */}
        <div className="sm:col-span-6 mt-4">
          <h3 className="text-sm font-medium leading-6 text-slate-900 border-b pb-2 mb-4">Class Details</h3>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium leading-6 text-slate-900">Class Title</label>
          <input type="text" name="classTitle" required value={formData.classTitle} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium leading-6 text-slate-900">Detailed Class Summary</label>
          <textarea name="classSummary" rows={3} required value={formData.classSummary} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-slate-900">Topics Covered (Brief)</label>
          <input type="text" name="topicsCovered" required value={formData.topicsCovered} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-slate-900">Key Concepts</label>
          <input type="text" name="keyConcepts" required value={formData.keyConcepts} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium leading-6 text-slate-900">Practical/Activity Conducted</label>
          <input type="text" name="practicalActivity" value={formData.practicalActivity} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
        </div>

        {/* Metrics */}
        <div className="sm:col-span-6 mt-4">
          <h3 className="text-sm font-medium leading-6 text-slate-900 border-b pb-2 mb-4">Metrics</h3>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900">Hours Taken Today</label>
          <div className="mt-2">
            <input type="number" step="0.5" min="0.5" max="10" name="hoursTaken" required value={formData.hoursTaken} onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900">Total Students</label>
          <div className="mt-2">
            <input type="number" min="1" name="totalStudents" required value={formData.totalStudents} onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-slate-900">Students Present</label>
          <div className="mt-2">
            <input type="number" min="0" name="studentsPresent" required value={formData.studentsPresent} onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-slate-900">Topic Status</label>
          <select name="topicStatus" required value={formData.topicStatus} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
            <option value="PENDING">Pending (Not Started)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium leading-6 text-slate-900">Trainer Remarks (Optional)</label>
          <textarea name="trainerRemarks" rows={2} value={formData.trainerRemarks} onChange={handleChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
        </div>

      </div>

      <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-slate-900/10 pt-6">
        <button type="button" onClick={() => router.push("/trainer")} className="text-sm font-semibold leading-6 text-slate-900">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedTopic}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit for Verification
        </button>
      </div>
    </form>
  );
}
