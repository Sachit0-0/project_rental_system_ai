export const api = process.env.NEXT_PUBLIC_API_URL;

export type TReview = {
  id: number;
  bike_id: number;
  user: any;
  text: string;
  rating: number;
  created_at: string;
};

export type TCreateReview = {
  bike_id: number;
  text: string;
  rating: number;
};

// Fetch reviews by bike ID
export const fetchReviews = async (bikeId: string, token: string) => {
  const response = await fetch(`${api}/reviews/?bike_id=${bikeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
};
// Create a new review

export const createReview = async (
  review: Omit<TCreateReview, "bike_id">,
  bikeId: number,
  token: string
) => {
  const response = await fetch(`${api}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bike: bikeId, // This is important: Ensure 'bike' is being sent correctly.
      text: review.text,
      rating: review.rating,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error creating review:", errorData);
    throw new Error(
      `Failed to create review: ${errorData.error || "Unknown error"}`
    );
  }

  return response.json();
};
