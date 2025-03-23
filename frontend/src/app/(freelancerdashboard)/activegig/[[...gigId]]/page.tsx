import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

async function fetchGigDetails(gigId: string) {
  const res = await fetch(`/api/gigs/gig/${gigId}/active`);
  return res.json();
}

export default async function GigDetailPage({ params }: { params: { gigId: string } }) {
  const gig = await fetchGigDetails(params.gigId);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gig Details</h1>
        <Link href="/freelancer/gigs">
          <Button variant="outline">Back to Gigs</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Gig ID</h3>
              <p>{gig.gig_id}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{gig.status}</p>
            </div>
            <div>
              <h3 className="font-semibold">Employer</h3>
              <p>{gig.employerClerkId}</p>
            </div>
            <div>
              <h3 className="font-semibold">Created At</h3>
              <p>{new Date(gig.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Milestones</h3>
            <div className="space-y-2">
              {gig.milestone_status.map((status: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Milestone {index + 1}</span>
                  <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Update Milestones</h3>
            {/* Add your milestone update form here */}
            <Button>Mark Next Milestone Complete</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}