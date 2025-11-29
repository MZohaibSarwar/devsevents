import Image from "next/image"
import Link from "next/link"

function Navbar() {
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
                <Link href="/#create-events">Create Events</Link>
            </ul>
        </nav>
    </header>
  )
}

export default Navbar
