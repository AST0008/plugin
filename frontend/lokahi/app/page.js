"use client";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  "english",
  "hindi",
  "bengali",
  "kannada",
  "malayalam",
  "odia",
  "punjabi",
  "tamil",
  "telugu",
  "gujarati",
  "marathi",
];

export default function Profile() {
  const { data: session, status } = useSession();
  const [language, setLanguage] = useState("english");
  const router = useRouter();

  const handleClick = (lang) => {
    setLanguage(lang);
    console.log(language);  
    router.push("/video");
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center space-y-4">
        <h1 className="text-3xl font-semibold">Not signed in</h1>
        <button className="btn btn-primary" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center text-2xl">
        <div className="w-full max-w-xs">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-accent w-full text-white">
              Select your Preferred Language
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box w-full p-2 shadow-lg"
            >
              {languages.map((lang) => (
                <li key={lang} className="hover:bg-accent hover:text-white">
                  <button
                    onClick={() => handleClick(lang)}
                    className="w-full text-left py-2 px-4"
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* <div className="mt-4 text-lg">
            <span className="font-semibold">Selected Language: </span>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </div> */}
        </div>
      </div>
    </>
  );
}
