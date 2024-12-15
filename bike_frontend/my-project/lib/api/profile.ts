const api = process.env.NEXT_PUBLIC_API_URL;

type TRental = {
  id: number;
  bike: {
    id: number;
    name: string;
    model: string;
    bike_type: string;
    availability: boolean;
    price_per_hour: string;
    image: string | null;
    description: string;
  };
  start_time: string;
  end_time: string | null;
  total_price: string | null;
};

type TUserProfile = {
  user_info: {
    username: string;
    email: string;
  };
  rental_history: TRental[];
};

export async function fetchUserProfile(token: string): Promise<TUserProfile> {
  const res = await fetch(`${api}/profile/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to fetch user profile.");
  }

  return res.json();
}
