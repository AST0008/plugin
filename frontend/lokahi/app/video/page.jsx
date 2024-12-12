"use client";
import { signIn, useSession } from "next-auth/react";
import Recording from "./Recording";
import { useRouter } from "next/navigation";
export default function Page() {


  const router = useRouter()
  return (
    <div className="flex flex-col min-h-screen bg-base-200 justify-center items-center">
      <Recording />
      <button onClick={ () => router.push('/report')} className="btn">
      
      Check out the report 
      </button>

    </div>
  );
}
