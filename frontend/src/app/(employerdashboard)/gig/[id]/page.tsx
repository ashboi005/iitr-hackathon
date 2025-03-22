"use client";

import { useParams } from "next/navigation";
import GigRequestList from "@/components/GigRequestList";

export default function GigRequestPage() {
  const params = useParams();
  const gigId = Number(params.id);

  if (!gigId) return <div>Invalid Gig ID</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Requests for Gig #{gigId}</h1>
      <GigRequestList gigId={gigId} />
    </div>
  );
}
