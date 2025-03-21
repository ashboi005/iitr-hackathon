import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Verification error', { status: 400 })
  }

  // Check event type
  if (evt.type !== 'user.created') {
    return new Response('Event type not supported', { status: 400 })
  }

  // Extract user data from the webhook event
  const { id, email_addresses, first_name, last_name } = evt.data
  const email = email_addresses && email_addresses[0]?.email_address // Safe check for email_addresses

  // If there's no email, return an error
  if (!email) {
    return new Response('Email address is missing', { status: 400 })
  }

  // Insert data into the database (Prisma)
  try {
    const user = await prisma.user.create({
      data: {
        id,
        email,
        firstName: first_name ?? '',  // Use default empty string if null or undefined
        lastName: last_name ?? '',    // Use default empty string if null or undefined
      },
    })
    console.log('User successfully saved:', user)
  } catch (error) {
    console.error('Error saving user:', error)
    return new Response('Error saving user', { status: 500 })
  }

  // Respond back to acknowledge that the webhook was received
  return new Response('Webhook received', { status: 200 })
}
