"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";  // Import Clerk's useUser hook

export default function CreateGigForm() {
  const { user, isLoaded, isSignedIn } = useUser(); // Get user details from Clerk
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Make sure user data is loaded before rendering the form
  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>; // Show loading state until user data is available
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    skills_needed: "",
    project_deadline: "",
    milestones: "",
    milestone_payments: "",
    total_payment: "",
    employerClerkId: user?.id, // Use Clerk's user ID dynamically
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const skills = form.skills_needed.split(",").map((s) => s.trim());
    const milestones = form.milestones.split(",").map((s) => s.trim());
    const milestone_payments = form.milestone_payments
      .split(",")
      .map((p) => parseFloat(p.trim()));

    const total_payment = parseFloat(form.total_payment);

    // ✅ Step 1: Create the gig by sending data to backend API
    const res = await fetch(`${apiUrl}/Prod/gigs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        skills_needed: skills,
        project_deadline: form.project_deadline,
        milestones,
        milestone_payments,
        total_payment,
        employerClerkId: form.employerClerkId, // Send employerClerkId from Clerk
      }),
    });

    if (res.ok) {
      alert("Gig posted successfully!");
    } else {
      alert("Failed to post gig.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="title"
        onChange={handleChange}
        placeholder="Gig Title"
        className="border p-2 w-full"
      />
      <textarea
        name="description"
        onChange={handleChange}
        placeholder="Gig Description"
        className="border p-2 w-full"
      />
      <input
        name="skills_needed"
        onChange={handleChange}
        placeholder="Skills (comma-separated)"
        className="border p-2 w-full"
      />
      <input
        name="project_deadline"
        onChange={handleChange}
        type="datetime-local"
        className="border p-2 w-full"
      />
      <input
        name="milestones"
        onChange={handleChange}
        placeholder="Milestones (comma-separated)"
        className="border p-2 w-full"
      />
      <input
        name="milestone_payments"
        onChange={handleChange}
        placeholder="Payments (comma-separated ETH)"
        className="border p-2 w-full"
      />
      <input
        name="total_payment"
        onChange={handleChange}
        placeholder="Total ETH"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Gig
      </button>
    </form>
  );
}
