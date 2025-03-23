"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase, DollarSign, CheckCircle, XCircle } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@radix-ui/react-dialog";

const CLERK_ID = process.env.NEXT_PUBLIC_FREELANCER_CLERK_ID;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface Gig {
  id: number;
  title: string;
  description: string;
  skills_needed: string[];
  project_deadline: string;
  milestones: string[];
  milestone_payments: number[];
  total_payment: number;
  status: "OPEN" | "CLOSED" | "IN_PROGRESS";
  created_at: string;
  employerClerkId: string;
}

// Simple status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`${getStatusColor()} px-3 py-1 rounded-full text-sm`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function GigPage({ params }: { params: { gigId: string } }) {
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  useEffect(() => {
    const fetchGigAndApplicationStatus = async () => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      
      try {
        // Fetch gig details
        const gigResponse = await fetch(`${API_BASE}/gigs/${params.gigId}`, { headers });
        if (!gigResponse.ok) throw new Error("Failed to fetch gig");
        const gigData: Gig = await gigResponse.json();
        setGig(gigData);

        // Check application status if user is logged in
        if (CLERK_ID) {
          const applicationResponse = await fetch(
            `${API_BASE}/gigs/gig/${gigData.id}/requests?clerk_id=${CLERK_ID}`,
            { headers }
          );
          
          if (applicationResponse.ok) {
            const applications = await applicationResponse.json();
            setHasApplied(applications.length > 0);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gig");
      } finally {
        setLoading(false);
        setCheckingApplication(false);
      }
    };

    fetchGigAndApplicationStatus();
  }, [params.gigId, CLERK_ID]);
 
  const handleApplication = async () => {
    if (!CLERK_ID || !gig) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_BASE}/gigs/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gig_id: gig.id,
          freelancerClerkId: CLERK_ID
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      setShowConfirmation(false);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Application error:", err);
      setSubmitError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) return (
    <LoadingScreen />
  );

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!gig) return <div className="p-8">Gig not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 dark:bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {gig.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <StatusBadge status={gig.status} />
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                Posted {new Date(gig.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {gig.description}
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {gig.skills_needed.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm dark:bg-gray-800/50 dark:text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Project Timeline
              </h2>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  Deadline: {new Date(gig.project_deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Milestones
              </h2>
              <div className="space-y-4">
                {gig.milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800/30"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium dark:text-gray-300">{milestone}</span>
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {gig.milestone_payments[index]?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Project Budget</h3>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold dark:text-gray-100">
                  ${gig.total_payment.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Current Status</h3>
              <div className="flex items-center gap-2 dark:text-gray-300">
                {gig.status === "OPEN" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className="capitalize">
                  {gig.status.replace("_", " ")}
                </span>
              </div>
            </div>
 {/* Application Dialog */}
 
        <Button 
              className="w-full transition-colors"
              onClick={() => setShowConfirmation(true)}
              disabled={
                gig.status !== "OPEN" || 
                !CLERK_ID || 
                hasApplied || 
                checkingApplication || 
                loading
              }
              variant={
                hasApplied ? "default" : 
                gig.status === "OPEN" ? "default" : "secondary"
              }
            >
              {loading ? "Loading..." : 
              checkingApplication ? "Checking..." : 
              hasApplied ? "Applied ✓" :
              gig.status === "OPEN" ? "Apply Now" : "Closed for Applications"}
            </Button>

            {!CLERK_ID && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You must be logged in to apply
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              Confirm Application
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Are you sure you want to apply to this gig? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {submitError && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {submitError}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="dark:border-gray-600 dark:text-gray-100"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="default" 
              onClick={handleApplication}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
        
    
  