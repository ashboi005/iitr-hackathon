"use client"
import LandingPage from "@/components/LandingPage";
import { Footerdemo } from "@/components/ui/footer-section";
import { SignOutButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <>
      <LandingPage />
      <Footerdemo/>
    </>
  );
}
