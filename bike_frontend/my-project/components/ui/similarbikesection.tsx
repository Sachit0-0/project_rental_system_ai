"use client";
import React from "react";
import { useQuery } from "react-query";
import { fetchSimilarBikes } from "@/lib/api/recommend";
import { useParams } from "next/navigation";
import Link from "next/link";

type TBike = {
  id: number;
  bike_type: "bike" | "scooter";
  availability: boolean;
  name: string;
  model: string;
  price_per_hour: string;
  image: string | null;
  description: string;
};

interface SimilarProps {
  bikeId: string;
  token: string;
}

const SimilarBikesSection: React.FC<SimilarProps> = ({ bikeId, token }) => {
  const { data: similarBikes, isLoading } = useQuery(
    ["similarBikes", bikeId],
    () => fetchSimilarBikes(token, bikeId),
    {
      enabled: !!bikeId,
    }
  );

  if (isLoading) return <p>Loading similar bikes...</p>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Similar Bikes</h3>
      {similarBikes && similarBikes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {similarBikes.slice(0, 3).map((bike: TBike) => (
            <Link key={bike.id} href={`/bike/${bike.id}`}>
              <div className="bg-gray-800 text-white p-4 rounded cursor-pointer">
                <h4 className="text-lg font-bold">{bike.name}</h4>
                <p>Model: {bike.model}</p>
                <p>Type: {bike.bike_type}</p>
                <p>Price per Day: Rs.{bike.price_per_hour}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No similar bikes found.</p>
      )}
    </div>
  );
};

export default SimilarBikesSection;
