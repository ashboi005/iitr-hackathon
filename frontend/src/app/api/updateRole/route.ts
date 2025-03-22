// src/app/api/updateRole/route.ts

import { auth } from '@clerk/nextjs/server'; // App Router Clerk import
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth(); // Use Clerk's `auth()` in App Router

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !['employer', 'freelancer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update Clerk metadata
    await clerk.users.updateUser(userId, {
      publicMetadata: { role },
    });

    // Update database
    const updatedUser = await prisma.users.update({
      where: { clerkId: userId },
      data: { role },
    });

    return NextResponse.json({ success: true, updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
