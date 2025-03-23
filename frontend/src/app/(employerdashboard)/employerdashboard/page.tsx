"use client";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { 
  User, 
  Briefcase,  
  Clock, 
  CircleDollarSign,
  FileText,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api"; // Fallback for local development

interface UserDetails {
  phone: string;
  address: string;
  bio: string;
  profilePicture: string;
  id: number;
  clerkId: string;
}

interface EmployerDetails {
  worksNeeded: string[];
  id: number;
  clerkId: string;
  averageRating: number;
}

interface BalanceData {
  amount: number;
  id: number;
  clerkId: string;
}

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

export default function EmployerDashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [employerDetails, setEmployerDetails] = useState<EmployerDetails | null>(null);
  const [activeGigs, setActiveGigs] = useState<ActiveGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const CLERK_ID = process.env.NEXT_PUBLIC_CLERK_ID_EMPLOYER || "string2"; // Hardcoded for testing

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!API_BASE || !CLERK_ID) throw new Error('Missing environment configuration');

        const [userRes, employerRes, gigsRes, balanceRes] = await Promise.all([
          fetch(`${API_BASE}/user-details/basic/${CLERK_ID}`),
          fetch(`${API_BASE}/user-details/employer/${CLERK_ID}`),
          fetch(`${API_BASE}/gigs/active/employer/${CLERK_ID}`),
          fetch(`${API_BASE}/balance/user/${CLERK_ID}`)
        ]);

        // Check if all responses are OK
        if (!userRes.ok) throw new Error(`Failed to fetch user details: ${userRes.statusText}`);
        if (!employerRes.ok) throw new Error(`Failed to fetch employer details: ${employerRes.statusText}`);
        if (!gigsRes.ok) throw new Error(`Failed to fetch active gigs: ${gigsRes.statusText}`);
        if (!balanceRes.ok) throw new Error(`Failed to fetch balance: ${balanceRes.statusText}`);

        const [userData, employerData, gigsData, balanceData] = await Promise.all([
          userRes.json(),
          employerRes.json(),
          gigsRes.json(),
          balanceRes.json()
        ]);

        setUserDetails(userData);
        setEmployerDetails(employerData);
        setActiveGigs(gigsData);
        setBalance(balanceData.amount);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchData();
  }, [CLERK_ID]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto text-red-500">
        Error: {error}
      </div>
    );
  }

  const countCompletedMilestones = (milestoneStatus: string[]) => 
    milestoneStatus.filter(status => status === "APPROVED").length;
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-zinc-800 dark:text-zinc-200">Employer Dashboard</h1>
      
      <BentoGrid>
        {/* Profile Card */}
        <BentoCard
          name={user.user?.fullName || "Employer"}
          className="md:col-span-1 relative text-zinc-800 dark:text-zinc-200"
          description={employerDetails?.worksNeeded.join(", ") || "Employer"}
          href="/employerprofile"
          cta="Edit Profile"
          Icon={({ className, ...props }: React.ComponentProps<typeof User>) => (
            <User
              className={cn(
                "h-12 w-12 origin-left transform-gpu text-zinc-700 dark:text-zinc-300 transition-all duration-300 ease-in-out group-hover:scale-75",
                userDetails?.profilePicture ? "opacity-0" : "",
                className
              )}
              {...props}
            />
          )}
          background={
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {userDetails?.profilePicture && (
                <img 
                  src={userDetails.profilePicture} 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-zinc-900/10 dark:bg-zinc-900/50" />
            </div>
          }
        />

        {/* Active Gigs Card */}
        <BentoCard
  name="Active Gigs"
  className="md:col-span-2 relative overflow-hidden"
  description={`${activeGigs.length} ongoing engagements`}
  href="/active-employer-gigs"
  cta="Manage Gigs"
  Icon={({ className, ...props }: React.ComponentProps<typeof User>) => (
    <User
      className={cn(
        "h-12 w-12 origin-left transform-gpu text-zinc-700 dark:text-zinc-300 transition-all duration-300 ease-in-out group-hover:scale-75",
        userDetails?.profilePicture ? "opacity-0" : "",
        className
      )}
      {...props}
    />
  )}
  background={
    <div className="absolute inset-0 flex flex-col">
      {/* Gradient header overlay */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-zinc-950/80 to-transparent z-10" />
      
      {/* Scrollable content area */}
      <div className="relative h-full pt-16 pb-8 overflow-y-auto">
        <div className="p-4 flex flex-col gap-2">
          {activeGigs.map((gig) => (
            <div
              key={gig.gig_id}
              className="group flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Gig #{gig.gig_id}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200">
                    {countCompletedMilestones(gig.milestone_status)}/
                    {gig.milestone_status.length} done
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(gig.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
    </div>
  }
/>
        {/* Earnings Card */}
        <BentoCard
          name="Earnings"
          className="md:col-span-1"
          description="Current balance"
          href="/earnings"
          cta="View Details"
          Icon={CircleDollarSign}
          background={
            <div className="absolute right-0 top-0 p-4 text-2xl font-bold text-green-600 dark:text-green-300">
              ${balance?.toLocaleString() || 0}
            </div>
          }
        />

        
      </BentoGrid>
    </div>
  );
}