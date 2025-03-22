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
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface UserDetails {
  phone: string;
  address: string;
  bio: string;
  profilePicture: string;
  id: number;
  clerkId: string;
}

interface FreelancerDetails {
  occupation: string;
  skills: string[];
  portfolioLinks: string[];
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

export default function FreelancerDashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [freelancerDetails, setFreelancerDetails] = useState<FreelancerDetails | null>(null);
  const [activeGigs, setActiveGigs] = useState<ActiveGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const SKILLS = [
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "GraphQL",
    "Docker",
    "AWS",
    "PostgreSQL",
    "MongoDB",
    "Tailwind CSS",
    "Kubernetes",
    "Git",
    "REST API",
    "Jest",
    "Cypress",
    "Firebase",
    "TensorFlow",
    "PyTorch",
    "Figma",
    "Adobe XD",
    "Solidity",
    "Rust",
    "Go",
    "Java",
    "Swift",
    "Kotlin",
    "Unity",
    "Blender",
    "Three.js"
  ];
const CLERK_ID = user.user?.id;
  useEffect(() => {
    const fetchData = async () => {
     
      try {
        if (!API_BASE || !CLERK_ID) throw new Error('Missing environment configuration');

        const userRes = await fetch(`${API_BASE}/user-details/basic/${CLERK_ID}`, {
          });
        const userData: UserDetails = await userRes.json();
        setUserDetails(userData);

        const freelancerRes = await fetch(`${API_BASE}/user-details/freelancer/${CLERK_ID}`, {
         
        });
        const freelancerData: FreelancerDetails = await freelancerRes.json();
        setFreelancerDetails(freelancerData);

        const gigsRes = await fetch(`${API_BASE}/gigs/active/freelancer/${CLERK_ID}`, {
         
        });
        const gigsData: ActiveGig[] = await gigsRes.json();
        setActiveGigs(gigsData);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      if (!API_BASE || !CLERK_ID) throw new Error('Missing environment configuration');
  
      // Existing fetches
      const [userRes, freelancerRes, gigsRes, balanceRes] = await Promise.all([
        fetch(`${API_BASE}/user-details/basic/${CLERK_ID}`),
        fetch(`${API_BASE}/user-details/freelancer/${CLERK_ID}`),
        fetch(`${API_BASE}/gigs/active/freelancer/${CLERK_ID}`),
        fetch(`${API_BASE}/balance/user/${CLERK_ID}`)
      ]);
  
      // Handle CORS errors
      if (!balanceRes.ok) throw new Error(`HTTP error! status: ${balanceRes.status}`);
      
      const balanceData: BalanceData = await balanceRes.json();
      setBalance(balanceData.amount);
  
      // Rest of your existing data processing
      const userData: UserDetails = await userRes.json();
      setUserDetails(userData);
  
      const freelancerData: FreelancerDetails = await freelancerRes.json();
      setFreelancerDetails(freelancerData);
  
      const gigsData: ActiveGig[] = await gigsRes.json();
      setActiveGigs(gigsData);
  
      setLoading(false);
    } catch (err) {
      // Enhanced error handling for CORS
      if (err instanceof TypeError) {
        setError('Network error - check API CORS configuration');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <BentoGrid>
        {/* Updated Profile Card */}
        <BentoCard
          name={user.user?.fullName || "User"}
          className="md:col-span-1 relative text-white"
          description={freelancerDetails?.occupation || "Professional"}
          href="/freelancer/profile"
          cta="Edit Profile"
          Icon={({ className, ...props }: React.ComponentProps<typeof User>) => (
            <User
              className={cn(
                "h-12 w-12 origin-left transform-gpu text-zinc-700 transition-all duration-300 ease-in-out group-hover:scale-75",
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
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
             
            </div>
          }
        />
        <BentoCard
          name="Active Gigs"
          className="md:col-span-2"
          description={`${activeGigs.length} ongoing engagements`}
          href="/gigs"
          cta="View All Gigs"
          Icon={Briefcase}
          background={
            <div className="absolute inset-0 p-4 flex flex-col gap-2">
              {activeGigs.map((gig) => (
                <a
                  key={gig.id}
                  href={`/gigs/${gig.id}`}
                  className="group flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Gig #{gig.gig_id}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                        {gig.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(gig.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </div>
          }
        />

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
        <BentoCard
          name="Pending Milestones"
          className="md:col-span-1"
          description="3 milestones to complete"
          href="/milestones"
          cta="Review Milestones"
          Icon={FileText}
          background={
            <div className="absolute right-0 top-0 h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-300">3</span>
            </div>
          }
        />
      </BentoGrid>
      
    </div>

  )
}