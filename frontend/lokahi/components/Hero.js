import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Sidebar from "./Sidebar";

const Hero = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return (
      <button className="btn btn-square min-w-screen">
      <span className="loading loading-spinner"></span>
    </button>
    ); // Loading state for session data
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
    <div className="flex flex-row justify-between p-3 ">
      <div>
        <h1>Hero</h1>
        <div>welcome {session.user.name}</div>
       
      </div>
      <div>
        <Sidebar />
      </div>
    </div>
  );
};

export default Hero;
