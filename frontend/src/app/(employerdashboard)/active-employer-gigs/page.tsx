"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Briefcase, Clock, ChevronRight, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface ActiveGig {
  gig_id: number;
  freelancerClerkId: string;
  employerClerkId: string;
  milestone_status: string[];
  status: string;
  id: number;
  milestone_links: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

export default function EmployerActiveGigs() {
  const { user } = useUser();
  const [activeGigs, setActiveGigs] = useState<ActiveGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveGigs = async () => {
      try {
        if (!API_BASE || !user?.id) return;

        const response = await fetch(
        //   `${API_BASE}/gigs/active/employer/${user.id}`,
          `${API_BASE}/gigs/active/employer/string2`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        // Filter gigs to only show ACTIVE ones
        const activeGigs = data.filter((gig: ActiveGig) => gig.status === "ACTIVE");
        setActiveGigs(activeGigs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch gigs");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveGigs();
  }, [user?.id]);

  // Count completed milestones (APPROVED status)
  const countCompletedMilestones = (milestoneStatus: string[]) => 
    milestoneStatus.filter(status => status === "APPROVED").length;

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-100 rounded-xl p-4">
                <div className="h-4 bg-zinc-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-zinc-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-zinc-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">
          Active Gigs
        </h1>
        <span className="text-zinc-600 dark:text-zinc-400">
          {activeGigs.length} active gigs
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeGigs.map((gig) => (
          <div
            key={gig.gig_id}
            className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Gig #{gig.gig_id}
              </h3>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-sm flex items-center gap-1",
                  gig.status === "COMPLETED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : gig.status === "TERMINATED"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                )}
              >
                {gig.status === "COMPLETED" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : gig.status === "TERMINATED" ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <Briefcase className="w-4 h-4" />
                )}
                {gig.status}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Milestones Completed:{" "}
                <span className="font-medium">
                  {countCompletedMilestones(gig.milestone_status)}/
                  {gig.milestone_status.length}
                </span>
              </p>
              <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700 mt-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{
                    width: `${(countCompletedMilestones(gig.milestone_status) / gig.milestone_status.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  Created: {new Date(gig.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4">
              <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                Milestone Details
              </h4>
              <div className="space-y-2">
                {Object.entries(gig.milestone_links).map(([milestoneIndex, links]) => (
                  <div key={milestoneIndex} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Milestone {parseInt(milestoneIndex) + 1}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          gig.milestone_status[parseInt(milestoneIndex)] === "APPROVED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        )}
                      >
                        {gig.milestone_status[parseInt(milestoneIndex)]}
                      </span>
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs space-y-1">
                      {links.map((link, linkIndex) => (
                        <a
                          key={linkIndex}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeGigs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No active gigs found
          </h3>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            All your active gigs will appear here
          </p>
        </div>
      )}
    </div>
  );
}