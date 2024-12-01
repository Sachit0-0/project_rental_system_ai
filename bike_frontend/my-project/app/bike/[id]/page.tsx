"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "react-query";
import { Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchBikeDetails } from "@/lib/api/bikes";
import { rentBike } from "@/lib/api/rent";
import SimilarBikesSection from "@/components/ui/similarbikesection";
import ReviewSection from "@/components/ui/reviewSection";

const BikeDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const bikeId = Array.isArray(id) ? id[0] : id;
  const [isRenting, setIsRenting] = useState(false);
  const [rentalDays, setRentalDays] = useState<number>(1);

  const token =
    (typeof window !== "undefined" && localStorage.getItem("token")) || "";

  const { data: bike, isLoading } = useQuery(
    ["bike", bikeId],
    () => fetchBikeDetails(bikeId),
    { enabled: !!bikeId }
  );

  const handleRent = async () => {
    if (!token) return alert("Please log in to rent a bike.");

    setIsRenting(true);
    try {
      const rentalData = await rentBike(bikeId, token, rentalDays);
      alert(`Successfully rented: ${rentalData.id}`);
      router.push("/profile");
    } catch (err: any) {
      alert(
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.message || "Renting failed."
      );
    } finally {
      setIsRenting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <AspectRatio ratio={4 / 3}>
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 w-full h-full" />
              ) : bike?.image ? (
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                  No Image Available
                </div>
              )}
            </AspectRatio>
            ss
          </div>
          <CardContent className="md:w-1/2 p-6">
            <CardHeader className="p-0">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2">{bike?.bike_type || "Bike"}</Badge>
                  <h1 className="text-3xl font-bold">
                    {bike?.name || "Loading..."}
                  </h1>
                </div>
                <div className="text-2xl font-bold">
                  Rs.{bike?.price_per_hour || "0.00"}
                </div>
              </div>
              s
            </CardHeader>
            <div className="flex items-center mt-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    bike?.availability ? "fill-primary" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {bike?.reviews?.length}
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              {isLoading
                ? "Loading description..."
                : bike?.description ||
                  "This bike is perfect for your next adventure!"}
            </p>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Model:</span>
                <span>{bike?.model || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Type:</span>
                <span>{bike?.bike_type || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Availability:</span>
                <span>
                  {bike?.availability ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center mb-4">
              <label className="mr-2 font-semibold">Rental Days:</label>
              <Button
                onClick={() => setRentalDays((prev) => Math.max(prev - 1, 1))}
                disabled={rentalDays <= 1}
              >
                -
              </Button>
              <span className="mx-2">{rentalDays}</span>
              <Button onClick={() => setRentalDays((prev) => prev + 1)}>
                +
              </Button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Total Price:</span>
              <span>
                {(bike?.price_per_hour as any) * rentalDays || "0.00"}
              </span>
            </div>
            <CardFooter className="p-0">
              <Button
                className="w-full"
                onClick={handleRent}
                disabled={!bike?.availability || isRenting}
              >
                {isRenting ? "Renting..." : "Rent Now"}
              </Button>
            </CardFooter>
          </CardContent>
        </div>
      </Card>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReviewSection bikeId={bikeId} token={token} />
        <div>
          <h3 className="text-xl font-semibold mb-4">Similar Bikes</h3>
          <SimilarBikesSection bikeId={bikeId} token={token} />
        </div>
      </div>
    </div>
  );
};

export default BikeDetail;
