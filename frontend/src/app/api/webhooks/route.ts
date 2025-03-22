import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  // Check if the signing secret exists
  if (!SIGNING_SECRET) {
    return new Response('SIGNING_SECRET is missing', { status: 500 })
  }

  // Create Svix instance with the secret
  const wh = new Webhook(SIGNING_SECRET)

  // Extract headers from the request
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  // If headers are missing, return an error response
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 })
  }

  // Get the body of the request
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify the webhook payload with the provided headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent // Cast the result to WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Verification error', { status: 400 })
  }

  // Check event type
  const eventType = evt.type;
  const data = evt.data as unknown as {
    id: string
    email_addresses: { email_address: string }[]
    first_name: string | null
    last_name: string | null
  }

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = data;
    const email = email_addresses[0]?.email_address;

    try {
      const user = await createUser(
        id,
        email,
        first_name || "",
        last_name || ""
      );
      return new Response(JSON.stringify({ user }), { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(
        JSON.stringify({ error: "Error processing webhook" }),
        { status: 500 }
      );
    }
  }

  return new Response('Event type not supported', { status: 400 })
}

async function createUser(id: string, email: string, firstName: string, lastName: string) {
  try {
    // First check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        clerkId: id
      }
    });

    if (existingUser) {
      // Update the existing user instead of creating a new one
      return await prisma.users.update({
        where: {
          clerkId: id
        },
        data: {
          email,
          firstName,
          lastName,
          // Add any other fields you want to update
        }
      });
    }

    // If user doesn't exist, create a new one
    return await prisma.users.create({
      data: {
        clerkId: id,
        email,
        firstName,
        lastName,
        role: "" // Set default role or however you want to handle roles
      }
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}