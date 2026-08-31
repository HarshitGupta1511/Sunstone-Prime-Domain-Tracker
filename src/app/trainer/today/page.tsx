import { ClassEntryForm } from "./ClassEntryForm";
import { getTrainerMappings } from "./actions";

export default async function TodayClassPage() {
  const mappings = await getTrainerMappings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Today's Class
          </h2>
          <p className="mt-1 flex text-sm text-slate-500">
            Submit your daily class delivery record.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
        <ClassEntryForm initialMappings={mappings} />
      </div>
    </div>
  );
}
