import CreateGigForm from "@/components/gigform";

export default function PostJobPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
      <CreateGigForm />
    </div>
  );
}