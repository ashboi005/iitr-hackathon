import { SignOutButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <div>
      <h1 className="bg-slate-400">Welcome to the Home Page</h1>
      <SignOutButton/>
    </div>
  );
}
