"use client";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Profile() {
  const { data: session, status } = useSession();

  

  return (
    <>
    <div className="min-h-screen bg-gray-900 flex flex-col text-2xl">

    {/* <Navbar /> */}
    {/* <Hero /> */}

    </div>
    
    </>
  );
}
