'use client';

import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header>
        <nav>
            <Link href="/" className="logo">
            <Image src="/icons/logo.png" alt="DevHubLogo" width={24} height={24} />
            <p>DevsEvents</p>
            </Link>

            <ul>
                <Link href="/">Home</Link>
                <Link href="/#events">Events</Link>
                {status === 'authenticated' && (
                  <Link href="/dashboard">Dashboard</Link>
                )}
                
                {status === 'unauthenticated' && (
                  <>
                    <Link href="/auth/signin">Sign In</Link>
                    <Link href="/auth/signup">Sign Up</Link>
                  </>
                )}

                {status === 'authenticated' && (
                  <button 
                    onClick={() => signOut()}
                    className="text-red-500 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                )}
            </ul>
        </nav>
    </header>
  )
}

export default Navbar
