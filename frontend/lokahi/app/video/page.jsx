"use client";
import Recording from "./Recording";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-base-200 justify-center items-center">
      
      <Recording />
    </div>
  );
}
