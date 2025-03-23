"use client";
import React, { useState } from "react";
import defaultAvatar from '../app/images/defaut-avatar.jpg';
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { LayoutDashboard, User, Briefcase, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { SignOutButton, useUser } from "@clerk/nextjs";
// import { cn } from "@/lib/utils";

export function FreelancerSidebar({ currentPath }: { currentPath: string }) {
  const { user } = useUser();
  const [open, setOpen] = useState(true);

  const links = [
    {
      label: "Dashboard",
      href: "/freelancerdashboard",
      icon: <LayoutDashboard className="h-5 w-5 m-1" />,
    },
    {
      label: "Profile",
      href: "/freelancerprofile",
      icon: <User className="h-5 w-5 m-1" />,
    },
    {
      label: "Gigs",
      href: "/gigs",
      icon: <Briefcase className="h-5 w-5 m-1" />,
    },
    {
      label: "Active Gigs",
      href: "/active-gigs",
      icon: <Briefcase className="h-5 w-5 m-1" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 m-1" />,
    },
  ];
  return (
    <div className="h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto   overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-3">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  isActive={currentPath === link.href}
                />
              ))}
            </div>
          </div>
          <div>
            <SignOutButton>
              <SidebarLink
                link={{
                  label: user?.fullName || "User",
                  href: "#",
                  icon: (
                    <Image
                      src={user?.imageUrl || "https://via.placeholder.com/50"}
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
            </SignOutButton>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Workly
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
export default FreelancerSidebar;