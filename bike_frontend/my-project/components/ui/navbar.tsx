"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <div className="text-2xl font-bold">
          <Link href="/">Bike Rentals</Link>
        </div>
        <div className="space-x-4 flex items-center">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/bikes" className="nav-link">
            Bikes
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-link">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="nav-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
