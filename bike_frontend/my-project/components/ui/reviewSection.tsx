import {
  createReview,
  fetchReviews,
  TCreateReview,
  TReview,
} from "@/lib/api/review";
import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";

type ReviewSectionProps = {
  bikeId: string;
  token: string;
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ bikeId, token }) => {
  const [reviews, setReviews] = useState<TReview[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !bikeId) return;
    setLoading(true);
    setError(null);

    fetchReviews(bikeId, token)
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => {
        setError("Failed to fetch reviews: " + err.message);
      })
      .finally(() => setLoading(false));
  }, [bikeId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !rating) {
      alert("Please fill in all fields!");
      return;
    }

    setLoading(true);
    const newReview: TCreateReview = {
      bike_id: Number(bikeId),
      text,
      rating,
    };

    try {
      const createdReview = await createReview(
        newReview,
        Number(bikeId),
        token
      );
      setReviews((prev) => [createdReview, ...prev]);
      setText("");
      setRating(1);
    } catch (err: any) {
      setError(err?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reviews.length) return <TailSpin />;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl font-bold text-secondary">Customer Insight</h3>

      {error && <p className="text-red-500">{error}</p>}

      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review.id}
            className="flex flex-col gap-2 border-b border-gray-300 p-4 bg-black text-white"
          >
            <p className="font-bold">{review.user.username}</p>
            <p>{review.text}</p>
            <p>Rating: {review.rating}/5</p>
          </div>
        ))
      ) : (
        <p className="text-center">No reviews yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-black">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review here..."
          required
          className="p-2 border border-gray-300 rounded bg-black text-white"
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
          className="p-2 border border-gray-300 rounded bg-black text-white"
        >
          <option value="0">Rate the bike</option>
          {[1, 2, 3, 4, 5].map((rate) => (
            <option key={rate} value={rate}>
              {rate}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !text || rating === 0}
          className="bg-black text-black p-2 rounded hover:bg-gray-700 disabled:bg-gray-300"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewSection;
