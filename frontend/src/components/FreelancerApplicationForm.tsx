"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function FreelancerApplicationForm({ gigId }: { gigId: number }) {

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useUser();
  const [form, setForm] = useState({
    gig_id: gigId,
    freelancerClerkId: user?.id,  // Dynamically get the freelancer's Clerk ID
    freelancer_wallet_address: "", // Freelancer's wallet address input
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Send freelancer application to backend with wallet address
    const res = await fetch(`${apiUrl}/Prod/gigs/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gig_id: form.gig_id,
        freelancerClerkId: form.freelancerClerkId,
        freelancer_wallet_address: form.freelancer_wallet_address,
      }),
    });

    if (res.ok) {
      alert("Application sent successfully!");
    } else {
      alert("Failed to apply for gig.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="freelancer_wallet_address"
        onChange={handleChange}
        placeholder="Freelancer Wallet Address"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Apply for Gig
      </button>
    </form>
  );
}
