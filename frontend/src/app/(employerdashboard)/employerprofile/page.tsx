"use client";
import { FreelancerProfileDialog } from '@/components/FreelancerProfile';
import LoadingScreen from '@/components/LoadingScreen';
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { useUser } from '@clerk/nextjs';
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Link, 
  Award,
  ChevronRight,
  Check,
  Clock,
  Star,
  Link2
} from "lucide-react";
import { useState, useEffect } from 'react';

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
// const CLERK_ID = user.user?.id;
const CLERK_ID = "string2";

const ProfilePage: React.FC = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [freelancerDetails, setFreelancerDetails] = useState<FreelancerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const user = useUser();
  const fetchData = async () => {
    // const ngrokBypassHeaders = { 'ngrok-skip-browser-warning': 'true' };
    try {
      if (!API_BASE || !CLERK_ID) throw new Error('Missing environment configuration');

      const userRes = await fetch(`${API_BASE}/user-details/basic/${CLERK_ID}`, {
       
      });
      const userData: UserDetails = await userRes.json();
      setUserDetails(userData);

      const EmployerRes = await fetch(`${API_BASE}/user-details/employer/${CLERK_ID}`, {
      
      });
      const freelancerData: FreelancerDetails = await EmployerRes.json();
      setFreelancerDetails(freelancerData);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleSaveProfile = async (basicData: any, freelancerData: any) => {
    try {
      await fetch(`${API_BASE}/user-details/basic/${CLERK_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        
        },
        body: JSON.stringify(basicData)
      });

      await fetch(`${API_BASE}/user-details/freelancer/${CLERK_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(freelancerData)
      });

      setRefreshTrigger(prev => !prev); // Trigger data refresh
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };   
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Move Loading component inside main component to avoid hook order issues
  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
    </div>
  );

  const handleImageUpload = async (basicData: any) => {
    setIsImageUploading(true);
    await fetch(`${API_BASE}/user-details/basic/${CLERK_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        
        },
        body: JSON.stringify(basicData)
      });
    }

      
  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
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
        <div className="max-w-4xl p-6 ml-0">
        {isImageUploading && <LoadingSpinner />}
  
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">{userDetails?.clerkId || "Your Profile"}</h1>
            <p className="text-muted-foreground mt-2">
              {freelancerDetails?.occupation || "Professional Freelancer"}
            </p>
          </div>
          <FreelancerProfileDialog 
            userDetails={userDetails}
            freelancerDetails={freelancerDetails}
            onSave={handleSaveProfile}
          />
        </div>
  
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="relative group">
              <img
                src={userDetails?.profilePicture || "/default-avatar.png"}
                alt="Profile"
                className="w-full h-64 object-cover rounded-lg border"
              />
              <label className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-lg cursor-pointer hover:bg-black/70 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      await handleImageUpload(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                />
                Upload New
              </label>
            </div>
  
            {/* Contact Info */}
            <div className="space-y-4 pl-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">
                    {userDetails?.address || "Not specified"}
                  </p>
                </div>
              </div>
  
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">
                    {userDetails?.phone || "Not provided"}
                  </p>
                </div>
              </div>
  
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">
                    {userDetails?.clerkId || "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Right Column */}
          <div className="space-y-8 pl-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Award className="w-6 h-6" />
                Professional Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {userDetails?.bio || "No biography added yet"}
                  </p>
                </div>
  
                <div>
                  <h3 className="font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerDetails?.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-muted rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
  
                <div>
                  <h3 className="font-medium mb-2">Portfolio Links</h3>
                  <div className="space-y-2">
                    {freelancerDetails?.portfolioLinks?.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Link2 className="w-4 h-4" />
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
  
          
          </div>
        </div>
      </div>
    );
  };
  
  export default ProfilePage;