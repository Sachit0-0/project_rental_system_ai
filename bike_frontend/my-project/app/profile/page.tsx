"use client";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "react-query";
import { fetchUserProfile } from "@/lib/api/profile";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { isAuthenticated } = useAuth();

  const { data: profile, isLoading } = useQuery(
    "userProfile",
    async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      return fetchUserProfile(token);
    },
    { enabled: isAuthenticated }
  );

  if (isLoading) return <span>Loading...</span>;

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Link href="http://localhost:8000/admin">
          <Button>Admin</Button>
        </Link>
        <h2 className="text-3xl font-bold text-black mb-8 text-center">
          User Profile
        </h2>
        {profile ? (
          <>
            <div className="bg-gray-100 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-black mb-2">
                User Info
              </h3>
              <p className="text-gray-600 mb-2">
                Username: {profile.user_info.username}
              </p>
              <p className="text-gray-600 mb-2">
                Email: {profile.user_info.email}
              </p>
            </div>
            <h2 className="text-2xl font-bold text-black mb-8 text-center mt-10">
              Rental History
            </h2>
            <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.rental_history?.length ? (
                profile.rental_history.map((rental) => (
                  <div
                    key={rental.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 transition-transform transform hover:scale-105 hover:bg-gray-50"
                  >
                    <div className="flex items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold">
                          {rental.bike.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {rental.bike.model}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {rental.bike.bike_type}
                      </p>
                      <p>
                        <span className="font-medium">Availability:</span>{" "}
                        {rental.bike.availability ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">Price per Hour:</span>{" "}
                        {rental.bike.price_per_hour}
                      </p>
                      <p>
                        <span className="font-medium">Start Time:</span>{" "}
                        {new Date(rental.start_time).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">End Time:</span>{" "}
                        {rental.end_time
                          ? new Date(rental.end_time).toLocaleString()
                          : "Ongoing"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 mb-4 text-center">
                  No rental history available.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-600 mb-4">No profile data available.</p>
        )}
      </div>
    </section>
  );
}
