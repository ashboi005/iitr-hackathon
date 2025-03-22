"use client";

import { useState } from "react";
import { deployFreelanceContract } from "@/lib/ethers/deployContract";
import { useUser } from "@clerk/clerk-react";


export default function JobForm() {
  const { user } = useUser();

  const [form, setForm] = useState({
    title: "",
    description: "",
    skills_needed: "",
    project_deadline: "",
    milestones: "",
    milestone_payments: "",
    total_payment: "",
    employerClerkId: user?.id, // Replace with dynamic auth ID
    freelancer_address: "", // Add freelancer address to the form state
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
    const milestoneAmount = milestone_payments[0]; // Assuming funding first milestone

    // ✅ Step 1: Deploy the smart contract using freelancer's address
    const contractAddress = await deployFreelanceContract(
      form.freelancer_address,  // Freelancer’s address passed dynamically
      milestoneAmount
    );

    if (!contractAddress) {
      alert("Smart contract deployment failed.");
      return;
    }

    // ✅ Step 2: Send job + contractAddress to backend
    const res = await fetch("http://localhost:8000/gigs/", {
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
        employerClerkId: form.employerClerkId,
        contract_address: contractAddress, // Send contract address to backend
      }),
    });

    if (res.ok) {
      alert("Job posted and contract created!");
    } else {
      alert("Failed to post job.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="title" onChange={handleChange} placeholder="Job Title" className="border p-2 w-full" />
      <textarea name="description" onChange={handleChange} placeholder="Job Description" className="border p-2 w-full" />
      <input name="skills_needed" onChange={handleChange} placeholder="Skills (comma-separated)" className="border p-2 w-full" />
      <input name="project_deadline" onChange={handleChange} type="datetime-local" className="border p-2 w-full" />
      <input name="milestones" onChange={handleChange} placeholder="Milestones (comma-separated)" className="border p-2 w-full" />
      <input name="milestone_payments" onChange={handleChange} placeholder="Payments (comma-separated ETH)" className="border p-2 w-full" />
      <input name="total_payment" onChange={handleChange} placeholder="Total ETH" className="border p-2 w-full" />
      <input name="freelancer_address" onChange={handleChange} placeholder="Freelancer Wallet Address" className="border p-2 w-full" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Post Job</button>
    </form>
  );
}
