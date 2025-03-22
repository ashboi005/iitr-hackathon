"use client";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Input } from "@/components/ui/input";
import { Search, Filter, DollarSign, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";



const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const CLERK_ID = process.env.NEXT_PUBLIC_FREELANCER_CLERK_ID;

interface Gig {
  id: number;
  title: string;
  description: string;
  skills_needed: string[];
  total_payment: number; // Corrected from 'payment'
  status: "OPEN" | "CLOSED" | "IN_PROGRESS";
  created_at: string;
  project_deadline: string;
  milestone_payments: number[];
  milestones: string[];
  employerClerkId: string;
}

interface StatusConfig {
  [key: string]: { color: string; icon: React.ElementType };
}

const statusConfig: StatusConfig = {
  OPEN: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  CLOSED: { color: "bg-red-100 text-red-800", icon: XCircle },
  IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", icon: Briefcase },
};

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    skills: [] as string[],
    min_payment: 0,
    max_payment: 10000,
    status: "OPEN"
  });

  useEffect(() => {
    const fetchGigs = async () => {
      const headers = new Headers({
        'Content-Type': 'application/json'
      });

      try {
        const params = new URLSearchParams();

        // Only add parameters with values
        if (searchQuery) params.append('title', searchQuery);
        if (filters.skills.length > 0) {
          filters.skills.forEach(skill => params.append('skills', skill));
        }
        if (filters.min_payment > 0) params.append('min_payment', filters.min_payment.toString());
        if (filters.max_payment < 10000) params.append('max_payment', filters.max_payment.toString());
        
        // Always send OPEN status by default unless changed
        if (filters.status) params.append('status', filters.status);

        const response = await fetch(`${API_BASE}/gigs/?${params}`, {
          headers,
          mode: 'cors'
        });

        // Handle CORS errors
        if (response.type === 'opaque' || response.type === 'error') {
          throw new Error('CORS policy blocked the request');
        }

        if (!response.ok) throw new Error("Failed to fetch gigs");

        const data = await response.json();
        setGigs(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Request failed");
        setLoading(false);
      }
    };

    fetchGigs();
  }, [searchQuery, filters]);
     const handleFilterApply = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Input
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        </div>

        <FilterDialog onApply={handleFilterApply} currentFilters={filters} />
      </div>

      <BentoGrid>
        {gigs.map((gig) => (
          <BentoCard
            key={gig.id}
            name={gig.title}
            className="col-span-1"
            description={gig.description}
            href={`/gig/${gig.id}`}
            cta="View Details"
            Icon={Briefcase}
            background={
                <div className="absolute right-0 top-0 p-4 flex items-center gap-2">
                  <StatusBadge status={gig.status} />
                  <span className="text-lg font-semibold">
                    ${gig.total_payment.toLocaleString()} {/* Corrected field */}
                  </span>
                </div>
            }
          />
        ))}
      </BentoGrid>
    </div>
  );
}

// Updated FilterDialog component
function FilterDialog({ onApply, currentFilters }: { 
    onApply: (filters: any) => void;
    currentFilters: any;
  }) {
    const [localFilters, setLocalFilters] = useState({
      ...currentFilters,
      status: currentFilters.status || "OPEN" // Ensure OPEN is default
    });
  

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Applying filters:", localFilters);
    onApply(localFilters);
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Gigs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Min Payment</Label>
            <Input
              type="number"
              value={localFilters.min_payment}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                min_payment: parseInt(e.target.value) || 0
              })}
              placeholder="Enter minimum payment"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Payment</Label>
            <Input
              type="number"
              value={localFilters.max_payment}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                max_payment: parseInt(e.target.value) || 0
              })}
              placeholder="Enter maximum payment"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <select
      value={localFilters.status}
      onChange={(e) => setLocalFilters({
        ...localFilters,
        status: e.target.value
      })}
    >
      <option value="OPEN">Open</option>
      <option value="CLOSED">Closed</option>
      <option value="IN_PROGRESS">In Progress</option>
    </select>
          </div>

          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function StatusBadge({ status }: { status: string }) {
    const { color, icon: Icon } = statusConfig[status] || statusConfig.OPEN;
  
    return (
      <span className={`${color} px-3 py-1 rounded-full text-sm flex items-center gap-2`}>
        <Icon className="h-4 w-4" />
        {status.replace(/_/g, " ")} {/* Replace all underscores */}
      </span>
    );
  }