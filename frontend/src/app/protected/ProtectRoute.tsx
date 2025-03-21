// app/protected/ProtectRoute.tsx
import { useUser } from '@clerk/nextjs';
import { RedirectToSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/router';

const ProtectRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // If the user is not signed in, redirect to the sign-in page
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // If the user is signed in but doesn't have the correct role, redirect to a fallback route (e.g., home page or error page)
  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) {
    router.push('/');  // Redirect to home or any other page you'd like
    return null;  // Prevent rendering anything while the redirect occurs
  }

  // If the user is signed in and has the correct role, render the children
  return <>{children}</>;
};

export default ProtectRoute;
