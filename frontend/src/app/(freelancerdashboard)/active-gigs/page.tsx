"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ActiveGigsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Active Gigs</h1>
      <Card className="p-6">
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Your active gigs will appear here</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
