// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes configuration
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/redirect', // Add redirect handler to public routes
])

export default clerkMiddleware((auth, req) => {
  // 1. Handle public routes first
  if (isPublicRoute(req)) return // No action needed for public routes

  // 2. Protect non-public routes
  auth.protect()

  // 3. Role-based redirect logic for authenticated users
  const url = new URL(req.nextUrl)
  const path = url.pathname
  
  // Only redirect if not already on a role-specific route
  if (!path.startsWith('/admindashboard') && 
      !path.startsWith('/employerdashboard') && 
      !path.startsWith('/freelancerdashboard')) {
    url.pathname = '/redirect'
    return Response.redirect(url)
  }
})

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|.*\\..*).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}