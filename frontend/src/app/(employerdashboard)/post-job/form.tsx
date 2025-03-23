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
  <div className="max-w-2xl mx-auto p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow-sm">
    <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-8">Post New Gig</h1>
    
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Job Title</label>
        <input
          name="title"
          onChange={handleChange}
          placeholder="Senior Web Developer Needed"
          className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
        <textarea
          name="description"
          onChange={handleChange}
          placeholder="Detailed project description..."
          rows={4}
          className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Skills Needed</label>
          <input
            name="skills_needed"
            onChange={handleChange}
            placeholder="React, Solidity, TypeScript"
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Deadline</label>
          <input
            name="project_deadline"
            type="datetime-local"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Milestones</label>
          <input
            name="milestones"
            onChange={handleChange}
            placeholder="Design, Development, Testing"
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Milestone Payments</label>
          <input
            name="milestone_payments"
            onChange={handleChange}
            placeholder="0.5, 1.0, 0.5 ETH"
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Payment</label>
          <input
            name="total_payment"
            onChange={handleChange}
            placeholder="2.0 ETH"
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Freelancer Wallet</label>
          <input
            name="freelancer_address"
            onChange={handleChange}
            placeholder="0x1234...abcd"
            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        Post Job & Deploy Contract
      </button>
    </form>
  </div>
);
}
