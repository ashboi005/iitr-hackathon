"use client";

import { useEffect, useState } from "react";

interface Request {
  id: number;
  freelancerClerkId: string;
  freelancer_wallet_address: string;
  status: string;
}

export default function GigRequestList({ gigId }: { gigId: number }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchRequests = async () => {
    const res = await fetch(`${apiUrl}/Prod/gigs/gig/${gigId}/requests`);
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, [gigId]);

  const handleApprove = async (
    requestId: number,
    wallet: string,
    milestoneAmount: number
  ) => {
    try {
      const { deployFreelanceContract } = await import("@/lib/ethers/deployContract");

      // Step 1: Deploy smart contract
      const contractAddress = await deployFreelanceContract(wallet, milestoneAmount);
      if (!contractAddress) {
        alert("Smart contract deployment failed");
        return;
      }

      // Step 2: Save contract address + approval in backend
      const res = await fetch(`${apiUrl}/Prod/gigs/request/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_status: "approved",
          payment_verified: true,
          freelancer_wallet_address: wallet,
          contract_address: contractAddress,
        }),
      });

      if (res.ok) {
        alert("Freelancer approved and contract saved!");
        fetchRequests(); // refresh list
      } else {
        alert("Backend approval failed");
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {requests.length === 0 && <p>No requests yet.</p>}
      {requests.map((req) => (
        <div key={req.id} className="border p-4 rounded shadow">
          <p>Freelancer ID: {req.freelancerClerkId}</p>
          <p>Wallet: {req.freelancer_wallet_address}</p>
          <p>Status: {req.status}</p>

          {req.status !== "approved" && (
            <button
              onClick={() => handleApprove(req.id, req.freelancer_wallet_address, 0.01)} // 👉 Set actual milestone amount
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve & Deploy Contract
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
