// app/redirect/page.tsx
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export default async function RedirectPage() {
  const user = await currentUser()
  const role = user?.publicMetadata.role || 'user'

  switch (role) {
    case 'admin': redirect('/admindashboard')
    case 'employer': redirect('/employerdashboard')
    case 'freelancer': redirect('/freelancerdashboard')
    default: redirect('/')
  }
}