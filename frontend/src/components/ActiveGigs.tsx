import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

async function fetchActiveGigs(clerkId: string) {
  const res = await fetch(`/api/gigs/active/freelancer/${clerkId}`);
  return res.json();
}

// Define interface for gig
interface Gig {
  gig_id: number;
  employerClerkId: string;
  milestone_status: string[];
  status: string;
}

export default async function ActiveGigs() {
  // Replace with actual clerk_id from your auth provider
  const clerkId = "user_123";
  const gigs = await fetchActiveGigs(clerkId);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gig ID</TableHead>
          <TableHead>Employer</TableHead>
          <TableHead>Milestones</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gigs.map((gig: Gig) => (
          <TableRow key={gig.gig_id}>
            <TableCell>{gig.gig_id}</TableCell>
            <TableCell>{gig.employerClerkId}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {gig.milestone_status.map((status: string, index: number) => (
                  <Badge key={index} variant="outline">{status}</Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{gig.status}</Badge>
            </TableCell>
            <TableCell>
              <Link href={`/freelancer/gigs/${gig.gig_id}`} className="text-primary hover:underline">
                View Details
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}