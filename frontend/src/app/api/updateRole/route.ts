// src/pages/api/updateRole.ts

import { getAuth } from '@clerk/nextjs/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server'; // Correct Next.js server import

const prisma = new PrismaClient();

// Initialize Clerk client for Next.js
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get authenticated user ID
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate role
    const { role } = req.body;
    if (!role || !['employer', 'freelancer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Update Clerk metadata using Next.js client
    await clerk.users.updateUser(userId, {
      publicMetadata: { role },
    });

    // Update database
    const updatedUser = await prisma.users.update({
      where: { clerkId: userId },
      data: { role },
    });

    return res.status(200).json({ success: true, updatedUser });

  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}