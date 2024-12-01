const api = process.env.NEXT_PUBLIC_API_URL;

type TBike = {
  id: number;
  bike_type: "bike" | "scooter";
  availability: boolean;
  name: string;
  model: string;
  price_per_hour: string;
  image: string | null;
  description: string;
  reviews: {
    id: number;
    bike: number;
    user: {
      id: number;
      username: string;
    };
    text: string;
    rating: number;
    created_at: string;
  }[];
};

export async function fetchBikes() {
  const res = await fetch(`${api}/bikes`);
  const data: Promise<TBike[]> = res.json();
  return data;
}

export async function fetchBikeDetails(id: string) {
  const res = await fetch(`${api}/bikes/${id}/`);
  if (!res.ok) {
    throw new Error("Failed to fetch bike details");
  }
  const data: TBike = await res.json();
  return data;
}
