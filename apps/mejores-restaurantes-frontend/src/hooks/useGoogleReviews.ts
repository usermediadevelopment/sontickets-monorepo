// useGoogleReviews.ts

import { useState, useEffect } from "react";

type Review = {
  author_name: string;
  author_url: string;
  language: string;
  original_language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  translated: boolean;
};

interface GooglePlace {
  reviews: Review[];
  rating: number;
}

interface UseGoogleReviewsProps {
  placeId: string;
}

const useGoogleReviews = ({ placeId }: UseGoogleReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?placeId=${placeId}`);

        const data: GooglePlace = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        setReviews(data.reviews);
        setRating(data.rating);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId]);

  return { reviews, rating, loading, error };
};

export default useGoogleReviews;
