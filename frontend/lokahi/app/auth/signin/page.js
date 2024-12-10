"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before accessing router
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to the home page if a session exists
  useEffect(() => {
    if (session && mounted) {
      router.push("/");
    }
  }, [session, mounted, router]);

  // Show loading state while session is being fetched
  if (!mounted || status === "loading") {
    return <span className="loading loading-spinner loading-lg text-accent"></span>;
  }

  if (!session) {
    return (
      <div>
        <h1>Not signed in</h1>
        <button
          className="btn btn-outline btn-accent"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name || "User"}</h1>
      <button className="btn btn-outline btn-warning" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
};

export default Page;
