'use client'
import { signIn, useSession } from 'next-auth/react';
import Recording from './Recording';
export default function Page() {
    const { data: session, status } = useSession();
    if (status === 'loading') {
        return <div>Loading...</div>;
    }
    if (!session) {
        return (
            <div className='flex flex-col min-h-screen justify-center items-center'>
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
    <div className='flex flex-col min-h-screen justify-center items-center'>
      <h1>Record Video & Audio</h1>

    {session && <Recording />}
     
    </div>
  );
}

