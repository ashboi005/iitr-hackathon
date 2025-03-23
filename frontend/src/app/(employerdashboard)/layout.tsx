"use client";
import { useUser } from "@clerk/nextjs";
import { FreelancerSidebar } from "@/components/FreeLancerSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { Footerdemo } from "@/components/ui/footer-section";
import ProtectRoute from "@/protected/ProtectRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }
    
    if (isLoaded && user) {
      const userRole = user.publicMetadata.role;
      if (userRole === 'freelancer' && !pathname.includes('/freelancerdashboard')) {
        router.push('/freelancerdashboard');
      } else if (userRole === 'employer' && !pathname.includes('/employerdashboard')) {
        router.push('/employerdashboard');
      }
    }
  }, [isLoaded, user, router, pathname]);

  if (!isLoaded || !user) {
    return <LoadingScreen />;
  }

  return (<>
      <ProtectRoute allowedRoles={['employer']}>

    <div className="flex h-screen">

      <main className="flex-1 p-4 h-[100vh] overflow-y-auto ">{children}</main>
    </div>
    </ProtectRoute>

      
    </>
  );
}

