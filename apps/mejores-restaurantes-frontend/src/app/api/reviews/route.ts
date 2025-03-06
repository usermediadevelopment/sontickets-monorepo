const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

interface GoogleApiResponse {
  status: string;
  result: {
    reviews: Review[];
  };
  error_message?: string;
}

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("placeId");

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data: GoogleApiResponse = await response.json();

    return Response.json(data.result);
  } catch (error: unknown) {
    return Response.json({
      reviews: [],
      rating: 0,
      error:
        error instanceof Error ? error.message : "An unknown error occurre",
    });
  }
}
